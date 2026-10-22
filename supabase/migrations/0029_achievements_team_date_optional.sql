-- Team and date are optional for achievements: club-wide achievements (awards,
-- partnerships, ceremonies) belong to no single team, and some historical
-- entries have no known date. Undated entries sort after dated ones.
alter table achievements alter column team_id drop not null;
alter table achievements alter column date drop not null;
