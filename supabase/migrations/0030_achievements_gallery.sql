-- Extra photos for the achievement detail page's slider. The existing photo
-- column stays the cover image (shown on the card and first in the slider).
alter table achievements add column if not exists gallery text[] not null default '{}';
