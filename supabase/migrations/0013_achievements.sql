-- Not in the SRS §6 schema — added on request: a feed of achievement posts
-- (one per accomplishment) tagged to a team, distinct from the single
-- free-text `teams.achievement` field.
create table achievements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null,
  description text not null,
  photo text null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index achievements_date_idx on achievements (date desc);

alter table achievements enable row level security;

create policy achievements_public_select on achievements for select using (true);
create policy achievements_authenticated_insert on achievements for insert to authenticated with check (true);
create policy achievements_authenticated_update on achievements for update to authenticated using (true);
create policy achievements_authenticated_delete on achievements for delete to authenticated using (true);
