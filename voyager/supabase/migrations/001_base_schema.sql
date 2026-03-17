-- ============================================================
-- Voyager Travel Manager — Base Schema
-- Migration: 001_base_schema
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type agency_plan as enum ('free', 'starter', 'pro');
create type user_role as enum ('admin', 'gestor', 'atendente');
create type booking_status as enum ('draft', 'pending_payment', 'confirmed', 'cancelled', 'completed');
create type transaction_type as enum ('income', 'expense', 'refund');
create type transaction_status as enum ('pending', 'paid', 'overdue', 'cancelled');
create type payment_method as enum ('pix', 'cartao', 'boleto', 'transferencia');
create type task_priority as enum ('low', 'medium', 'high');
create type task_status as enum ('todo', 'in_progress', 'done');

-- ============================================================
-- TABLE: agencies
-- ============================================================
create table agencies (
  id         uuid primary key default uuid_generate_v4(),
  name       varchar(100) not null,
  slug       varchar(50) unique not null,
  plan       agency_plan not null default 'free',
  logo_url   text,
  phone      varchar(20),
  email      varchar(150),
  cnpj       varchar(18),
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: users (extends auth.users)
-- ============================================================
create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  agency_id  uuid not null references agencies(id) on delete cascade,
  full_name  varchar(100) not null,
  role       user_role not null default 'atendente',
  avatar_url text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: clients
-- ============================================================
create table clients (
  id               uuid primary key default uuid_generate_v4(),
  agency_id        uuid not null references agencies(id) on delete cascade,
  full_name        varchar(150) not null,
  email            varchar(150),
  phone            varchar(20),
  cpf              varchar(14),
  birth_date       date,
  passport_number  varchar(20),
  passport_expiry  date,
  notes            text,
  tags             text[] not null default '{}',
  created_by       uuid references users(id) on delete set null,
  created_at       timestamptz not null default now(),
  constraint clients_email_agency_unique unique (agency_id, email)
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
create table bookings (
  id               uuid primary key default uuid_generate_v4(),
  agency_id        uuid not null references agencies(id) on delete cascade,
  client_id        uuid not null references clients(id) on delete restrict,
  assigned_to      uuid references users(id) on delete set null,
  reference_code   varchar(20) unique not null,
  status           booking_status not null default 'draft',
  destination      varchar(200) not null,
  departure_date   date not null,
  return_date      date,
  pax_count        integer not null default 1,
  total_price      numeric(12,2) not null,
  cost_price       numeric(12,2),
  notes            text,
  cancelled_reason text,
  history          jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- TABLE: transactions
-- ============================================================
create table transactions (
  id             uuid primary key default uuid_generate_v4(),
  agency_id      uuid not null references agencies(id) on delete cascade,
  booking_id     uuid references bookings(id) on delete set null,
  type           transaction_type not null,
  status         transaction_status not null default 'pending',
  amount         numeric(12,2) not null,
  due_date       date,
  paid_at        timestamptz,
  payment_method payment_method,
  description    text,
  created_by     uuid references users(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- TABLE: tasks
-- ============================================================
create table tasks (
  id           uuid primary key default uuid_generate_v4(),
  agency_id    uuid not null references agencies(id) on delete cascade,
  booking_id   uuid references bookings(id) on delete set null,
  assigned_to  uuid references users(id) on delete set null,
  title        varchar(200) not null,
  description  text,
  priority     task_priority not null default 'medium',
  status       task_status not null default 'todo',
  due_date     timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- ============================================================
-- FUNCTION: generate reference_code (VOY-YYYY-NNNN)
-- ============================================================
create sequence if not exists booking_seq;

create or replace function generate_reference_code(p_agency_id uuid)
returns varchar as $$
declare
  year_str varchar(4);
  seq_num  bigint;
  code     varchar(20);
begin
  year_str := to_char(now(), 'YYYY');
  seq_num  := nextval('booking_seq');
  code     := 'VOY-' || year_str || '-' || lpad(seq_num::text, 4, '0');
  return code;
end;
$$ language plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table agencies    enable row level security;
alter table users       enable row level security;
alter table clients     enable row level security;
alter table bookings    enable row level security;
alter table transactions enable row level security;
alter table tasks       enable row level security;

-- Helper function: get current user's agency_id
create or replace function my_agency_id()
returns uuid as $$
  select agency_id from users where id = auth.uid()
$$ language sql security definer stable;

-- Helper function: get current user's role
create or replace function my_role()
returns user_role as $$
  select role from users where id = auth.uid()
$$ language sql security definer stable;

-- agencies: users can only see their own agency
create policy "users_see_own_agency" on agencies
  for select using (id = my_agency_id());

create policy "admin_update_agency" on agencies
  for update using (id = my_agency_id() and my_role() = 'admin');

-- users: see only users from same agency
create policy "users_see_agency_members" on users
  for select using (agency_id = my_agency_id());

create policy "admin_manage_users" on users
  for all using (agency_id = my_agency_id() and my_role() = 'admin');

-- users: update own profile
create policy "users_update_own_profile" on users
  for update using (id = auth.uid());

-- clients
create policy "members_read_clients" on clients
  for select using (agency_id = my_agency_id());

create policy "members_insert_clients" on clients
  for insert with check (agency_id = my_agency_id());

create policy "members_update_clients" on clients
  for update using (agency_id = my_agency_id());

-- bookings
create policy "members_read_bookings" on bookings
  for select using (agency_id = my_agency_id());

create policy "members_insert_bookings" on bookings
  for insert with check (agency_id = my_agency_id());

create policy "members_update_bookings" on bookings
  for update using (agency_id = my_agency_id());

-- transactions (only gestor+ can read)
create policy "gestor_read_transactions" on transactions
  for select using (agency_id = my_agency_id() and my_role() in ('admin', 'gestor'));

create policy "gestor_insert_transactions" on transactions
  for insert with check (agency_id = my_agency_id() and my_role() in ('admin', 'gestor'));

create policy "gestor_update_transactions" on transactions
  for update using (agency_id = my_agency_id() and my_role() in ('admin', 'gestor'));

-- tasks
create policy "members_read_tasks" on tasks
  for select using (agency_id = my_agency_id());

create policy "members_insert_tasks" on tasks
  for insert with check (agency_id = my_agency_id());

create policy "members_update_tasks" on tasks
  for update using (agency_id = my_agency_id());

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_users_agency_id        on users(agency_id);
create index idx_clients_agency_id      on clients(agency_id);
create index idx_bookings_agency_id     on bookings(agency_id);
create index idx_bookings_client_id     on bookings(client_id);
create index idx_bookings_status        on bookings(status);
create index idx_bookings_departure     on bookings(departure_date);
create index idx_transactions_agency_id on transactions(agency_id);
create index idx_transactions_booking   on transactions(booking_id);
create index idx_tasks_agency_id        on tasks(agency_id);
create index idx_tasks_assigned_to      on tasks(assigned_to);
