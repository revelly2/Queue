-- =============================================================================
-- QueUA — Migration 0007: counter console queue actions (PRD FR-3.x)
--
-- All actions run as SECURITY DEFINER, hardened with search_path = '' and
-- revoked from public + anon (granted to authenticated, then role/access-gated
-- inside). Access is enforced per counter+module via counter_ticket_access():
--   WRITE -> call_next, recall, hold/resume, complete
--   FULL  -> transfer, no_show
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- Caller holds a registrar/admin role?
create or replace function public.is_registrar()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid()))
      in ('REGISTRAR_OFFICER'::public.app_role,
          'REGISTRAR_ADMIN'::public.app_role,
          'SYSTEM_ADMIN'::public.app_role),
    false);
$$;

-- Highest access level a counter has over a ticket (via the ticket's services'
-- modules). NULL if the counter cannot serve the ticket at all.
create or replace function public.counter_ticket_access(p_counter_id bigint, p_ticket_id bigint)
returns public.access_level language sql stable security definer set search_path = '' as $$
  select max(cm.access_level)
  from public.counter_modules cm
  join public.module_services ms on ms.module_id = cm.module_id
  join public.ticket_items ti on ti.service_id = ms.service_id
  where cm.counter_id = p_counter_id and ti.ticket_id = p_ticket_id;
$$;

