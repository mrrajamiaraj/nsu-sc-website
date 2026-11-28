-- The NSU SC Gazette: run this once in the Supabase SQL editor (Project > SQL editor).
-- Reviewed by hand; it is NOT in supabase/migrations, so nothing applies it automatically.
-- Safe to re-run: columns and tables are added only if missing, and the stories are keyed
-- by slug (re-running updates them to the text below).
--
-- 1. Adds the Gazette fields to blog_posts.
-- 2. Removes the four demo posts (fictional teams and people, no body).
-- 3. Publishes ten real stories, written from the club's own records; newest first by date.
-- 4. Adds the "Send congrats" count for stories.

begin;

-- 1. Gazette fields ---------------------------------------------------------------------
alter table public.blog_posts
  add column if not exists slug text,
  add column if not exists sport text,
  add column if not exists author_role text,
  add column if not exists author_photo text,
  add column if not exists cover_credit text,
  add column if not exists cover_caption text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists related_event_id uuid references public.events (id) on delete set null,
  add column if not exists related_achievement_id uuid references public.achievements (id) on delete set null,
  add column if not exists related_team_id uuid references public.teams (id) on delete set null,
  -- Links to site pages shown with the story: [{"label", "href", "kind": "page" | "join"}].
  add column if not exists related_links jsonb not null default '[]';

create unique index if not exists blog_posts_slug_key on public.blog_posts (slug) where slug is not null;

-- 2. Remove the demo posts ------------------------------------------------------------------
delete from public.blog_posts
where id in (
  'dcc4893b-7026-492f-8189-31cca8a84963', -- Thunder Lions Clinch Third Straight Championship
  '698fc437-5d60-4ca4-a336-96c6178b5d36', -- Inside the Cricket Tournament 2026 Build-Up (Storm Strikers)
  'bbd02275-643c-4dc3-b8fb-bbae149ddbcf', -- Player Spotlight: Rahim Ahmed
  'f21a77a7-332e-43fb-b6f6-500a009673d3'  -- Recap: Annual Sports Excellence Awards
);

