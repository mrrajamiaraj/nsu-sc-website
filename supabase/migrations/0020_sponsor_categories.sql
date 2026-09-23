-- Sponsors are grouped into Corporate and Media partners (shown as separate sections),
-- and admins drag-reorder within each group. sort_order is now per-category.
alter table sponsors add column category text not null default 'Corporate'
  check (category in ('Corporate', 'Media'));

update sponsors set category = 'Media'
where name in (
  'The Daily Star', 'Daily Sun', 'The Daily Janakantha', 'Somoy News', 'News24', 'Ekattor TV',
  'Star News', 'Star Play', 'Radio Today 89.6 FM', 'Toffee', 'Daily NSU', 'Dhaka Chronicles'
);

-- Ranked by company/brand value (Sep 2026 market caps and valuations where public;
-- private local brands ranked by estimated size).
update sponsors s
  set sort_order = o.idx - 1
  from unnest(array[
    'Coca-Cola', 'Airtel', 'Honor', 'Suzuki', 'TVS', 'Yamaha', 'CCI Bangladesh', 'Grameenphone',
    'Nagad', 'Bashundhara Kings', 'Zhiyun', 'ACI Fruit Sal', 'Dhaka Bank PLC', 'Smart', 'Igloo',
    'Polar Ice Cream', 'Dan Cake', 'Clemon', 'Maxx Cola', 'Funtastic', 'Detos', 'ShareTrip',
    'Shohoz', 'East West Medical College & Hospital', 'Dera Resort & Spa', 'Takyon E-Bike',
    'Turag Active', 'Twelve', 'Duranta Sports Gallery', 'Zulcan Indoor Arena', 'Jersey Freak BD',
    'Khar', 'Bridal Heritage', 'Moja Lage', 'Partner'
  ]) with ordinality as o(name, idx)
  where s.name = o.name and s.category = 'Corporate';

update sponsors s
  set sort_order = o.idx - 1
  from unnest(array[
    'Toffee', 'The Daily Star', 'Somoy News', 'Ekattor TV', 'News24', 'Daily Sun',
    'The Daily Janakantha', 'Star News', 'Star Play', 'Radio Today 89.6 FM', 'Dhaka Chronicles',
    'Daily NSU'
  ]) with ordinality as o(name, idx)
  where s.name = o.name and s.category = 'Media';

drop index if exists sponsors_sort_idx;
create index sponsors_category_sort_idx on sponsors (category, sort_order);

create or replace function reorder_sponsors(p_category text, p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update sponsors s
  set sort_order = o.idx - 1,
      updated_at = now()
  from unnest(p_ordered_ids) with ordinality as o(id, idx)
  where s.id = o.id and s.category = p_category;
end;
$$;

grant execute on function reorder_sponsors(text, uuid[]) to authenticated;
