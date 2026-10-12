-- =============================================================================
-- QueUA — Migration 0002: secure kiosk check-in
-- The single, vetted write-path for anonymous kiosk ticket creation.
-- Implements PRD Workflows 1 & 2 and the FR-1.x assessment/dispatch rules.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- tickets.category — ticket-level category (extends PRD §7).
-- A ticket is scoped to a single service category (its prefix is singular and
-- the paid/free workflows diverge). Storing it avoids a ticket_items join for
-- routing and "people ahead" counts. Nullable so staff-created rows (RLS) are
-- not forced to set it; the RPC always populates it.
-- ----------------------------------------------------------------------------
alter table public.tickets
  add column category public.service_category;

create index idx_tickets_category_queue
  on public.tickets (category, queue_status);

-- ----------------------------------------------------------------------------
-- Per-category ticket-number sequences (prefixes per PRD §4).
-- ----------------------------------------------------------------------------
create sequence public.ticket_seq_doc;  -- DOC-####
create sequence public.ticket_seq_enr;  -- ENR-####
create sequence public.ticket_seq_adm;  -- ADM-####

-- ----------------------------------------------------------------------------
-- next_ticket_number — format "<PREFIX>-<zero-padded serial>".
-- Not granted to anon; only reachable via create_checkin (runs as owner).
-- ----------------------------------------------------------------------------
create or replace function public.next_ticket_number(p_category public.service_category)
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_prefix text;
  v_seq    bigint;
begin
  case p_category
    when 'CREDENTIAL_DOCUMENT' then
      v_prefix := 'DOC'; v_seq := nextval('public.ticket_seq_doc');
    when 'ENROLLMENT_CHANGE' then
      v_prefix := 'ENR'; v_seq := nextval('public.ticket_seq_enr');
    when 'ADMINISTRATIVE_FORM' then
      v_prefix := 'ADM'; v_seq := nextval('public.ticket_seq_adm');
    else
      raise exception 'Unmapped service category: %', p_category;
  end case;

  return v_prefix || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- ----------------------------------------------------------------------------
-- create_checkin — the kiosk RPC.
--
-- Input:
--   p_student_id   text  (optional)
--   p_student_name text  (optional)
--   p_items        jsonb array of { "code": "<service code>", "quantity": <int> }
--
-- Server-authoritative: the client supplies only codes + quantities + student
-- info. Fees, ticket number, and statuses are all computed here; the client
-- cannot tamper with them. Single category per ticket is enforced.
--
-- Returns a jsonb assessment slip (ticket number, total, status, items, and
-- the count of people ahead) for the printed/QR ticket.
-- ----------------------------------------------------------------------------
create or replace function public.create_checkin(
  p_student_id   text,
  p_student_name text,
  p_items        jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_items        jsonb := coalesce(p_items, '[]'::jsonb);
  v_count        int   := jsonb_array_length(v_items);
  v_student_id   text  := nullif(btrim(p_student_id), '');
  v_student_name text  := nullif(btrim(p_student_name), '');
  v_category     public.service_category;
  v_total        numeric(10, 2) := 0;
  v_payment      public.payment_status;
  v_ticket_no    text;
  v_ticket_id    bigint;
  v_preceding    int;
  v_elem         jsonb;
  v_code         text;
  v_qty          int;
  v_svc          public.services%rowtype;
  v_line         numeric(10, 2);
  v_lines        jsonb := '[]'::jsonb;  -- working set incl. service_id
begin
  if v_count = 0 then
    raise exception 'No services selected' using errcode = '22023';
  end if;
  if v_count > 20 then
    raise exception 'Too many services in one check-in (max 20)' using errcode = '22023';
  end if;

  -- Pass 1: validate, enforce single category, compute fees.
  for v_elem in select value from jsonb_array_elements(v_items) as t(value)
  loop
    v_code := v_elem ->> 'code';
    v_qty  := coalesce((v_elem ->> 'quantity')::int, 1);

    if v_code is null then
      raise exception 'Each item requires a "code"' using errcode = '22023';
    end if;
    if v_qty < 1 or v_qty > 999 then
      raise exception 'quantity must be between 1 and 999 (got %)', v_qty using errcode = '22023';
    end if;

    select * into v_svc from public.services where code = v_code and is_active;
    if not found then
      raise exception 'Unknown or inactive service code: %', v_code using errcode = '23503';
    end if;

    if v_category is null then
      v_category := v_svc.category;
    elsif v_category <> v_svc.category then
      raise exception 'All services on one ticket must share a category (% vs %)',
        v_category, v_svc.category using errcode = '22023';
    end if;

    -- line = base_fee × quantity + (one docstamp per item)
    v_line := v_svc.base_fee * v_qty
              + case when v_svc.requires_docstamp then v_svc.docstamp_fee else 0 end;
    v_total := v_total + v_line;

    v_lines := v_lines || jsonb_build_object(
      'service_id',   v_svc.id,
      'code',         v_svc.code,
      'name',         v_svc.name,
      'quantity',     v_qty,
      'computed_fee', v_line
    );
  end loop;

  v_payment := case when v_total > 0 then 'PAYMENT_PENDING'::public.payment_status
                    else 'NOT_APPLICABLE'::public.payment_status end;

  v_ticket_no := public.next_ticket_number(v_category);

  insert into public.tickets (
    ticket_number, student_id, student_name, total_assessed,
    payment_status, queue_status, category
  )
  values (
    v_ticket_no, v_student_id, v_student_name, v_total,
    v_payment, 'QUEUED'::public.queue_status, v_category
  )
  returning id into v_ticket_id;

  -- Pass 2: persist line items.
  for v_elem in select value from jsonb_array_elements(v_lines) as t(value)
  loop
    insert into public.ticket_items (ticket_id, service_id, quantity_pages, computed_fee)
    values (
      v_ticket_id,
      (v_elem ->> 'service_id')::bigint,
      (v_elem ->> 'quantity')::int,
      (v_elem ->> 'computed_fee')::numeric
    );
  end loop;

  -- People ahead in the same category still waiting.
  select count(*) into v_preceding
  from public.tickets
  where category = v_category
    and queue_status in ('QUEUED'::public.queue_status, 'ON_HOLD'::public.queue_status)
    and id < v_ticket_id;

  return jsonb_build_object(
    'ticket_id',      v_ticket_id,
    'ticket_number',  v_ticket_no,
    'category',       v_category,
    'total_assessed', v_total,
    'payment_status', v_payment,
    'queue_status',   'QUEUED',
    'preceding_count', v_preceding,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'code',         e ->> 'code',
        'name',         e ->> 'name',
        'quantity',     (e ->> 'quantity')::int,
        'computed_fee', (e ->> 'computed_fee')::numeric
      )), '[]'::jsonb)
      from jsonb_array_elements(v_lines) as t(e)
    )
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- Grants: expose the RPC to the kiosk (anon) and signed-in staff only.
-- NOTE (follow-up): anon check-in has no abuse throttling yet. Before public
-- rollout, gate it (trusted-kiosk device key, rate limit, or captcha) — a bare
-- anon could otherwise spam tickets. Flagged for a later increment.
-- ----------------------------------------------------------------------------
revoke all on function public.create_checkin(text, text, jsonb) from public;
grant execute on function public.create_checkin(text, text, jsonb) to anon, authenticated;
