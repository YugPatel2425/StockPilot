-- Profiles table with balance for fake currency
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  balance numeric(12,2) not null default 100000.00,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Holdings table
create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  shares numeric(12,4) not null default 0,
  avg_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, symbol)
);

alter table public.holdings enable row level security;
create policy "holdings_select_own" on public.holdings for select using (auth.uid() = user_id);
create policy "holdings_insert_own" on public.holdings for insert with check (auth.uid() = user_id);
create policy "holdings_update_own" on public.holdings for update using (auth.uid() = user_id);
create policy "holdings_delete_own" on public.holdings for delete using (auth.uid() = user_id);

-- Transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text,
  type text not null check (type in ('buy', 'sell', 'deposit')),
  shares numeric(12,4),
  price_per_share numeric(12,2),
  total_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);

-- Watchlist table
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default now(),
  unique(user_id, symbol)
);

alter table public.watchlist enable row level security;
create policy "watchlist_select_own" on public.watchlist for select using (auth.uid() = user_id);
create policy "watchlist_insert_own" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist for delete using (auth.uid() = user_id);
