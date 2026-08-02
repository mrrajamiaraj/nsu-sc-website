-- Site-wide logo shown in the navbar and footer, editable from the admin dashboard.
-- Empty content means "no logo uploaded yet" — the UI falls back to the "NSU" text badge.
insert into site_content (page_key, content, featured_event_id)
values ('site_logo', '', null)
on conflict (page_key) do nothing;
