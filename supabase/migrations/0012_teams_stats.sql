-- Teams page stats bar (Total Championships, Medals Won, Win Rate), editable from the
-- admin dashboard. Team Members stays computed live from the players table.
insert into site_content (page_key, content, featured_event_id) values
  ('teams_stat_championships', '8+', null),
  ('teams_stat_medals', '45+', null),
  ('teams_stat_win_rate', '72%', null)
on conflict (page_key) do nothing;
