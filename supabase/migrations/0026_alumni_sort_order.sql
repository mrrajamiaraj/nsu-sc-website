-- Alumni are drag-reordered by admins within each (class year, tier) group,
-- and Sub-Executive members now follow admin sort order instead of being
-- forced alphabetical. Both are seeded alphabetically so nothing visibly moves.
alter table alumni add column sort_order int not null default 0;

update alumni a
  set sort_order = o.idx
  from (
    select id, row_number() over (partition by class_year_id, tier order by name) - 1 as idx
    from alumni
  ) o
  where a.id = o.id;

create index alumni_year_tier_sort_idx on alumni (class_year_id, tier, sort_order);

update members m
  set sort_order = o.idx
  from (
    select id, row_number() over (partition by panel_id order by name) - 1 as idx
    from members
    where tier = 'Sub-Executive'
  ) o
  where m.id = o.id;

create or replace function reorder_alumni(p_class_year_id uuid, p_tier text, p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update alumni a
  set sort_order = o.idx - 1,
      updated_at = now()
  from unnest(p_ordered_ids) with ordinality as o(id, idx)
  where a.id = o.id and a.class_year_id = p_class_year_id and a.tier = p_tier;
end;
$$;

grant execute on function reorder_alumni(uuid, text, uuid[]) to authenticated;
