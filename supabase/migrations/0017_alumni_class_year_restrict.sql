-- alumni.class_year_id was "on delete cascade", so deleting a class year
-- silently deleted every alumnus tagged with it. Require the admin to
-- reassign/delete those alumni first instead of losing their profiles.
alter table alumni drop constraint alumni_class_year_id_fkey;
alter table alumni add constraint alumni_class_year_id_fkey
  foreign key (class_year_id) references alumni_class_years(id) on delete restrict;
