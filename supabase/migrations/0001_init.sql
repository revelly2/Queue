-- =============================================================================
-- QueUA — Registrar Queue Management & Monitoring System
-- Migration 0001: initial schema (service catalog, tickets, counters, RBAC)
-- Maps to PRD App_PRD.md §7 (Data Architecture). Read inline NOTEs — a few
-- decisions extend the PRD where it was silent; these are flagged for review.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Enums (PRD §7 "Key Field Enums")
-- ----------------------------------------------------------------------------
create type public.service_category as enum (
  'CREDENTIAL_DOCUMENT',   -- Category A (DOC-)
  'ENROLLMENT_CHANGE',     -- Category B (ENR-)
  'ADMINISTRATIVE_FORM'    -- Category C (ADM-)
);

create type public.payment_status as enum (
  'NOT_APPLICABLE',
  'PAYMENT_PENDING',
  'PAID'
);

create type public.queue_status as enum (
  'QUEUED',
  'SERVING',
  'ON_HOLD',
  'COMPLETED',
  'TRANSFERRED',
  'NO_SHOW'
);

create type public.counter_status as enum (
  'OPEN',
  'BUSY',
  'ON_BREAK',
  'CLOSED'
);

-- NOTE (extends PRD): the PRD references `assigned_staff_id` and mandates RBAC
-- (NFR §8) but defines no staff/role table. We add an app_role enum covering
-- the five §3 personas and a profiles table keyed to Supabase auth.users.
create type public.app_role as enum (
  'STUDENT',
  'REGISTRAR_OFFICER',
  'CASHIER',
  'REGISTRAR_ADMIN',
  'SYSTEM_ADMIN'
);

-- ----------------------------------------------------------------------------
-- profiles — one row per authenticated user, carries the RBAC role.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       public.app_role not null default 'STUDENT',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- services — the fee/catalog config table (PRD §4, §7).
-- ----------------------------------------------------------------------------
create table public.services (
  id               bigint generated always as identity primary key,
  code             varchar(32) not null unique,
  name             text not null,
  category         public.service_category not null,
  base_fee         numeric(10, 2) not null default 0,
  requires_docstamp boolean not null default false,
  docstamp_fee     numeric(10, 2) not null default 0,
  is_per_page      boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  constraint services_fee_nonneg check (base_fee >= 0 and docstamp_fee >= 0),
  constraint services_docstamp_consistent
    check (requires_docstamp = (docstamp_fee > 0))
);

-- ----------------------------------------------------------------------------
-- counters — service windows (PRD §7).
-- ----------------------------------------------------------------------------
create table public.counters (
  id                 bigint generated always as identity primary key,
  counter_number     int not null unique,
  label_name         text not null,
  assigned_staff_id  uuid references public.profiles (id) on delete set null,
  status             public.counter_status not null default 'CLOSED',
  -- PRD models allowed_categories as an array; we type it as the enum array.
  allowed_categories public.service_category[] not null default '{}',
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- tickets — one per student check-in (PRD §7).
-- ----------------------------------------------------------------------------
create table public.tickets (
  id             bigint generated always as identity primary key,
  ticket_number  varchar(16) not null unique,
  student_id     varchar(32),
  student_name   text,
  total_assessed numeric(10, 2) not null default 0,
  payment_status public.payment_status not null default 'NOT_APPLICABLE',
  queue_status   public.queue_status not null default 'QUEUED',
  counter_id     bigint references public.counters (id) on delete set null,
  created_at     timestamptz not null default now(),
  called_at      timestamptz,
  completed_at   timestamptz
);

-- ----------------------------------------------------------------------------
-- ticket_items — line items linking a ticket to requested services (PRD §7).
-- ----------------------------------------------------------------------------
create table public.ticket_items (
  id             bigint generated always as identity primary key,
  ticket_id      bigint not null references public.tickets (id) on delete cascade,
  service_id     bigint not null references public.services (id),
  quantity_pages int not null default 1,
  computed_fee   numeric(10, 2) not null default 0,
  constraint ticket_items_qty_positive check (quantity_pages >= 1),
  constraint ticket_items_fee_nonneg check (computed_fee >= 0)
);

-- ----------------------------------------------------------------------------
-- Indexes on hot query paths (dashboards, "call next", mobile tracker).
-- ----------------------------------------------------------------------------
create index idx_tickets_queue_status on public.tickets (queue_status);
create index idx_tickets_payment_status on public.tickets (payment_status);
create index idx_tickets_counter_id on public.tickets (counter_id);
create index idx_tickets_created_at on public.tickets (created_at);
create index idx_ticket_items_ticket_id on public.ticket_items (ticket_id);
create index idx_ticket_items_service_id on public.ticket_items (service_id);

-- ----------------------------------------------------------------------------
-- Role helper — reads the caller's role. SECURITY DEFINER so RLS policies on
-- profiles don't recurse when policies on other tables call it.
-- ----------------------------------------------------------------------------
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid())
      in ('REGISTRAR_OFFICER', 'CASHIER', 'REGISTRAR_ADMIN', 'SYSTEM_ADMIN'),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid())
      in ('REGISTRAR_ADMIN', 'SYSTEM_ADMIN'),
    false
  );
$$;

-- ----------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user is created.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
--   Conservative baseline. Public (anon) gets catalog + counters read and a
--   PII-free queue view only. All ticket writes are staff-only for now.
-- NOTE (open decision): kiosk check-in may be anonymous. Anonymous ticket
--   INSERT is intentionally NOT granted here — it should go through a
--   SECURITY DEFINER RPC or a trusted service-role server. Flagged for review
--   before Module 1 (kiosk) is built.
-- ----------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.services     enable row level security;
alter table public.counters     enable row level security;
alter table public.tickets      enable row level security;
alter table public.ticket_items enable row level security;

-- profiles: a user sees/updates their own row; admins see all.
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_app_role()); -- cannot self-escalate role

create policy profiles_admin_manage on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- services: public read of active catalog; admins manage.
create policy services_public_read on public.services
  for select to anon, authenticated
  using (true);

create policy services_admin_write on public.services
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- counters: public read (lobby display); staff/admin manage.
create policy counters_public_read on public.counters
  for select to anon, authenticated
  using (true);

create policy counters_staff_write on public.counters
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- tickets: staff only (full access). No anon/base-table access — the public
-- queue view below is the only anon-visible projection.
create policy tickets_staff_all on public.tickets
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ticket_items: staff only.
create policy ticket_items_staff_all on public.ticket_items
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- public_queue — PII-safe projection for the lobby display and mobile tracker.
-- NFR §8: public surfaces show ticket id + masked name only. Name is masked to
-- "<first word> <initial>." (e.g. "Mark C."). Owned by the migration role, so
-- it reads tickets regardless of the base-table RLS above; it exposes only the
-- safe columns selected here.
-- ----------------------------------------------------------------------------
create view public.public_queue as
  select
    t.id,
    t.ticket_number,
    t.queue_status,
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

-- ----------------------------------------------------------------------------
-- Realtime — publish tickets + counters so dashboards/lobby/mobile get the
-- ≤400ms push updates required by NFR §8. (supabase_realtime publication
-- exists by default on Supabase projects.)
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.counters;
