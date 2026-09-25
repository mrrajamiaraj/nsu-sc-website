-- Players: add optional phone and Facebook contact options, shown as icons on the
-- player card alongside email (matches the member card, see 0014_member_socials.sql).
alter table players
  add column phone text null,
  add column facebook text null;
