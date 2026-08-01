-- Home hero showcase video URL, editable from the admin dashboard.
insert into site_content (page_key, content, featured_event_id)
values ('home_video_url', '', null)
on conflict (page_key) do nothing;
