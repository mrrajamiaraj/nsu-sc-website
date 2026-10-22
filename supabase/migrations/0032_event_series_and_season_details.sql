-- Events are organised as series (e.g. "NSU Basketball League", NBL) with one
-- `events` row per season. Existing events keep working without a series.
create table event_series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text not null,
  sport text null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index event_series_abbreviation_key on event_series (upper(abbreviation));

alter table event_series enable row level security;

create policy event_series_public_select on event_series for select using (true);
create policy event_series_authenticated_insert on event_series for insert to authenticated with check (true);
create policy event_series_authenticated_update on event_series for update to authenticated using (true);
create policy event_series_authenticated_delete on event_series for delete to authenticated using (true);

alter table events
  add column series_id uuid null references event_series(id) on delete set null,
  add column season_number int null check (season_number > 0),
  add column registration_opens date null,
  add column registration_deadline date null,
  add column registration_url text null,
  add column match_count int null check (match_count >= 0),
  add column prize_first text null,
  add column prize_second text null,
  add column prize_third text null,
  -- Photo URL -> caption, for the gallery on the season page.
  add column gallery_captions jsonb not null default '{}'::jsonb;

create index events_series_id_idx on events (series_id);
