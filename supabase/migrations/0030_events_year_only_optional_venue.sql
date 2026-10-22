-- Past events imported from the club's records are often only known to the
-- year, sometimes not even that, and many have no recorded venue.
--   date      nullable — unknown date (sorted last, nothing shown)
--   venue     nullable — unknown venue (nothing shown)
--   year_only true when only the year of `date` is known (stored as YYYY-01-01,
--             displayed as just "YYYY")
alter table public.events alter column date drop not null;
alter table public.events alter column venue drop not null;
alter table public.events add column year_only boolean not null default false;
