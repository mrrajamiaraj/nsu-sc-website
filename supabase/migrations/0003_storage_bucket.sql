-- Public "media" bucket for event banners, team/player/member photos, about images, blog covers, sponsor logos.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_public_read on storage.objects for select
  using (bucket_id = 'media');

create policy media_authenticated_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy media_authenticated_update on storage.objects for update to authenticated
  using (bucket_id = 'media');

create policy media_authenticated_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media');
