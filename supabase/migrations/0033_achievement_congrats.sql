-- "Send congrats" on each achievement's match report: one running count per achievement.
-- Anyone can read the counts; the only way to change one is send_congrats(), which adds 1.
-- The site limits it to one per visitor (a cookie and localStorage); this is a cheer count,
-- not a vote, so it doesn't try to stop a determined repeat sender.

create table if not exists public.achievement_congrats (
  achievement_id uuid primary key references public.achievements (id) on delete cascade,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.achievement_congrats enable row level security;

drop policy if exists "achievement_congrats_public_read" on public.achievement_congrats;
create policy "achievement_congrats_public_read" on public.achievement_congrats
  for select to anon, authenticated using (true);

create or replace function public.send_congrats(p_achievement uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.achievement_congrats (achievement_id, count)
  select id, 1 from public.achievements where id = p_achievement
  on conflict (achievement_id) do update
    set count = public.achievement_congrats.count + 1, updated_at = now()
  returning count;
$$;

revoke all on function public.send_congrats(uuid) from public;
grant execute on function public.send_congrats(uuid) to anon, authenticated;
