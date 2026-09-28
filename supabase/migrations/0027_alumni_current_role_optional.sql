-- Current role is optional for alumni.
alter table alumni alter column current_role_title drop not null;
