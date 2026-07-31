-- Seed: singleton rows + the site's current mock content, so the cutover from
-- lib/mock-data.ts to real Supabase queries doesn't leave the public site blank.
-- Admin can edit/replace all of this via the dashboard after launch.

insert into registration_settings (id, is_open, google_form_url, next_intake_date)
values (1, true, 'https://forms.google.com/nsusc-membership', null);

insert into admin_security (id, failed_attempts, locked_until)
values (1, 0, null);

-- Teams (fixed ids so players below can reference them)
insert into teams (id, name, description, banner_image, nickname, achievement) values
  ('11111111-1111-1111-1111-111111111101', 'Football', 'NSU SC''s largest and most competitive squad.', '/images/teams/football.png', 'Thunder Lions', '3x Champions 2023–2025'),
  ('11111111-1111-1111-1111-111111111102', 'Cricket', 'Home ground champions, two-time tournament winners.', '/images/teams/cricket.png', 'Storm Strikers', '2x Tournament Winners'),
  ('11111111-1111-1111-1111-111111111103', 'Handball', 'Fast-growing team with a strong freshers pipeline.', null, 'Iron Hawks', null),
  ('11111111-1111-1111-1111-111111111104', 'Basketball', 'Undefeated 2025 season and still climbing.', '/images/teams/basketball.png', 'Hoop Warriors', 'Undefeated Season 2025');

-- Events (fixed ids so site_content.home_featured_event can reference evt-1)
insert into events (id, name, date, end_date, venue, description, banner_image, gallery, status, team_count, participant_count, winners, runners_up, prize_pool) values
  ('22222222-2222-2222-2222-222222222201', 'Inter-University Football Championship 2026', '2026-07-29', '2026-08-05', 'NSU Sports Complex', 'Annual football championship featuring the best university teams across the country. Group stages are underway now, finals next week.', '/images/events/football.png', array['/images/events/football.png','/images/teams/football.png'], 'Running', 16, 320, null, null, '৳100,000'),
  ('22222222-2222-2222-2222-222222222202', 'Cricket Tournament 2026', '2026-08-25', '2026-08-30', 'NSU Cricket Ground', 'Premier cricket tournament with teams from universities nationwide.', '/images/events/cricket.png', array['/images/events/cricket.png','/images/teams/cricket.png'], 'Upcoming', 12, 180, null, null, '৳75,000'),
  ('22222222-2222-2222-2222-222222222203', 'Annual Sports Excellence Awards', '2026-06-28', null, 'NSU Auditorium', 'Celebrating outstanding athletic achievements and recognizing top performers from the season.', '/images/events/awards.png', array['/images/events/awards.png'], 'Finished', null, 500, 'NSU Football Team — Thunder Lions', 'NSU Cricket Team — Storm Strikers', '৳50,000'),
  ('22222222-2222-2222-2222-222222222204', 'Winter Swimming Championship', '2026-01-28', '2026-01-29', 'NSU Aquatic Center', 'Competitive swimming event with multiple categories and age groups.', '/images/events/swimming.png', array['/images/events/swimming.png'], 'Finished', null, 100, 'Rafiq Khan (Freestyle 100m)', 'Nabil Islam (Freestyle 100m)', '৳30,000');

