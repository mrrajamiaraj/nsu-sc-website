-- Sub-Executive members don't always have a distinct designation, so it's
-- no longer required at the database level (enforced per-tier in app validation instead).
alter table members alter column designation drop not null;
