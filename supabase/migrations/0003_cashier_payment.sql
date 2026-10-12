-- =============================================================================
-- QueUA — Migration 0003: cashier payment clearance (PRD FR-2.x, Workflow 1)
-- Adds the PAYMENT_PENDING -> PAID transition with accountability fields.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Accountability columns (extends PRD §7) — who cleared the payment and when.
-- Feeds FR-5.3 analytics and provides an audit trail.
-- ----------------------------------------------------------------------------
alter table public.tickets
  add column paid_at    timestamptz,
  add column cashier_id uuid references public.profiles (id) on delete set null;

-- ----------------------------------------------------------------------------
-- confirm_payment — cashier clears a ticket's assessed fee.
--
-- The vetted path for FR-2.2/FR-2.3: validates the caller is a cashier/admin,
-- allows only the PAYMENT_PENDING -> PAID transition, and stamps the cashier
-- id + timestamp. Once PAID the ticket is eligible for the registrar pool
-- (Realtime broadcasts the update to dashboards).
--
-- NOTE (hardening follow-up): base-table RLS still allows staff broad UPDATE
-- on tickets. Routing ALL mutations through RPCs and narrowing that policy is
-- a later pass; this RPC is the intended application path meanwhile.
-- ----------------------------------------------------------------------------
create or replace function public.confirm_payment(p_ticket_number text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_role   public.app_role := public.current_app_role();
  v_ticket public.tickets%rowtype;
begin
  if v_role is null
     or v_role not in ('CASHIER'::public.app_role,
                       'REGISTRAR_ADMIN'::public.app_role,
                       'SYSTEM_ADMIN'::public.app_role) then
    raise exception 'Only cashiers may confirm payments' using errcode = '42501';
  end if;

  select * into v_ticket
  from public.tickets
  where ticket_number = btrim(p_ticket_number);

  if not found then
    raise exception 'Ticket % not found', p_ticket_number using errcode = 'P0002';
  end if;

  if v_ticket.payment_status = 'PAID'::public.payment_status then
    raise exception 'Ticket % is already paid', p_ticket_number using errcode = '22023';
  end if;
  if v_ticket.payment_status <> 'PAYMENT_PENDING'::public.payment_status then
    raise exception 'Ticket % is not awaiting payment (status: %)',
      p_ticket_number, v_ticket.payment_status using errcode = '22023';
  end if;

  update public.tickets
  set payment_status = 'PAID'::public.payment_status,
      paid_at        = now(),
      cashier_id     = auth.uid()
  where id = v_ticket.id
  returning * into v_ticket;

  return jsonb_build_object(
    'ticket_id',      v_ticket.id,
    'ticket_number',  v_ticket.ticket_number,
    'payment_status', v_ticket.payment_status,
    'paid_at',        v_ticket.paid_at,
    'total_assessed', v_ticket.total_assessed
  );
end;
$$;

revoke all on function public.confirm_payment(text) from public;
grant execute on function public.confirm_payment(text) to authenticated;
