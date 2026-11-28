-- DRAFT for review: not a migration, not applied anywhere.
-- What the Events page ("Matchday central") needs that the database doesn't store yet.
-- Once approved, move it to supabase/migrations/ with the next number, test it on a
-- Supabase branch first, and add the matching admin form fields.
--
-- Today lib/events-hub.ts classifies sport, type and code in code (by event id); the
-- columns below let the admin set them instead, and unlock fixtures, brackets, live
-- scores, slots and "Notify me".

-- 1. Classification and registration details on each event --------------------------
alter table public.events
  add column if not exists slug text unique,                      -- "nsu-chess-carrom-2026"
  add column if not exists code text unique,                      -- "NCC'26", unique per edition
  add column if not exists sports text[] not null default '{}',   -- {football}, {chess,carrom}
  add column if not exists event_type text
    check (event_type in ('intra', 'inter-batch', 'inter-university', 'festival')),
  add column if not exists registration_fee text,                 -- "Free", "500 BDT per team"
  add column if not exists team_size text,                        -- "7 + 3 subs"
  add column if not exists slots integer check (slots > 0),
  add column if not exists rules_url text;
-- Status stays derived from dates on the site; the stored `status` column can be dropped
-- once nothing reads it.

-- 2. Fixtures, results and the knockout bracket ---------------------------------------
create table if not exists public.event_matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  stage text not null,                    -- "Group A", "Quarter-final", "Final"
  round integer,                          -- bracket column, 1 = first knockout round
  slot integer,                           -- position within the round (for the bracket)
  starts_at timestamptz,
  court text,                             -- "Court 1", "NSU Outdoor"
  home text not null,
  away text not null,
  home_score text,                        -- text: "2", "145/6", "21-18, 21-15"
  away_score text,
  winner text check (winner in ('home', 'away', 'draw')),
  note text,                              -- "FT", "won on penalties"
  updated_at timestamptz not null default now()
);
create index if not exists event_matches_event on public.event_matches (event_id, starts_at);

-- 3. Individual awards (best player, top scorer…) -------------------------------------
create table if not exists public.event_awards (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  award text not null,                    -- "Player of the tournament"
  name text not null,
  player_id uuid references public.players (id) on delete set null,
  sort_order integer not null default 0
);

-- 4. Registered teams (for the "18 / 24 teams" slots bar) -----------------------------
-- Optional: a count the admin updates is enough if team names shouldn't be public.
alter table public.events add column if not exists slots_taken integer check (slots_taken >= 0);

-- 5. "Notify me" sign-ups --------------------------------------------------------------
create table if not exists public.event_notify_signups (
  id uuid primary key default gen_random_uuid(),
  contact text not null check (char_length(contact) between 5 and 120),  -- email or phone
  sports text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- RLS: public read for events, matches and awards; admin-only writes (see the open-write
-- RLS issue: today any signed-in account can write content). Sign-ups: insert only for
-- anon, read only for admins.
alter table public.event_matches enable row level security;
alter table public.event_awards enable row level security;
alter table public.event_notify_signups enable row level security;
create policy "event_matches_public_read" on public.event_matches for select to anon, authenticated using (true);
create policy "event_awards_public_read" on public.event_awards for select to anon, authenticated using (true);
create policy "notify_signups_insert" on public.event_notify_signups for insert to anon, authenticated with check (true);
