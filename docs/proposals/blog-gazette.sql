-- The NSU SC Gazette: run this once in the Supabase SQL editor (Project > SQL editor).
-- Reviewed by hand; it is NOT in supabase/migrations, so nothing applies it automatically.
-- Safe to re-run: columns and tables are added only if missing, and the stories are keyed
-- by slug.
--
-- 1. Adds the Gazette fields to blog_posts.
-- 2. Removes the four demo posts (fictional teams and people, no body).
-- 3. Publishes four real stories written from the club's own records (achievements and events).
-- 4. Adds the "Send congrats" count for stories.

begin;

-- 1. Gazette fields ---------------------------------------------------------------------
alter table public.blog_posts
  add column if not exists slug text,
  add column if not exists sport text,
  add column if not exists author_role text,
  add column if not exists author_photo text,
  add column if not exists cover_credit text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists related_event_id uuid references public.events (id) on delete set null,
  add column if not exists related_achievement_id uuid references public.achievements (id) on delete set null,
  add column if not exists related_team_id uuid references public.teams (id) on delete set null;

create unique index if not exists blog_posts_slug_key on public.blog_posts (slug) where slug is not null;

-- 2. Remove the demo posts ------------------------------------------------------------------
delete from public.blog_posts
where id in (
  'dcc4893b-7026-492f-8189-31cca8a84963', -- Thunder Lions Clinch Third Straight Championship
  '698fc437-5d60-4ca4-a336-96c6178b5d36', -- Inside the Cricket Tournament 2026 Build-Up
  'bbd02275-643c-4dc3-b8fb-bbae149ddbcf', -- Player Spotlight: Rahim Ahmed
  'f21a77a7-332e-43fb-b6f6-500a009673d3'  -- Recap: Annual Sports Excellence Awards
);

-- 3. Four real stories (oldest first, so the Mridul profile leads the front page) ----------
insert into public.blog_posts
  (slug, title, excerpt, content, category, sport, author, author_role, date, read_time_minutes,
   cover_image, cover_credit, tags, related_event_id, related_achievement_id, related_team_id, created_at)
select * from (values
  (
    'runners-up-bsl-inter-university-futsal-2024',
    'Runners-up at the BSL Inter-University Futsal Tournament 2024',
    'North South University''s men''s football team reached the final and finished second.',
    '<p>North South University''s men''s football team finished as runners-up at the BSL Inter-University Futsal Tournament 2024.</p><p>The squad''s players, captain and staff are on its team page, and the result is in the club''s trophy room.</p>',
    'Results', 'Football', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-28', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/achievements/9979843d-7600-4c81-8175-dba6453e1cb4.webp',
    'NSU Games & Sports Club', array['futsal', 'bsl', 'football-men'],
    null::uuid, 'fc9eca9d-18c0-4ad0-b2e3-77af14242174'::uuid, 'ab8b9b52-b24b-4c58-a004-e14ea63e319e'::uuid, now() - interval '4 minutes'
  ),
  (
    'nsu-sc-appreciation-partner-punab-july-uprising-memorial-award-2026',
    'NSU SC named Appreciation Partner at the PUNAB July Uprising Memorial Award 2026',
    'The club was recognised as an Appreciation Partner of the award.',
    '<p>NSU Games &amp; Sports Club has been recognised as an Appreciation Partner of the PUNAB July Uprising Memorial Award 2026.</p><p>In its announcement the club called the recognition a sign of its "dedication, community spirit, and continuous commitment to excellence", and thanked everyone who supported it.</p>',
    'Club news', null, 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-28', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/achievements/3286493f-119c-41e7-80cb-e753f38f922d.webp',
    'NSU Games & Sports Club', array['punab', 'club'],
    null::uuid, 'd09cef27-371e-4b86-a6a5-d493b57891db'::uuid, null::uuid, now() - interval '3 minutes'
  ),
  (
    'chess-carrom-season-2-all-the-champions',
    'Chess & Carrom Season 2: all the champions',
    'Four titles were decided at the NSU Main Plaza: chess, and male, female and mixed doubles.',
    '<p>The second season of NSU Chess &amp; Carrom was played at the NSU Main Plaza on 6 and 7 October 2026, organised by NSU Games &amp; Sports Club.</p><h2>The champions</h2><ul><li><strong>Chess:</strong> Ragib Arif Sharar, ahead of Imtiaz Ahammed</li><li><strong>Male doubles:</strong> Shadow Hunters, ahead of Bio Micro Breakers</li><li><strong>Female doubles:</strong> Double Trouble, ahead of Candy Crush</li><li><strong>Mixed doubles:</strong> She &amp; Coach, ahead of Team Lanka</li></ul><h2>Results and photos</h2><p>The full results table is below, and the event page has the photos.</p>',
    'Results', 'Chess & carrom', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-28', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/f6915586-6ce5-45cf-a3f9-dc323806b563.webp',
    'NSU Games & Sports Club', array['chess', 'carrom', 'season-2'],
    'a7dfeee3-fdb6-4c20-a2f1-1530aa61fe1d'::uuid, null::uuid, null::uuid, now() - interval '2 minutes'
  ),
  (
    'mridul-futsal-league-bangladesh-2026',
    'Mridul captains IM10 FC to the Futsal League Bangladesh title',
    'Kazi Ibrahim Ahamed Mridul led IM10 FC to the Futsal League Bangladesh 2026 championship and was named Best Player of the Tournament.',
    '<p>Kazi Ibrahim Ahamed Mridul, an NSU student, captained IM10 FC to the Futsal League Bangladesh 2026 title, and was named Best Player of the Tournament.</p><h2>Leading from the front</h2><p>As captain, Mridul led IM10 FC through the league to the championship, and finished the tournament with its top individual award.</p><blockquote><p>From roaming the NAC-SAC corridors to taking center stage on the national field.</p></blockquote><h2>Pride on campus</h2><p>NSU Games &amp; Sports Club congratulated him on the win, saying his leadership on the court brought "immense pride to the entire North South University community".</p>',
    'Profiles', 'Futsal', 'NSU SC Media Team', 'NSU Games & Sports Club', date '2026-11-28', 1,
    'https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/achievements/76a9fb2c-60f9-4287-b774-6126a7b0245c.webp',
    'NSU Games & Sports Club', array['futsal', 'im10-fc', 'best-player'],
    null::uuid, '382c49a4-67c5-4ae2-9453-2503a29aa1a2'::uuid, null::uuid, now() - interval '1 minute'
  )
) as v (slug, title, excerpt, content, category, sport, author, author_role, date, read_time_minutes,
        cover_image, cover_credit, tags, related_event_id, related_achievement_id, related_team_id, created_at)
where not exists (select 1 from public.blog_posts b where b.slug = v.slug);

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
