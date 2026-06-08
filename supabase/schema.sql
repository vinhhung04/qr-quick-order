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
  -- Optional custom display name for non-numbered areas (e.g. "Phòng lạnh 1",
  -- "Chòi sàn"). When null, the UI falls back to "Bàn {table_number}".
  label text,
  created_at timestamptz not null default now()
);

alter table public.tables add column if not exists label text;

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

-- ----------------------------------------------------------------------------
-- create_order_with_items: creates an order plus its order_items atomically.
-- Without this, a customer submitting an order would trigger two separate
-- inserts from the client (orders, then order_items); if the second one
-- failed partway through, the database would be left with an "empty" order
-- (a row in `orders` with no matching `order_items`). Wrapping both inserts
-- in a single PL/pgSQL function makes them one transaction — either both
-- succeed and the order_id is returned, or any failure raises an exception
-- and Postgres rolls back the whole thing, leaving no orphaned order behind.
-- ----------------------------------------------------------------------------
create or replace function public.create_order_with_items(
  p_table_id uuid,
  p_note text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_order_id uuid;
  v_total_amount numeric(12, 0);
begin
  if p_table_id is null then
    raise exception 'table_id is required';
  end if;

  if not exists (
    select 1 from public.tables
    where id = p_table_id and is_active = true
  ) then
    raise exception 'table not found or inactive';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'order items are required';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      menu_item_id uuid,
      item_name text,
      price numeric,
      quantity integer,
      note text
    )
    where
      item_name is null
      or btrim(item_name) = ''
      or price is null
      or price < 0
      or quantity is null
      or quantity <= 0
  ) then
    raise exception 'invalid order item';
  end if;

  select coalesce(sum(item.price * item.quantity), 0)
  into v_total_amount
  from jsonb_to_recordset(p_items) as item(
    menu_item_id uuid,
    item_name text,
    price numeric,
    quantity integer,
    note text
  );

  insert into public.orders (table_id, total_amount, note)
  values (p_table_id, v_total_amount, nullif(btrim(coalesce(p_note, '')), ''))
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    menu_item_id,
    item_name,
    price,
    quantity,
    note
  )
  select
    v_order_id,
    item.menu_item_id,
    item.item_name,
    item.price,
    item.quantity,
    nullif(btrim(coalesce(item.note, '')), '')
  from jsonb_to_recordset(p_items) as item(
    menu_item_id uuid,
    item_name text,
    price numeric,
    quantity integer,
    note text
  );

  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(uuid, text, jsonb) to anon;

-- ----------------------------------------------------------------------------
-- table_requests: lightweight call-staff / request-bill notifications sent
-- from the customer ordering page and shown live on /staff/orders.
-- ----------------------------------------------------------------------------
create table if not exists public.table_requests (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables (id) on delete cascade,
  type text not null check (type in ('call_staff', 'request_bill')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists table_requests_table_id_idx on public.table_requests (table_id);
create index if not exists table_requests_status_idx on public.table_requests (status);

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
alter table public.table_requests enable row level security;

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

drop policy if exists "anon full access" on public.table_requests;
create policy "anon full access" on public.table_requests for all to anon using (true) with check (true);

-- ============================================================================
-- Realtime: add orders/order_items/table_requests to the supabase_realtime
-- publication so the staff screen receives INSERT events without polling.
-- (If this errors saying the table is already a member, that's fine — it
-- means Realtime is already enabled for it.)
-- ============================================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.table_requests;

-- ============================================================================
-- Storage: public bucket for menu item images, uploaded from /admin/menu.
-- Allows anyone (anon) to read and upload — fine for an MVP with no auth;
-- tighten the insert/update/delete policies before going to production.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "menu-images public read" on storage.objects;
create policy "menu-images public read" on storage.objects
  for select to anon
  using (bucket_id = 'menu-images');

drop policy if exists "menu-images anon upload" on storage.objects;
create policy "menu-images anon upload" on storage.objects
  for insert to anon
  with check (bucket_id = 'menu-images');

drop policy if exists "menu-images anon manage" on storage.objects;
create policy "menu-images anon manage" on storage.objects
  for update to anon
  using (bucket_id = 'menu-images')
  with check (bucket_id = 'menu-images');

drop policy if exists "menu-images anon delete" on storage.objects;
create policy "menu-images anon delete" on storage.objects
  for delete to anon
  using (bucket_id = 'menu-images');
