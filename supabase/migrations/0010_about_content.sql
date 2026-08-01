-- About page content (hero subtitle, story heading/highlights, stats, mission/vision,
-- core values), editable from the admin dashboard. List fields are stored as JSON arrays
-- in the text `content` column since site_content has no dedicated list type.
insert into site_content (page_key, content, featured_event_id) values
  ('about_hero_subtitle', 'Empowering students through sports excellence, teamwork, and competitive spirit since 1992.', null),
  ('about_story_heading', 'Building Champions On & Off the Field', null),
  ('about_story_highlights', '["Premier sports club in Bangladesh","State-of-the-art training facilities","Professional coaching staff","Active participation in national tournaments"]', null),
  ('about_stat_established', '1992', null),
  ('about_stat_members', '500+', null),
  ('about_stat_championships', '8+', null),
  ('about_mission_text', 'To cultivate a vibrant sports culture at NSU that promotes physical fitness, mental well-being, and competitive excellence. We are committed to providing world-class facilities, professional coaching, and opportunities for students to excel in their chosen sports while maintaining academic success.', null),
  ('about_mission_points', '["Promote holistic student development","Foster sportsmanship and fair play","Build a winning athletic tradition"]', null),
  ('about_vision_text', 'To be recognized as the leading university sports club in Bangladesh, setting benchmarks for athletic excellence, innovation in sports management, and student engagement. We envision creating champions who excel not just in sports, but in life.', null),
  ('about_vision_points', '["Lead sports innovation in Bangladesh","Produce national-level athletes","Create lasting impact in the community"]', null),
  ('about_core_values', '[{"title":"Passion","description":"We fuel athletic excellence through dedication and love for sports."},{"title":"Teamwork","description":"Together we achieve more, building bonds that last a lifetime."},{"title":"Excellence","description":"We strive for the highest standards in every game we play."},{"title":"Innovation","description":"Embracing new training methods and sports technologies."}]', null)
on conflict (page_key) do nothing;