-- 3. Ten real stories --------------------------------------------------------------------------
-- Body blocks are HTML: <p>, <blockquote> (pull quote, no attribution), <table>, <h2>,
-- <ul class="events"> / <ul class="people"> (the site adds each event's code and thumbnail,
-- or each person's portrait) and <aside class="callout">.
insert into public.blog_posts
  (slug, title, excerpt, content, category, sport, author, author_role, date, read_time_minutes,
   cover_image, cover_caption, cover_credit, tags, related_event_id, related_achievement_id, related_team_id,
   related_links)
values
  (
    'mridul-futsal-league-bangladesh-2026',
    'Mridul captains IM10 FC to the Futsal League Bangladesh title',
    'Kazi Ibrahim Ahamed Mridul led his team to the 2026 title and was named Best Player of the Tournament.',
    $html$<p>Kazi Ibrahim Ahamed Mridul has had a season to remember. As captain of IM10 FC, he led his side to the Futsal League Bangladesh 2026 championship, and he finished the tournament with the Best Player award.</p><p>It's a long way from the NAC-SAC corridors at North South University, where many NSUers first knew him, to a national futsal final. Mridul made that journey by leading from the front: setting the tempo, organising the team around him, and stepping up when the matches got tight.</p><blockquote><p>From the NAC-SAC corridors to the national stage.</p></blockquote><p>Winning a league is a team effort. Being named the best player in it is a personal statement. Mridul did both in the same tournament.</p><p>For NSU Games &amp; Sports Club, his success is a reminder of what NSU students can achieve in competitive sport beyond campus. It's also a challenge to the next generation of players coming through our squads.</p><p>Congratulations, Captain. The club is proud of you.</p>$html$,
    'Profiles', 'Futsal', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-28', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/achievements/76a9fb2c-60f9-4287-b774-6126a7b0245c.webp',
    'The club''s Champion poster for Kazi Ibrahim Ahamed Mridul.', 'NSU Games & Sports Club', array['futsal', 'profiles', 'achievements']::text[],
    null::uuid, '382c49a4-67c5-4ae2-9453-2503a29aa1a2'::uuid, null::uuid,
    '[{"label": "Futsal events", "href": "/events?sport=futsal#archive-heading", "kind": "page"}, {"label": "Join the club: futsal trials", "href": "/contact?topic=trials&squad=Football%20Male#contact-form", "kind": "join"}]'::jsonb
  ),
  (
    'chess-carrom-2026-season-2-results',
    'Chess & Carrom Season 2: all the champions',
    'Four titles were decided at NSU Main Plaza as Season 2 of NSU Chess & Carrom came to a close.',
    $html$<p>NSU Chess &amp; Carrom returned for Season 2 in 2026, with NSU Main Plaza as its home. It's one of the club's most accessible events: no squad trials and no kit, just a board, a strike and a lot of focus.</p><p>The tournament was played across four categories, and here is who took home the titles:</p><table><thead><tr><th>Category</th><th>Champion</th></tr></thead><tbody><tr><td>Male Doubles</td><td>Shadow Hunters</td></tr><tr><td>Female Doubles</td><td>Double Trouble</td></tr><tr><td>Mixed Doubles</td><td>She &amp; Coach</td></tr><tr><td>Chess</td><td>Ragib Arif Sharar</td></tr></tbody></table><blockquote><p>One club, every sport, and that includes the board games.</p></blockquote><p>Events like Chess &amp; Carrom are where many students take part in club activities for the first time. They're also where some go on to volunteer, organise, and eventually join the panel.</p><p>Thank you to every player, volunteer and spectator who made Season 2 happen.</p>$html$,
    'Results', 'Chess & Carrom', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-27', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/f6915586-6ce5-45cf-a3f9-dc323806b563.webp',
    'The NSU Chess & Carrom Season 2 poster.', 'NSU Games & Sports Club', array['chess', 'carrom', 'results']::text[],
    'a7dfeee3-fdb6-4c20-a2f1-1530aa61fe1d'::uuid, null::uuid, null::uuid,
    '[{"label": "The trophy room", "href": "/achievements", "kind": "page"}]'::jsonb
  ),
  (
    'punab-july-uprising-memorial-award-2026',
    'NSU SC named Appreciation Partner at the PUNAB July Uprising Memorial Award 2026',
    'The club was recognised for its work with the community at this year''s memorial award.',
    $html$<p>North South University Games &amp; Sports Club was recognised as an Appreciation Partner of the PUNAB July Uprising Memorial Award 2026.</p><p>The recognition reflects the club's community work beyond the pitch. It comes alongside a busy year of tournaments, including NSU Chess &amp; Carrom, the NSU Basketball League, Shuttle Masters and the inter-batch cricket and football tournaments.</p><blockquote><p>The club's work doesn't stop at the final whistle.</p></blockquote><p>A student-run club depends on the people who give their time: the panel, the volunteers, the players and the partners who back our events. This recognition belongs to all of them.</p><p>Thank you to PUNAB for the honour, and to everyone who supported the club along the way.</p>$html$,
    'Club news', 'Club', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-26', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/achievements/3286493f-119c-41e7-80cb-e753f38f922d.webp',
    'The club on stage with the Club Excellence Award 2026.', 'NSU Games & Sports Club', array['club news', 'recognition']::text[],
    null::uuid, 'd09cef27-371e-4b86-a6a5-d493b57891db'::uuid, null::uuid,
    '[{"label": "About the club", "href": "/about", "kind": "page"}]'::jsonb
  ),
  (
    '2026-events-in-review',
    '2026 in review: seven tournaments, one club',
    'From the basketball court to the badminton hall, here''s every event NSU SC ran in 2026.',
    $html$<p>2026 has been one of the club's busiest years. Here's every event on the calendar:</p><ul class="events"><li><a href="/events/nsu-chess-carrom-2026">NSU Chess &amp; Carrom 2026 (Season 2)</a>: four titles decided at NSU Main Plaza.</li><li><a href="/events/nsu-basketball-league-nbl-2026">NSU Basketball League (NBL) 2026, Season 1</a>: the first season of the club's basketball league.</li><li><a href="/events/nsu-world-cup-fiesta-2026">NSU World Cup Fiesta 2026</a>: football, fans and a festival atmosphere on campus.</li><li><a href="/events/khar-nights-2026">Khar Nights</a>: a night event from the 2026 calendar.</li><li><a href="/events/nsu-inter-batch-cricket-tournament-2026">NSU Inter Batch Cricket Tournament 2026</a>: batches went head to head for cricket bragging rights.</li><li><a href="/events/nsu-inter-batch-football-tournament-2026">NSU Inter Batch Football Tournament 2026</a>: the same rivalry, on the football pitch.</li><li><a href="/events/nsusc-shuttle-masters-2026">NSUSC Shuttle Masters 2026, Season 2</a>: the badminton competition returned for another season.</li></ul><blockquote><p>Seven tournaments. Hundreds of players. One club.</p></blockquote><p>Every one of these was organised by students, for students. If you played, volunteered or cheered from the sidelines, thank you.</p><aside class="callout"><p>Want to be part of the next one? Sign-ups for squads are open, and the panel will contact you about trials for your sport.</p><p><a href="/contact?topic=trials#contact-form">Join the club</a></p></aside>$html$,
    'Club news', 'Multi-sport', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-25', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/fa4f609e-9ac0-47ce-859e-ddf559bf51ba.webp',
    'A match at the NSU Inter Batch Football Tournament 2026.', 'NSU Games & Sports Club', array['events', 'review', '2026']::text[],
    null::uuid, null::uuid, null::uuid,
    '[{"label": "Every 2026 event", "href": "/events?year=2026#archive-heading", "kind": "page"}, {"label": "Join the club", "href": "/contact?topic=trials#contact-form", "kind": "join"}]'::jsonb
  ),
  (
    'meet-the-panel-2025-26',
    'Meet the panel running NSU SC in 2025–26',
    '90 students and one faculty advisor keep the club running. Here are the people at the top.',
    $html$<p>Every tournament, trial and result on this site starts with the panel. For 2025–26, the club is run by 90 students across four tiers, guided by a faculty advisor.</p><h2>The leadership</h2><ul class="people"><li><a href="/members?person=mr-hasan-a-mamun">Mr. Hasan A Mamun</a>: Faculty Advisor</li><li><a href="/members?person=md-sayedul-karim-sikder">Md Sayedul Karim Sikder</a>: President</li><li><a href="/members?person=eraj-chowdhury">Eraj Chowdhury</a>: General Secretary &amp; Acting Treasurer</li><li><a href="/members?person=md-rakibul-islam-shanto">Md. Rakibul Islam Shanto</a>: Joint Secretary</li><li><a href="/members?person=shimanto-majumder">Shimanto Majumder</a>: Joint Secretary</li></ul><p>Behind them are 25 sub-executive members and 60 general members. They handle the planning, logistics, media and matchday work that turns an idea into an event.</p><blockquote><p>Every result on this site started with someone on the panel saying yes.</p></blockquote><aside class="callout"><p>Want to help run the club? Panel elections are held every year. Ask the current panel how nominations work and what each role involves.</p><p><a href="/contact?topic=other&amp;to=Panel#contact-form">Ask the panel</a></p></aside>$html$,
    'Behind the scenes', 'Club', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-24', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/members/df8bb8f8-c98a-4125-8cf2-00d5db4d1f2e.webp',
    'Md. Sayedul Karim Sikder, President of NSU SC for 2025–26.', 'NSU Games & Sports Club', array['panel', 'members', 'behind the scenes']::text[],
    null::uuid, null::uuid, null::uuid,
    '[{"label": "The panel", "href": "/members", "kind": "page"}, {"label": "Past panels", "href": "/alumni", "kind": "page"}, {"label": "Contact the club", "href": "/contact", "kind": "page"}]'::jsonb
  ),
  (
    'nbl-2026-season-1-results',
    'NBL Season 1: Old Bits and Team Mad take the first titles',
    'The first NSU Basketball League was played at the NSU Indoor, with male, female and co-ed categories.',
    $html$<p>The NSU Basketball League began in 2026. Its first season was played at the NSU Indoor on 29 August, hosted by NSU Games &amp; Sports Club, with teams competing in male, female and co-ed categories.</p><p>Old Bits won the male title. In the co-ed category, Team Mad finished first and Oldies second. Panda Squad were runners-up in the female category.</p><blockquote><p>Every league has a first season. This one now has its first champions.</p></blockquote><p>A first season sets the standard for the ones that follow. The teams that played in NBL 2026 are now the names the next season's teams will be chasing.</p><p>Thank you to every player, volunteer and supporter who filled the NSU Indoor for Season 1.</p><aside class="callout"><p>Want to play in the next season? Let the panel know through the contact form.</p><p><a href="/contact?topic=trials#contact-form">Get in touch</a></p></aside>$html$,
    'Results', 'Basketball', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-23', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/1633fc83-f38f-4510-a199-98cf8c52d2e8.webp',
    'The NSU Basketball League logo.', 'NSU Games & Sports Club', array['basketball', 'nbl', 'results']::text[],
    '882397d2-9114-46da-8c66-69669e3f79d3'::uuid, null::uuid, null::uuid,
    '[{"label": "Basketball events", "href": "/events?sport=basketball#archive-heading", "kind": "page"}, {"label": "Join the club", "href": "/contact?topic=trials#contact-form", "kind": "join"}]'::jsonb
  ),
  (
    'inter-batch-football-cricket-2026',
    'Inter-batch week: Batch 23 win the football, Batch 21 the cricket',
    'Four days in April settled the club''s inter-batch titles, on the football pitch and at Anvir Cricket Stadium.',
    $html$<p>In April 2026, NSU's batches took their rivalry to two sports in four days. The NSU Inter Batch Football Tournament was played on 19 and 20 April at the ABG South Zone 11-a-side football field, and the NSU Inter Batch Cricket Tournament followed on 21 and 22 April at Anvir Cricket Stadium. NSU Games &amp; Sports Club hosted both.</p><table><thead><tr><th scope="col">Tournament</th><th scope="col">Champions</th><th scope="col">Runners-up</th></tr></thead><tbody><tr><td>Football (men)</td><td>Batch 23</td><td>Batch 25</td></tr><tr><td>Football (women)</td><td>Junior Batch</td><td>Senior Batch</td></tr><tr><td>Cricket (men)</td><td>Batch 21</td><td>Batch 23</td></tr></tbody></table><p>Batch 23 appear twice: champions on the football pitch, then runners-up in the cricket two days later.</p><blockquote><p>Batch pride doesn't pick a sport.</p></blockquote><p>Inter-batch tournaments are where the rivalry is closest to home: classmates against the years above and below them, on their own campus. Both events have full photo galleries on their event pages.</p><p>Thank you to every batch that put out a team, and to everyone who came to watch.</p>$html$,
    'Results', 'Multi-sport', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-22', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/3c75a67d-f9b8-48f1-a1ff-8648536b5c62.webp',
    'A bowler at the NSU Inter Batch Cricket Tournament 2026.', 'NSU Games & Sports Club', array['football', 'cricket', 'inter-batch', 'results']::text[],
    '89f78f92-ac32-4b12-8c9a-5066e5698643'::uuid, null::uuid, null::uuid,
    '[{"label": "NSU Inter Batch Cricket Tournament 2026", "href": "/events/nsu-inter-batch-cricket-tournament-2026", "kind": "page"}, {"label": "Join the club", "href": "/contact?topic=trials#contact-form", "kind": "join"}]'::jsonb
  ),
  (
    'nsu-world-cup-fiesta-2026',
    'World Cup Fiesta 2026: BBA Elites win the futsal',
    'For two and a half weeks in July, NSU SC brought World Cup fever to campus with futsal, flash mobs and quizzes.',
    $html$<p>The NSU World Cup Fiesta 2026 ran from 5 to 22 July at the NSU Indoor. Organised by NSU Games &amp; Sports Club, it brought the World Cup to campus in the way students know best: a futsal tournament, with flash mobs and quiz competitions around it.</p><p>On the court, BBA Elites won the men's futsal tournament, and Arc Vault finished as runners-up.</p><blockquote><p>Not every World Cup needs a stadium.</p></blockquote><p>The Fiesta was built for more than the players. The flash mobs and quizzes gave everyone else on campus a way to join in, whether or not they ever touched a ball.</p><p>The event page has 14 photos from the Fiesta. If you were there, you might be in one of them.</p><p>Congratulations to BBA Elites and Arc Vault, and thank you to everyone who made the Fiesta happen.</p>$html$,
    'Club news', 'Futsal', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-21', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/b076f4f8-69ce-4972-a6be-bb9f02b55d13.webp',
    'Futsal at the NSU World Cup Fiesta 2026.', 'NSU Games & Sports Club', array['futsal', 'world cup fiesta', 'events']::text[],
    '2e3351cf-8e53-4abb-a294-ea7b857c9d3b'::uuid, null::uuid, null::uuid,
    '[{"label": "Futsal events", "href": "/events?sport=futsal#archive-heading", "kind": "page"}, {"label": "Join the club: futsal trials", "href": "/contact?topic=trials&squad=Football%20Male#contact-form", "kind": "join"}]'::jsonb
  ),
  (
    'shuttle-masters-2026-results',
    'Shuttle Masters 2026: CSE and BBA General take the titles',
    'Season 2 of the club''s badminton championship was played at the NSU Indoor, with a men''s and a women''s title.',
    $html$<p>NSUSC Shuttle Masters returned for its second season in 2026, with the NSU Indoor as its court. Departments played for two titles in the club's badminton championship: one for men and one for women.</p><table><thead><tr><th scope="col">Category</th><th scope="col">Champions</th><th scope="col">Runners-up</th></tr></thead><tbody><tr><td>Men</td><td>CSE</td><td>BBT</td></tr><tr><td>Women</td><td>BBA General</td><td>Architecture</td></tr></tbody></table><blockquote><p>Fast rallies, faster bragging rights.</p></blockquote><p>Department tournaments give the rivalry a home address. The players carry their department's name onto the court, and the result follows them back to class.</p><p>The event page has 12 photos from the season.</p><p>Congratulations to CSE and BBA General, and well played to BBT and Architecture.</p>$html$,
    'Results', 'Badminton', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-20', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/ecf0ca21-de86-49d8-b4b6-2314f6e1c9b2.webp',
    'Badminton at NSUSC Shuttle Masters 2026, in the NSU Indoor.', 'NSU Games & Sports Club', array['badminton', 'shuttle masters', 'results']::text[],
    'd3c8c809-a75c-45a8-b2f2-460ee269a1db'::uuid, null::uuid, null::uuid,
    '[{"label": "Badminton events", "href": "/events?sport=badminton#archive-heading", "kind": "page"}, {"label": "Join the club", "href": "/contact?topic=trials#contact-form", "kind": "join"}]'::jsonb
  ),
  (
    'from-the-trophy-room-1997-2024',
    'From the trophy room: NSU sport from 1997 to 2024',
    'A hat-trick in 1997, a cup in 2013, a national prize-giving in 2022: six moments from the club''s records.',
    $html$<p>The trophy room on this site holds the club's records, and some of them go back almost three decades. Here are six of the older ones, in order.</p><ul><li><strong><a href="/achievements/hat-trick-champions-intra-nsu-football-1997">1997: Hat-trick champions.</a></strong> Batch '96 completed a hat-trick of titles at the Intra NSU Football Tournament.</li><li><strong><a href="/achievements/champions-ulab-fair-play-cup-2013">2013: ULAB Fair Play Cup.</a></strong> NSU were champions of the 6th ULAB Fair Play Cup Inter-Private University Cricket Tournament.</li><li><strong><a href="/achievements/nsuers-meet-dhaka-gladiators-2013">2013: NSUers meet Dhaka Gladiators.</a></strong> The club brought NSU students together with the Dhaka Gladiators on 10 February 2013.</li><li><strong><a href="/achievements/biusc-2022-prize-giving">2022: BIUSC prize giving.</a></strong> NSU's athletes were honoured at the Bangabandhu Inter University Sports Championship 2022 prize-giving ceremony.</li><li><strong><a href="/achievements/nfl-2022-trophy-unveiling">2022: NFL trophy unveiling.</a></strong> The NSU Football League 2022 trophy was unveiled at a ceremony covered by the media.</li><li><strong><a href="/achievements/runners-up-bsl-inter-university-futsal-2024">2024: BSL futsal runners-up.</a></strong> NSU's football team finished second at the BSL Inter-University Futsal Tournament 2024.</li></ul><blockquote><p>Today's results become tomorrow's trophy room.</p></blockquote><p>Each entry has its own page in the trophy room, with photos and the full record.</p><aside class="callout"><p>Have something for the trophy room? If you have photos or details of a result that's missing, send them to the panel.</p><p><a href="/contact?topic=events#contact-form">Share a result</a></p></aside>$html$,
    'Behind the scenes', 'Multi-sport', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-19', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/achievements/0aa18d35-b082-481c-bdd6-3ac09b261f22.webp',
    'Batch ''96, hat-trick champions of the Intra NSU Football Tournament 1997.', 'NSU Games & Sports Club', array['history', 'achievements', 'trophy room']::text[],
    null::uuid, 'f7611e8d-6850-4319-897d-2b10ce9c60bf'::uuid, null::uuid,
    '[{"label": "The trophy room", "href": "/achievements", "kind": "page"}]'::jsonb
  )
on conflict (slug) where slug is not null do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  category = excluded.category,
  sport = excluded.sport,
  author = excluded.author,
  author_role = excluded.author_role,
  date = excluded.date,
  read_time_minutes = excluded.read_time_minutes,
  cover_image = excluded.cover_image,
  cover_caption = excluded.cover_caption,
  cover_credit = excluded.cover_credit,
  tags = excluded.tags,
  related_event_id = excluded.related_event_id,
  related_achievement_id = excluded.related_achievement_id,
  related_team_id = excluded.related_team_id,
  related_links = excluded.related_links;

-- Readable addresses for any other existing post.
update public.blog_posts
set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
where slug is null;

-- 4. "Send congrats" on stories ------------------------------------------------------------
create table if not exists public.blog_claps (
  post_id uuid primary key references public.blog_posts (id) on delete cascade,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now()
);
alter table public.blog_claps enable row level security;
drop policy if exists "blog_claps_public_read" on public.blog_claps;
create policy "blog_claps_public_read" on public.blog_claps for select to anon, authenticated using (true);

-- The only way to change a count: add one (the site limits it to one per visitor).
create or replace function public.clap_blog_post(p_post uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.blog_claps (post_id, count)
  select id, 1 from public.blog_posts where id = p_post
  on conflict (post_id) do update set count = public.blog_claps.count + 1, updated_at = now()
  returning count;
$$;
revoke all on function public.clap_blog_post(uuid) from public;
grant execute on function public.clap_blog_post(uuid) to anon, authenticated;

commit;
