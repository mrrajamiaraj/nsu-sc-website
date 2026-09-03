-- Add "Faculty Advisor" as a member tier.
alter table members drop constraint members_tier_check;
alter table members add constraint members_tier_check
  check (tier in ('Executive', 'Sub-Executive', 'General', 'Faculty Advisor'));
