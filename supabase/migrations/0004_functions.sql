-- Transactional helpers so multi-step admin actions can't leave data half-updated.

create or replace function activate_panel(p_panel_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  update panels set is_active = false, updated_at = now() where is_active = true;
  update panels set is_active = true, updated_at = now() where id = p_panel_id;
end;
$$;

create or replace function reorder_players(p_team_id uuid, p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
as $$
begin
  update players p
  set sort_order = o.idx - 1,
      updated_at = now()
  from unnest(p_ordered_ids) with ordinality as o(id, idx)
  where p.id = o.id and p.team_id = p_team_id;
end;
$$;

create or replace function reorder_members(p_panel_id uuid, p_tier text, p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
as $$
begin
  update members m
  set sort_order = o.idx - 1,
      updated_at = now()
  from unnest(p_ordered_ids) with ordinality as o(id, idx)
  where m.id = o.id and m.panel_id = p_panel_id and m.tier = p_tier;
end;
$$;

grant execute on function activate_panel(uuid) to authenticated;
grant execute on function reorder_players(uuid, uuid[]) to authenticated;
grant execute on function reorder_members(uuid, text, uuid[]) to authenticated;
