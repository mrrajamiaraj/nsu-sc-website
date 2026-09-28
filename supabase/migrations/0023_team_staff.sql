-- Team staff: links panel members to the teams they look after. The role is
-- derived from the member's tier — Executive = Team Manager, Sub-Executive =
-- Team In-charge — so name/photo/contacts always come from the member record.
-- Public reads go through members RLS, so only the active panel's staff show.
create table team_staff (
  team_id uuid not null references teams(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, member_id)
);

create index team_staff_member_idx on team_staff (member_id);

alter table team_staff enable row level security;

create policy team_staff_public_select on team_staff for select using (true);
create policy team_staff_authenticated_insert on team_staff for insert to authenticated with check (true);
create policy team_staff_authenticated_delete on team_staff for delete to authenticated using (true);
