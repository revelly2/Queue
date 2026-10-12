-- =============================================================================
-- QueUA — Migration 0008: announcements (lobby display ticker, FR-4.1)
-- Public-readable active messages; admin-managed.
-- =============================================================================

create table public.announcements (
  id         bigint generated always as identity primary key,
  message    text not null,
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy announcements_public_read on public.announcements
  for select to anon, authenticated using (is_active);

create policy announcements_admin_write on public.announcements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.announcements (message, sort_order) values
  ('Office hours: Monday to Friday, 8:00 AM to 5:00 PM.', 1),
  ('Please have your documents and a valid ID ready before your number is called.', 2),
  ('Pay assessed fees at the Cashier before proceeding to the releasing window.', 3);
