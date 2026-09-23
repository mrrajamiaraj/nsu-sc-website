-- Sponsors display in a curated order (biggest brands first, media partners last)
-- instead of alphabetically. New sponsors are appended to the end by the admin action.
alter table sponsors add column sort_order int not null default 0;

update sponsors s
  set sort_order = o.idx - 1
  from unnest(array[
    'Coca-Cola', 'CCI Bangladesh', 'Grameenphone', 'Airtel', 'Dhaka Bank PLC', 'Nagad',
    'Suzuki', 'Yamaha', 'TVS', 'Honor', 'ShareTrip', 'Shohoz', 'Smart', 'Clemon',
    'Maxx Cola', 'ACI Fruit Sal', 'Dan Cake', 'Polar Ice Cream', 'Igloo', 'Funtastic',
    'Turag Active', 'Detos', 'Bashundhara Kings', 'Zhiyun', 'Takyon E-Bike',
    'Dera Resort & Spa', 'Zulcan Indoor Arena', 'Twelve', 'Khar', 'Duranta Sports Gallery',
    'Partner', 'Jersey Freak BD', 'Moja Lage', 'East West Medical College & Hospital',
    'Bridal Heritage', 'The Daily Star', 'Daily Sun', 'The Daily Janakantha', 'Somoy News',
    'News24', 'Ekattor TV', 'Star News', 'Star Play', 'Radio Today 89.6 FM', 'Toffee',
    'Daily NSU', 'Dhaka Chronicles'
  ]) with ordinality as o(name, idx)
  where s.name = o.name;

create index sponsors_sort_idx on sponsors (sort_order);
