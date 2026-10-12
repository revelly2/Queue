# QueUA — Local Setup

Next.js 16 (App Router) + Supabase (Postgres, Realtime, Auth).

## 1. Environment variables

Copy the example and fill in the anon key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
**Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`**.
`.env.local` is gitignored — never commit real keys.

## 2. Apply the database schema + seed

Pick **one** path.

### Option A — Supabase SQL Editor (no CLI)

1. Open the Supabase Dashboard → **SQL Editor**.
2. Paste the contents of `supabase/migrations/0001_init.sql`, run it.
3. Paste the contents of `supabase/seed.sql`, run it.

### Option B — Supabase CLI (reproducible)

```bash
# one-time: link the local project to the remote
npx supabase login
npx supabase link --project-ref xeldzlyrkeolyefmusgc

# push the migration, then load seed data
npx supabase db push
npx supabase db execute --file supabase/seed.sql
```

> The CLI path assumes `supabase/config.toml`. If you prefer the CLI, run
> `npx supabase init` once to generate it, then the commands above.

## 3. Run the app

```bash
npm run dev
```

App boots at http://localhost:3000. (No feature screens yet — this increment
is schema + seed only.)

## What this increment delivers

- Supabase client helpers: `utils/supabase/{server,client,middleware}.ts`,
  root `middleware.ts` (session refresh).
- Schema: `supabase/migrations/0001_init.sql`
  (`services`, `tickets`, `ticket_items`, `counters`, `profiles` + enums,
  indexes, RLS, the `public_queue` PII-safe view, Realtime publication).
- Seed: `supabase/seed.sql` — full Category A/B/C catalog + 3 sample windows.
- Shared TS enums: `lib/db/enums.ts`.

## Open decisions flagged for review (before next increment)

1. **`profiles` + `app_role`** — added to satisfy `assigned_staff_id` and the
   RBAC NFR, which the PRD left undefined. Confirm the five roles and the
   self-escalation guard.
2. **Anonymous kiosk check-in** — anon ticket INSERT is deliberately *not*
   allowed by RLS. Decide: privileged `SECURITY DEFINER` RPC vs. trusted
   service-role kiosk server. Gates Module 1.
3. **Public name masking** — `public_queue` renders `"Mark C."`. Confirm this
   matches the registrar's PII policy (NFR §8).
