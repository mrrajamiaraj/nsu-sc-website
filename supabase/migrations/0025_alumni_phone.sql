-- Alumni: add an optional phone number, shown as a contact icon on the alumni
-- card next to Facebook (see 0024_alumni_facebook.sql).
alter table alumni add column phone text null;
