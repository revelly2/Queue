-- =============================================================================
-- QueUA — Migration 0011: counter-account behavior & lock
-- COUNTER accounts are staff that may only operate their own bound counter
-- (counters.assigned_staff_id = their uid).
-- =============================================================================

-- Include COUNTER in staff + registrar checks.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid()))
      in ('REGISTRAR_OFFICER'::public.app_role, 'CASHIER'::public.app_role,
          'REGISTRAR_ADMIN'::public.app_role, 'SYSTEM_ADMIN'::public.app_role,
          'COUNTER'::public.app_role),
    false);
$$;

create or replace function public.is_registrar()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid()))
      in ('REGISTRAR_OFFICER'::public.app_role, 'REGISTRAR_ADMIN'::public.app_role,
          'SYSTEM_ADMIN'::public.app_role, 'COUNTER'::public.app_role),
    false);
$$;

-- The counter this account is bound to (NULL if none / not a station).
create or replace function public.my_counter_id()
returns bigint language sql stable security definer set search_path = '' as $$
  select id from public.counters where assigned_staff_id = (select auth.uid()) limit 1;
$$;

revoke all on function public.my_counter_id() from public, anon;

-- ---- Re-define the mutating RPCs with the COUNTER lock ----

create or replace function public.assert_counter_access(
  p_ticket_id bigint, p_min public.access_level
) returns void language plpgsql stable security definer set search_path = '' as $$
declare
  v_counter bigint;
  v_access  public.access_level;
begin
  if not public.is_registrar() then
    raise exception 'Registrar role required' using errcode = '42501';
  end if;
  select counter_id into v_counter from public.tickets where id = p_ticket_id;
  if v_counter is null then
    raise exception 'Ticket % is not assigned to a counter', p_ticket_id using errcode = '22023';
  end if;
  if public.current_app_role() = 'COUNTER'::public.app_role
     and v_counter <> coalesce(public.my_counter_id(), -1) then
    raise exception 'This station can only operate its own counter' using errcode = '42501';
  end if;
  v_access := public.counter_ticket_access(v_counter, p_ticket_id);
  if v_access is null or v_access < p_min then
    raise exception 'Counter lacks % access for this ticket (has %)', p_min, coalesce(v_access::text, 'none')
      using errcode = '42501';
  end if;
end;
$$;

create or replace function public.call_next_ticket(p_counter_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id bigint;
  v_t  public.tickets%rowtype;
begin
  if not public.is_registrar() then
    raise exception 'Registrar role required' using errcode = '42501';
  end if;
  if public.current_app_role() = 'COUNTER'::public.app_role
     and p_counter_id <> coalesce(public.my_counter_id(), -1) then
    raise exception 'This station can only operate its own counter' using errcode = '42501';
  end if;

  select t.id into v_id
  from public.tickets t
  where t.queue_status = 'QUEUED'::public.queue_status
    and t.payment_status <> 'PAYMENT_PENDING'::public.payment_status
    and exists (
      select 1
      from public.ticket_items ti
      join public.module_services ms on ms.service_id = ti.service_id
      join public.counter_modules cm on cm.module_id = ms.module_id
      where ti.ticket_id = t.id
        and cm.counter_id = p_counter_id
        and cm.access_level in ('WRITE'::public.access_level, 'FULL'::public.access_level)
    )
  order by t.created_at asc, t.id asc
  limit 1
  for update skip locked;

  if v_id is null then
    return jsonb_build_object('ticket', null, 'message', 'No eligible tickets in queue');
  end if;

  update public.tickets
  set queue_status = 'SERVING'::public.queue_status,
      counter_id   = p_counter_id,
      served_by    = (select auth.uid()),
      called_at    = now(),
      recall_count = 0,
      hold_reason  = null
  where id = v_id
  returning * into v_t;

  return jsonb_build_object(
    'ticket', jsonb_build_object(
      'id', v_t.id, 'ticket_number', v_t.ticket_number,
      'student_name', v_t.student_name, 'student_id', v_t.student_id,
      'queue_status', v_t.queue_status, 'counter_id', v_t.counter_id
    )
  );
end;
$$;

create or replace function public.set_counter_status(p_counter_id bigint, p_status public.counter_status)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_c public.counters%rowtype;
begin
  if not public.is_registrar() then
    raise exception 'Registrar role required' using errcode = '42501';
  end if;
  if public.current_app_role() = 'COUNTER'::public.app_role
     and p_counter_id <> coalesce(public.my_counter_id(), -1) then
    raise exception 'This station can only operate its own counter' using errcode = '42501';
  end if;
  update public.counters set status = p_status where id = p_counter_id returning * into v_c;
  if not found then
    raise exception 'Counter % not found', p_counter_id using errcode = 'P0002';
  end if;
  return jsonb_build_object('counter_id', v_c.id, 'status', v_c.status);
end;
$$;