-- Assert caller is a registrar and the counter's access over the ticket meets
-- the minimum. Raises on failure. Returns nothing.
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
  v_access := public.counter_ticket_access(v_counter, p_ticket_id);
  if v_access is null or v_access < p_min then
    raise exception 'Counter lacks % access for this ticket (has %)', p_min, coalesce(v_access::text, 'none')
      using errcode = '42501';
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- call_next_ticket — pull the oldest eligible, paid/free ticket for a counter.
-- ----------------------------------------------------------------------------
create or replace function public.call_next_ticket(p_counter_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id bigint;
  v_t  public.tickets%rowtype;
begin
  if not public.is_registrar() then
    raise exception 'Registrar role required' using errcode = '42501';
  end if;

  select t.id into v_id
  from public.tickets t
  where t.queue_status = 'QUEUED'::public.queue_status
    and t.payment_status <> 'PAYMENT_PENDING'::public.payment_status  -- payment gate
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

-- ----------------------------------------------------------------------------
-- recall_ticket — re-announce; bumps recall_count (WRITE).
-- ----------------------------------------------------------------------------
create or replace function public.recall_ticket(p_ticket_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_t public.tickets%rowtype;
begin
  perform public.assert_counter_access(p_ticket_id, 'WRITE'::public.access_level);
  update public.tickets
  set recall_count = recall_count + 1,
      queue_status = 'SERVING'::public.queue_status
  where id = p_ticket_id returning * into v_t;
  return jsonb_build_object('ticket_number', v_t.ticket_number, 'recall_count', v_t.recall_count);
end;
$$;

-- ----------------------------------------------------------------------------
-- hold_ticket / resume_ticket (WRITE).
-- ----------------------------------------------------------------------------
create or replace function public.hold_ticket(p_ticket_id bigint, p_reason text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_t public.tickets%rowtype;
begin
  perform public.assert_counter_access(p_ticket_id, 'WRITE'::public.access_level);
  update public.tickets
  set queue_status = 'ON_HOLD'::public.queue_status,
      hold_reason  = nullif(btrim(p_reason), '')
  where id = p_ticket_id returning * into v_t;
  return jsonb_build_object('ticket_number', v_t.ticket_number, 'queue_status', v_t.queue_status);
end;
$$;

create or replace function public.resume_ticket(p_ticket_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_t public.tickets%rowtype;
begin
  perform public.assert_counter_access(p_ticket_id, 'WRITE'::public.access_level);
  update public.tickets
  set queue_status = 'SERVING'::public.queue_status, hold_reason = null
  where id = p_ticket_id returning * into v_t;
  return jsonb_build_object('ticket_number', v_t.ticket_number, 'queue_status', v_t.queue_status);
end;
$$;

-- ----------------------------------------------------------------------------
-- complete_ticket (WRITE).
-- ----------------------------------------------------------------------------
create or replace function public.complete_ticket(p_ticket_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_t public.tickets%rowtype;
begin
  perform public.assert_counter_access(p_ticket_id, 'WRITE'::public.access_level);
  update public.tickets
  set queue_status = 'COMPLETED'::public.queue_status, completed_at = now()
  where id = p_ticket_id returning * into v_t;
  return jsonb_build_object('ticket_number', v_t.ticket_number, 'queue_status', v_t.queue_status);
end;
$$;

-- ----------------------------------------------------------------------------
-- transfer_ticket — requeue to another counter that can serve it (FULL).
-- ----------------------------------------------------------------------------
create or replace function public.transfer_ticket(p_ticket_id bigint, p_target_counter_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_t public.tickets%rowtype;
begin
  perform public.assert_counter_access(p_ticket_id, 'FULL'::public.access_level);
  if public.counter_ticket_access(p_target_counter_id, p_ticket_id) is null then
    raise exception 'Target counter cannot serve this ticket' using errcode = '22023';
  end if;
  update public.tickets
  set counter_id   = p_target_counter_id,
      queue_status = 'QUEUED'::public.queue_status,
      served_by    = null, called_at = null, recall_count = 0, hold_reason = null
  where id = p_ticket_id returning * into v_t;
  return jsonb_build_object('ticket_number', v_t.ticket_number, 'counter_id', v_t.counter_id,
                            'queue_status', v_t.queue_status);
end;
$$;

-- ----------------------------------------------------------------------------
-- mark_no_show — only after the recall threshold (FULL). Default 3 recalls.
-- ----------------------------------------------------------------------------
create or replace function public.mark_no_show(p_ticket_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_t public.tickets%rowtype;
begin
  perform public.assert_counter_access(p_ticket_id, 'FULL'::public.access_level);
  select * into v_t from public.tickets where id = p_ticket_id;
  if v_t.recall_count < 3 then
    raise exception 'Ticket % has only % recall(s); needs 3 before No-Show',
      v_t.ticket_number, v_t.recall_count using errcode = '22023';
  end if;
  update public.tickets
  set queue_status = 'NO_SHOW'::public.queue_status, completed_at = now()
  where id = p_ticket_id returning * into v_t;
  return jsonb_build_object('ticket_number', v_t.ticket_number, 'queue_status', v_t.queue_status);
end;
$$;

-- ----------------------------------------------------------------------------
-- set_counter_status (registrar).
-- ----------------------------------------------------------------------------
create or replace function public.set_counter_status(p_counter_id bigint, p_status public.counter_status)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_c public.counters%rowtype;
begin
  if not public.is_registrar() then
    raise exception 'Registrar role required' using errcode = '42501';
  end if;
  update public.counters set status = p_status where id = p_counter_id returning * into v_c;
  if not found then
    raise exception 'Counter % not found', p_counter_id using errcode = 'P0002';
  end if;
  return jsonb_build_object('counter_id', v_c.id, 'status', v_c.status);
end;
$$;

-- ----------------------------------------------------------------------------
-- Grants: authenticated only; never anon/public (internal checks gate further).
-- ----------------------------------------------------------------------------
do $$
declare fn text;
begin
  foreach fn in array array[
    'public.call_next_ticket(bigint)',
    'public.recall_ticket(bigint)',
    'public.hold_ticket(bigint, text)',
    'public.resume_ticket(bigint)',
    'public.complete_ticket(bigint)',
    'public.transfer_ticket(bigint, bigint)',
    'public.mark_no_show(bigint)',
    'public.set_counter_status(bigint, public.counter_status)'
  ] loop
    execute format('revoke all on function %s from public, anon;', fn);
    execute format('grant execute on function %s to authenticated;', fn);
  end loop;
end $$;

-- Internal helpers: never exposed to anon/public.
revoke all on function public.is_registrar() from public, anon;
revoke all on function public.counter_ticket_access(bigint, bigint) from public, anon;
revoke all on function public.assert_counter_access(bigint, public.access_level) from public, anon;