-- Players
insert into players (team_id, name, photo, email, position, bio, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Ahmed Hassan', null, 'ahmed.hassan@nsusc.org', 'Coach', 'Leading the squad since 2023, with three championship titles to date.', 1),
  ('11111111-1111-1111-1111-111111111101', 'Rafiq Khan', null, 'rafiq.khan@nsusc.org', 'Captain, Forward', 'Top scorer for two consecutive seasons and the team''s on-field leader.', 2),
  ('11111111-1111-1111-1111-111111111101', 'Imran Chowdhury', null, 'imran.chowdhury@nsusc.org', 'Goalkeeper', 'Known for a wall of a save in last season''s semifinal.', 3),
  ('11111111-1111-1111-1111-111111111101', 'Nabil Islam', null, 'nabil.islam@nsusc.org', 'Midfielder', 'Playmaker who controls the tempo of every match.', 4),
  ('11111111-1111-1111-1111-111111111102', 'Sabbir Rahman', null, 'sabbir.rahman@nsusc.org', 'Coach', 'Former university-league all-rounder, coaching NSU SC since 2024.', 1),
  ('11111111-1111-1111-1111-111111111102', 'Tamim Haque', null, 'tamim.haque@nsusc.org', 'Captain, Batsman', 'Steady top-order batsman and calm presence under pressure.', 2),
  ('11111111-1111-1111-1111-111111111102', 'Shakib Al Noman', null, 'shakib.alnoman@nsusc.org', 'Bowler', 'Fast bowler with the best economy rate in last season''s league.', 3),
  ('11111111-1111-1111-1111-111111111103', 'Faisal Reza', null, 'faisal.reza@nsusc.org', 'Captain', 'One of the founding members of the handball team.', 1),
  ('11111111-1111-1111-1111-111111111103', 'Rakib Hasan', null, 'rakib.hasan@nsusc.org', 'Left Wing', 'Quick on the counter-attack and a reliable finisher.', 2),
  ('11111111-1111-1111-1111-111111111104', 'James Wilson', null, 'james.wilson@nsusc.org', 'Coach', 'Guided the team to an undefeated 2025 season.', 1),
  ('11111111-1111-1111-1111-111111111104', 'Rahim Ahmed', null, 'rahim.ahmed@nsusc.org', 'Captain, Point Guard', 'Floor general with a knack for clutch shots.', 2),
  ('11111111-1111-1111-1111-111111111104', 'Zayn Karim', null, 'zayn.karim@nsusc.org', 'Center', 'Dominant under the basket on both ends of the court.', 3);

-- Panel (fixed id so members below can reference it, and it's the seeded active panel)
insert into panels (id, name, is_active) values
  ('33333333-3333-3333-3333-333333333301', 'Panel 2025-26', true);

-- Members
insert into members (panel_id, name, photo, designation, tier, email, phone, additional_info, sort_order) values
  ('33333333-3333-3333-3333-333333333301', 'Ariana Rahman', null, 'President', 'Executive', 'ariana.rahman@nsusc.org', '+880 1711-000001', null, 1),
  ('33333333-3333-3333-3333-333333333301', 'Tanvir Ahmed', null, 'General Secretary', 'Executive', 'tanvir.ahmed@nsusc.org', '+880 1711-000002', null, 2),
  ('33333333-3333-3333-3333-333333333301', 'Priyanka Sultana', null, 'Treasurer', 'Executive', 'priyanka.sultana@nsusc.org', '+880 1711-000004', null, 3),
  ('33333333-3333-3333-3333-333333333301', 'Farhan Kabir', null, 'Sports Secretary', 'Sub-Executive', 'farhan.kabir@nsusc.org', '+880 1711-000003', null, 1),
  ('33333333-3333-3333-3333-333333333301', 'Labiba Haque', null, 'Media Secretary', 'Sub-Executive', 'labiba.haque@nsusc.org', '+880 1711-000005', null, 2),
  ('33333333-3333-3333-3333-333333333301', 'Sami Ul Islam', null, 'General Member', 'General', 'sami.ulislam@nsusc.org', '+880 1711-000006', null, 1),
  ('33333333-3333-3333-3333-333333333301', 'Rifat Anjum', null, 'General Member', 'General', 'rifat.anjum@nsusc.org', '+880 1711-000007', null, 2),
  ('33333333-3333-3333-3333-333333333301', 'Dipto Barua', null, 'General Member', 'General', 'dipto.barua@nsusc.org', '+880 1711-000008', null, 3);

-- Site content
insert into site_content (page_key, content, featured_event_id) values
  ('home_tagline', 'One club, every sport — compete, connect, and represent NSU.', null),
  ('home_welcome', '', null),
  ('about_history', '', null),
  ('home_featured_event', '', '22222222-2222-2222-2222-222222222201'),
  ('about_gallery', '', null);

-- Alumni
insert into alumni (name, photo, graduation_year, tier, team, current_role_title, quote) values
  ('Kamrul Islam', null, 1995, 'Executive', 'Football', 'Retired Banker, formerly Sonali Bank', 'We started this club with a handful of players and a single football. Proud of what it''s become.'),
  ('Ferdousi Begum', null, 1995, 'Sub-Executive', 'Basketball', 'School Principal, Dhaka', null),
  ('Omar Faruk', null, 2021, 'Executive', 'Basketball', 'Product Manager at Pathao', null),
  ('Nusrat Jahan', null, 2022, 'Sub-Executive', 'Cricket', 'Business Analyst at bKash', 'The friendships I made on the pitch are still my closest ones today.'),
  ('Tahsin Rahman', null, 2023, 'Executive', 'Football', 'Software Engineer at Therap BD', 'NSU SC taught me as much about teamwork as any classroom did.'),
  ('Mahin Chowdhury', null, 2024, 'Sub-Executive', 'Handball', 'Graduate Student, University of British Columbia', 'Being team captain shaped how I lead teams today.');

-- Blog posts
insert into blog_posts (title, excerpt, content, category, cover_image, author, date, read_time_minutes) values
  ('Thunder Lions Clinch Third Straight Championship', 'A dramatic penalty shootout capped off an unbeaten campaign for the football squad.', '', 'Football', '/images/teams/football.png', 'NSU SC Media', '2026-06-30', 4),
  ('Inside the Cricket Tournament 2026 Build-Up', 'Storm Strikers'' captain shares how the squad is preparing for next month''s tournament.', '', 'Cricket', '/images/teams/cricket.png', 'Tamim Haque', '2026-07-10', 3),
  ('Player Spotlight: Rahim Ahmed', 'From walk-on to captain — the Hoop Warriors'' floor general on leadership and clutch shots.', '', 'Profiles', '/images/teams/basketball.png', 'NSU SC Media', '2026-06-15', 5),
  ('Recap: Annual Sports Excellence Awards', 'Celebrating the athletes and volunteers who defined this season.', '', 'Events', '/images/events/awards.png', 'NSU SC Media', '2026-06-29', 3);

-- Sponsors (placeholder/fictional names, no real logos yet)
insert into sponsors (name, logo) values
  ('Nova Sportswear', null),
  ('Zenith Nutrition', null),
  ('Apex Bank', null),
  ('Horizon Media', null),
  ('Falcon Energy', null),
  ('Crestline Foods', null);
