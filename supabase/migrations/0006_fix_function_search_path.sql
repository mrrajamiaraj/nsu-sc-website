-- Harden against search_path hijacking (Supabase security linter: function_search_path_mutable).
alter function activate_panel(uuid) set search_path = public;
alter function reorder_players(uuid, uuid[]) set search_path = public;
alter function reorder_members(uuid, text, uuid[]) set search_path = public;
