-- Home hero badge text ("North South University"), editable from the admin dashboard.
insert into site_content (page_key, content, featured_event_id)
values ('home_badge', 'North South University', null)
on conflict (page_key) do nothing;
