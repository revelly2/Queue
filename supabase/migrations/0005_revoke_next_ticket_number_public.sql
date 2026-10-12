-- =============================================================================
-- QueUA — Migration 0005: fully lock down next_ticket_number
--
-- 0004 revoked `anon` from next_ticket_number, but the function still carried
-- Postgres's default EXECUTE-to-PUBLIC grant (never removed in 0002), which
-- anon inherits. Revoking the role alone does not remove a PUBLIC-inherited
-- privilege. Revoke from PUBLIC so only the owner (and thus create_checkin,
-- which calls it as SECURITY DEFINER) can execute it.
-- =============================================================================

revoke execute on function public.next_ticket_number(public.service_category)
  from public;
