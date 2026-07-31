-- RLS: public read on content tables, writes restricted to the single authenticated admin.
alter table events enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table panels enable row level security;
alter table members enable row level security;
alter table registration_settings enable row level security;
alter table site_content enable row level security;
alter table admin_security enable row level security;
alter table audit_log enable row level security;
alter table blog_posts enable row level security;
alter table alumni enable row level security;
alter table sponsors enable row level security;

-- events
create policy events_public_select on events for select using (true);
create policy events_authenticated_insert on events for insert to authenticated with check (true);
create policy events_authenticated_update on events for update to authenticated using (true);
create policy events_authenticated_delete on events for delete to authenticated using (true);

-- teams
create policy teams_public_select on teams for select using (true);
create policy teams_authenticated_insert on teams for insert to authenticated with check (true);
create policy teams_authenticated_update on teams for update to authenticated using (true);
create policy teams_authenticated_delete on teams for delete to authenticated using (true);

-- players
create policy players_public_select on players for select using (true);
create policy players_authenticated_insert on players for insert to authenticated with check (true);
create policy players_authenticated_update on players for update to authenticated using (true);
create policy players_authenticated_delete on players for delete to authenticated using (true);

-- panels
create policy panels_public_select on panels for select using (true);
create policy panels_authenticated_insert on panels for insert to authenticated with check (true);
create policy panels_authenticated_update on panels for update to authenticated using (true);
create policy panels_authenticated_delete on panels for delete to authenticated using (true);

-- members: public only sees members of the currently active panel; authenticated sees all (incl. archived, for FR-37)
create policy members_public_select on members for select
  using (
    exists (select 1 from panels p where p.id = members.panel_id and p.is_active)
    or auth.role() = 'authenticated'
  );
create policy members_authenticated_insert on members for insert to authenticated with check (true);
create policy members_authenticated_update on members for update to authenticated using (true);
create policy members_authenticated_delete on members for delete to authenticated using (true);

-- registration_settings: single row, no insert/delete policy (row is permanent, seeded once)
create policy registration_public_select on registration_settings for select using (true);
create policy registration_authenticated_update on registration_settings for update to authenticated using (true);

-- site_content: single-row-per-key, upsert only (no delete policy — rows are permanent)
create policy site_content_public_select on site_content for select using (true);
create policy site_content_authenticated_insert on site_content for insert to authenticated with check (true);
create policy site_content_authenticated_update on site_content for update to authenticated using (true);

-- admin_security: zero policies — only reachable via the service-role key, bypassing RLS entirely.

-- audit_log: immutable — insert only by the acting admin, select by any authenticated admin, no update/delete policy.
create policy audit_log_authenticated_select on audit_log for select to authenticated using (true);
create policy audit_log_authenticated_insert on audit_log for insert to authenticated with check (admin_id = auth.uid());

-- blog_posts
create policy blog_posts_public_select on blog_posts for select using (true);
create policy blog_posts_authenticated_insert on blog_posts for insert to authenticated with check (true);
create policy blog_posts_authenticated_update on blog_posts for update to authenticated using (true);
create policy blog_posts_authenticated_delete on blog_posts for delete to authenticated using (true);

-- alumni
create policy alumni_public_select on alumni for select using (true);
create policy alumni_authenticated_insert on alumni for insert to authenticated with check (true);
create policy alumni_authenticated_update on alumni for update to authenticated using (true);
create policy alumni_authenticated_delete on alumni for delete to authenticated using (true);

-- sponsors
create policy sponsors_public_select on sponsors for select using (true);
create policy sponsors_authenticated_insert on sponsors for insert to authenticated with check (true);
create policy sponsors_authenticated_update on sponsors for update to authenticated using (true);
create policy sponsors_authenticated_delete on sponsors for delete to authenticated using (true);
