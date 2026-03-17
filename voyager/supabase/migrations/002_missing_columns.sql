-- ============================================================
-- Voyager Travel Manager — Schema Updates
-- Migration: 002_missing_columns
-- ============================================================
-- Applies additions identified during module development.
-- Safe to run on top of 001_base_schema.sql.
-- ============================================================


-- ============================================================
-- TABLE: agencies — extra profile fields
-- ============================================================
alter table agencies
  add column if not exists website  text,
  add column if not exists address  text,
  add column if not exists timezone varchar(50)  not null default 'America/Sao_Paulo',
  add column if not exists currency varchar(10)  not null default 'BRL';


-- ============================================================
-- TABLE: users — phone number (separate from auth.users)
-- ============================================================
alter table users
  add column if not exists phone varchar(20);


-- ============================================================
-- TABLE: clients — nationality field
-- ============================================================
alter table clients
  add column if not exists nationality varchar(80);


-- ============================================================
-- TABLE: transactions — category & notes
-- ============================================================
alter table transactions
  add column if not exists category varchar(50),
  add column if not exists notes    text;

-- tasks.due_date was created as timestamptz; normalize to date
-- (safe cast — existing values keep their date part)
alter table tasks
  alter column due_date type date using (due_date::date);


-- ============================================================
-- ROW LEVEL SECURITY — missing policies
-- ============================================================

-- clients: allow members to delete (e.g. soft-delete via API)
create policy "members_delete_clients" on clients
  for delete using (agency_id = my_agency_id());

-- tasks: allow members to delete
create policy "members_delete_tasks" on tasks
  for delete using (agency_id = my_agency_id());


-- ============================================================
-- TRIGGER: sync new auth user → public.users placeholder
-- Called after an invited user accepts & completes onboarding.
-- The trigger only fires when the raw_user_meta_data contains
-- agency_id + full_name (set by the invite/onboarding flow).
-- ============================================================
create or replace function handle_new_auth_user()
returns trigger as $$
begin
  -- Only create the public profile if metadata carries agency_id
  if (new.raw_user_meta_data ->> 'agency_id') is not null then
    insert into public.users (id, agency_id, full_name, role)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'agency_id')::uuid,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'atendente')
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger first in case migration is re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();


-- ============================================================
-- ADDITIONAL INDEXES for new columns & common filter patterns
-- ============================================================
create index if not exists idx_transactions_status      on transactions(status);
create index if not exists idx_transactions_type        on transactions(type);
create index if not exists idx_transactions_due_date    on transactions(due_date);
create index if not exists idx_transactions_paid_at     on transactions(paid_at);
create index if not exists idx_tasks_status             on tasks(status);
create index if not exists idx_tasks_due_date           on tasks(due_date);
create index if not exists idx_clients_created_by       on clients(created_by);
create index if not exists idx_bookings_assigned_to     on bookings(assigned_to);
create index if not exists idx_bookings_created_at      on bookings(created_at desc);
