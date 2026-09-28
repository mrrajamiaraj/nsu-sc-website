-- Players: optional gender so mixed teams (e.g. Volleyball) can split their roster
-- into Male and Female sections. Null = not split (staff, or single-gender teams).
alter table players
  add column gender text null check (gender in ('Male', 'Female'));
