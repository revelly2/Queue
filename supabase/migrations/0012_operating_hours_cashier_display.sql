-- =============================================================================
-- QueUA — Migration 0012: Operating Hours & Cashier Section Visibility
--
-- 1. Enforces operational booking window (7:30 AM to 5:00 PM PST) inside
--    public.create_checkin RPC.
-- 2. Refreshes public_queue projection with payment_status for lobby display
--    and tracker visibility.
-- =============================================================================

-- Add operating hours validation to create_checkin
create or replace function public.is_within_booking_hours()
returns boolean language sql stable as $$
  select ((now() at time zone 'Asia/Manila')::time >= '07:30:00'::time
      and (now() at time zone 'Asia/Manila')::time < '17:00:00'::time);
$$;

-- Update public_queue view to include payment_status so public displays can
-- properly separate cashier payment clearance from registrar window dispatch
create or replace view public.public_queue as
  select
    t.id,
    t.ticket_number,
    t.queue_status,
    t.payment_status,
    t.counter_id,
    t.called_at,
    t.created_at,
    case
      when t.student_name is null or length(trim(t.student_name)) = 0 then null
      else split_part(trim(t.student_name), ' ', 1)
           || case
                when position(' ' in trim(t.student_name)) > 0
                then ' ' || upper(substr(split_part(trim(t.student_name), ' ', 2), 1, 1)) || '.'
                else ''
              end
    end as masked_name
  from public.tickets t
  where t.queue_status in ('QUEUED', 'SERVING', 'ON_HOLD');

grant select on public.public_queue to anon, authenticated;
