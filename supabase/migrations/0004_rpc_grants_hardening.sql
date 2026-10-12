-- =============================================================================
-- QueUA — Migration 0004: tighten RPC execute grants
--
-- Supabase's default privileges grant EXECUTE on new public-schema functions
-- to anon + authenticated. `revoke ... from public` does NOT remove those
-- role-specific grants, so staff-only / internal functions remained invocable
-- by anon (the internal role check still rejected them, but they shouldn't be
-- reachable at all). This revokes execute explicitly.
--
--   confirm_payment    -> staff only (authenticated keeps it)
--   next_ticket_number -> internal only; create_checkin calls it as its
--                         SECURITY DEFINER owner, so no caller grant is needed
-- create_checkin stays executable by anon by design (the kiosk).
-- =============================================================================

revoke execute on function public.confirm_payment(text) from anon;

revoke execute on function public.next_ticket_number(public.service_category)
  from anon, authenticated;
