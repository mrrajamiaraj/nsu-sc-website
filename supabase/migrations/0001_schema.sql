-- NSU SC Website — core schema (SRS.md §6 + user-requested extras: blog_posts, alumni, sponsors)
create extension if not exists pgcrypto;

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  end_date date null,
  venue text not null,
  description text not null,
  banner_image text null,
  gallery text[] not null default '{}',
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Running', 'Finished')),
  team_count int null,
  participant_count int null,
  winners text null,
  runners_up text null,
  prize_pool text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  banner_image text null,
  nickname text null,
  achievement text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  photo text null,
  email text not null,
  position text not null,
  bio text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index players_team_sort_idx on players (team_id, sort_order);

create table panels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_active_panel_idx on panels (is_active) where is_active = true;

create table members (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references panels(id) on delete cascade,
  name text not null,
  photo text null,
  designation text not null,
  tier text not null check (tier in ('Executive', 'Sub-Executive', 'General')),
  email text not null,
  phone text not null,
  additional_info text null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index members_panel_tier_sort_idx on members (panel_id, tier, sort_order);

create table registration_settings (
  id smallint primary key default 1 check (id = 1),
  is_open boolean not null default false,
  google_form_url text null,
  next_intake_date date null,
  updated_at timestamptz not null default now(),
  constraint registration_requires_url check (not is_open or google_form_url is not null)
);

create table site_content (
  page_key text primary key,
  content text not null default '',
  featured_event_id uuid null references events(id) on delete set null,
  images text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table admin_security (
  id smallint primary key default 1 check (id = 1),
  failed_attempts int not null default 0,
  locked_until timestamptz null,
  updated_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid null references auth.users(id) on delete set null,
  actor_label text null,
  action text not null,
  target_table text null,
  target_id text null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);
create index audit_log_created_at_idx on audit_log (created_at desc);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null,
  content text not null default '',
  category text not null,
  cover_image text null,
  author text not null,
  date date not null,
  read_time_minutes int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table alumni (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text null,
  graduation_year int not null,
  tier text not null check (tier in ('Executive', 'Sub-Executive')),
  team text not null,
  current_role_title text not null,
  quote text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
