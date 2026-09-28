-- Add "category" to players — e.g. "Boys"/"Female" sub-squads within one team (Volleyball).
-- Free-text and nullable: most teams have a single squad and leave this unset.
alter table players add column category text;
