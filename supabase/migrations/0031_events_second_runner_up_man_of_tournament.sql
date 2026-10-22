-- Extra result fields shown on the event detail page.
alter table public.events add column second_runner_up text;
alter table public.events add column man_of_tournament text;
