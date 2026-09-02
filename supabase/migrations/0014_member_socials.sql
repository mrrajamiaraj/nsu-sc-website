-- Members: add optional Facebook/LinkedIn contact links, and relax email/phone
-- to optional so a member card can show whichever contact icons the admin filled in.
alter table members
  add column facebook text null,
  add column linkedin text null;

alter table members
  alter column email drop not null,
  alter column phone drop not null;
