-- ============================================================================
-- QR Quick Order — Database schema
--
-- How to use:
--   1. Open your Supabase project → SQL Editor → New query.
--   2. Paste this entire file and click "Run".
--   3. Then run seed.sql to load sample data.
--   4. Finally, enable Realtime replication for `orders` (and `order_items`)
--      via Database → Replication → toggle the tables on, OR run:
--        alter publication supabase_realtime add table orders, order_items;
--
-- Notes on RLS: this MVP has no authentication (customers don't log in, staff
-- and admin screens are unauthenticated), so we enable RLS but allow the
-- `anon` role full access. This is fine for an MVP/demo; for production you'd
-- want to restrict writes (e.g. only allow inserting orders, not editing menu)
-- behind real authentication.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- tables: physical tables in the restaurant, each with its own QR token
-- ----------------------------------------------------------------------------
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer not null unique,
  qr_token text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- categories: menu groupings (Món chính, Đồ uống, ...)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- menu_items: dishes/drinks belonging to a category
-- ----------------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text,
  price numeric(12, 0) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  is_popular boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_category_id_idx on public.menu_items (category_id);

-- ----------------------------------------------------------------------------
-- orders: one row per submitted order from a table
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables (id) on delete cascade,
  total_amount numeric(12, 0) not null default 0 check (total_amount >= 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists orders_table_id_idx on public.orders (table_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ----------------------------------------------------------------------------
-- order_items: line items for an order. item_name and price are SNAPSHOTTED
-- at order time (not joined live from menu_items) so that later edits to the
-- menu (renames, price changes, deletions) never rewrite order history.
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  item_name text not null,
  price numeric(12, 0) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ============================================================================
-- Row Level Security
-- MVP has no auth, so we allow the `anon` role to do everything. Tighten
-- these policies before going to production with real customer data.
-- ============================================================================
alter table public.tables enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "anon full access" on public.tables;
create policy "anon full access" on public.tables for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.categories;
create policy "anon full access" on public.categories for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.menu_items;
create policy "anon full access" on public.menu_items for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.orders;
create policy "anon full access" on public.orders for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.order_items;
create policy "anon full access" on public.order_items for all to anon using (true) with check (true);

-- ============================================================================
-- Realtime: add orders/order_items to the supabase_realtime publication so
-- the staff screen receives INSERT events without polling.
-- (If this errors saying the table is already a member, that's fine — it
-- means Realtime is already enabled for it.)
-- ============================================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
