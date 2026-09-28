-- Alumni: add an optional Facebook link, shown as an icon on the alumni card
-- (matches the member/player cards, see 0014_member_socials.sql).
alter table alumni add column facebook text null;
