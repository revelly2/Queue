-- =============================================================================
-- QueUA — Migration 0006: module system (scalable counter configuration)
--
-- Replaces the fixed counters.allowed_categories routing with admin-defined
-- "modules": named groupings of services assigned to counters, each assignment
-- carrying an access level (READ/WRITE/FULL). A counter's console shows exactly
-- its assigned modules; "Call Next" pulls only tickets whose service belongs to
-- one of them. Category remains for ticket prefix + paid/free billing.
--
-- Access level (per counter+module):
--   READ  = view the module's queue + ticket details
--   WRITE = READ + process tickets (Call Next, Recall, Hold/Resume, Complete)
--   FULL  = WRITE + Transfer, No-Show, and manage the module on that counter
-- =============================================================================

create type public.access_level as enum ('READ', 'WRITE', 'FULL');

-- ----------------------------------------------------------------------------
-- modules — admin-defined feature groupings.
-- ----------------------------------------------------------------------------
create table public.modules (
  id          bigint generated always as identity primary key,
  code        varchar(32) not null unique,
  name        text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- module_services — which services a module contains (many-to-many).
-- ----------------------------------------------------------------------------
create table public.module_services (
  module_id  bigint not null references public.modules (id) on delete cascade,
  service_id bigint not null references public.services (id) on delete cascade,
  primary key (module_id, service_id)
);
create index idx_module_services_service on public.module_services (service_id);

-- ----------------------------------------------------------------------------
-- counter_modules — assign a module to a counter with an access level.
-- ----------------------------------------------------------------------------
create table public.counter_modules (
  id           bigint generated always as identity primary key,
  counter_id   bigint not null references public.counters (id) on delete cascade,
  module_id    bigint not null references public.modules (id) on delete cascade,
  access_level public.access_level not null default 'WRITE',
  created_at   timestamptz not null default now(),
  unique (counter_id, module_id)
);
create index idx_counter_modules_module on public.counter_modules (module_id);

-- ----------------------------------------------------------------------------
-- tickets: fields the counter console needs (extends PRD §7).
--   recall_count -> drives the No-Show threshold (default 3 recalls)
--   served_by    -> which officer served it (FR-5.3 accountability)
--   hold_reason  -> optional note when a ticket is placed ON_HOLD
-- ----------------------------------------------------------------------------
alter table public.tickets
  add column recall_count int not null default 0,
  add column served_by    uuid references public.profiles (id) on delete set null,
  add column hold_reason  text;

-- ----------------------------------------------------------------------------
-- RLS: staff read the module config; only admins manage it.
-- ----------------------------------------------------------------------------
alter table public.modules         enable row level security;
alter table public.module_services enable row level security;
alter table public.counter_modules enable row level security;

create policy modules_staff_read on public.modules
  for select to authenticated using (public.is_staff());
create policy modules_admin_write on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy module_services_staff_read on public.module_services
  for select to authenticated using (public.is_staff());
create policy module_services_admin_write on public.module_services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy counter_modules_staff_read on public.counter_modules
  for select to authenticated using (public.is_staff());
create policy counter_modules_admin_write on public.counter_modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
