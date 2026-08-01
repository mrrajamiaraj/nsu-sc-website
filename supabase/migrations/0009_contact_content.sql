-- Contact page info (address, phone, email, office hours), editable from the admin dashboard.
insert into site_content (page_key, content, featured_event_id) values
  ('contact_address', 'Bashundhara, Dhaka 1229, Bangladesh', null),
  ('contact_phone', '+880 2-55668200', null),
  ('contact_email', 'sports@northsouth.edu', null),
  ('contact_hours', '7:30 AM - 10:00 PM', null)
on conflict (page_key) do nothing;
