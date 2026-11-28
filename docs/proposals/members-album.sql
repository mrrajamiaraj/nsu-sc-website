-- The Panel Album: run this once in the Supabase SQL editor (Project > SQL editor).
-- Reviewed by hand; it is NOT in supabase/migrations, so nothing applies it automatically.
-- Safe to re-run: every column is added only if missing. It changes no existing data.
--
-- Adds the member details the album's card backs show. The bio uses the existing
-- additional_info column. Each value shows on /members only once it is filled in for that
-- member in Admin > Members.
--
-- Phone numbers and WhatsApp stay off the public page until "Show phone publicly" is turned
-- on for that member (off by default).

begin;

alter table public.members
  add column if not exists department text,
  add column if not exists batch text,
  add column if not exists sport text,
  add column if not exists instagram text,
  add column if not exists whatsapp text,
  add column if not exists show_phone_publicly boolean not null default false;

commit;
