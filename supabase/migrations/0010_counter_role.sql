-- =============================================================================
-- QueUA — Migration 0010: add the COUNTER role
-- A counter-station login. Must be committed before it can be referenced
-- (hence its own migration), so 0011 wires up the behavior.
-- =============================================================================

alter type public.app_role add value if not exists 'COUNTER';
