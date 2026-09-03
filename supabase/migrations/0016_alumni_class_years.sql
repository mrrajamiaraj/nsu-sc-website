-- Admin-managed list of alumni class-year labels (e.g. "2025-2026"), shown as
-- filter pills on the public Alumni page. Order is admin-controlled via
-- sort_order rather than derived from the label text, since labels can be
-- arbitrary year ranges (mirrors the "panel year" pill design reference).
create table alumni_class_years (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table alumni_class_years enable row level security;
create policy alumni_class_years_public_select on alumni_class_years for select using (true);
create policy alumni_class_years_authenticated_insert on alumni_class_years for insert to authenticated with check (true);
create policy alumni_class_years_authenticated_update on alumni_class_years for update to authenticated using (true);
create policy alumni_class_years_authenticated_delete on alumni_class_years for delete to authenticated using (true);

alter table alumni add column class_year_id uuid references alumni_class_years(id) on delete cascade;

-- Backfill: one class-year row per distinct existing graduation_year, newest first.
insert into alumni_class_years (label, sort_order)
select y.graduation_year::text, row_number() over (order by y.graduation_year desc) - 1
from (select distinct graduation_year from alumni) y;

update alumni a
set class_year_id = cy.id
from alumni_class_years cy
where cy.label = a.graduation_year::text;

alter table alumni alter column class_year_id set not null;
alter table alumni drop column graduation_year;

create index alumni_class_year_idx on alumni (class_year_id);

create or replace function reorder_alumni_class_years(p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update alumni_class_years cy
  set sort_order = o.idx - 1
  from unnest(p_ordered_ids) with ordinality as o(id, idx)
  where cy.id = o.id;
end;
$$;

grant execute on function reorder_alumni_class_years(uuid[]) to authenticated;
