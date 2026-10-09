-- DuBose Photography app schema for Supabase (Postgres).
-- Run this in the Supabase SQL editor on a fresh project, then run seed.sql
-- if you want sample data. Row level security keeps clients limited to
-- their own galleries, favorites, orders and bookings.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------------
-- Users listed here (by auth user id) can manage everything from the
-- Supabase dashboard or a future admin app. Add DuBose's login here.
create table if not exists staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Public content: travel sessions, hostesses, time slots, portfolio
-- ---------------------------------------------------------------------------
create type session_status as enum ('open', 'waitlist', 'full', 'past');

create table if not exists photo_sessions (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  state char(2) not null,
  venue_name text,
  address text,
  start_date date not null,
  end_date date not null,
  sitting_fee numeric(8, 2) not null default 100,
  minimum_order numeric(8, 2) not null default 200,
  status session_status not null default 'open',
  notes text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists session_hostesses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references photo_sessions (id) on delete cascade,
  name text not null,
  email text,
  phone text
);

create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references photo_sessions (id) on delete cascade,
  starts_at timestamp not null,          -- local wall-clock time at the venue
  duration_minutes int not null default 15,
  available boolean not null default true
);
create index if not exists time_slots_session_idx on time_slots (session_id, starts_at);

create type portfolio_category as enum ('single', 'composite', 'siblings');

create table if not exists portfolio_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,            -- path inside the public "portfolio" bucket
  caption text,
  category portfolio_category not null default 'single',
  sort_order int not null default 0,
  published boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Requests from the public
-- ---------------------------------------------------------------------------
create type booking_status as enum ('requested', 'confirmed', 'cancelled');

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references photo_sessions (id) on delete cascade,
  time_slot_id uuid references time_slots (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  parent_name text not null,
  email text not null,
  phone text not null,
  children jsonb not null default '[]'::jsonb,   -- [{ "name": "...", "age": "..." }]
  notes text,
  status booking_status not null default 'requested',
  created_at timestamptz not null default now()
);
create index if not exists bookings_email_idx on bookings (lower(email));

create type season_preference as enum ('spring', 'fall', 'either');

create table if not exists hostess_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  city text not null,
  state char(2) not null,
  preferred_season season_preference not null default 'either',
  venue_idea text,
  estimated_families text,
  message text,
  created_at timestamptz not null default now()
);

-- Inserts a booking and marks the slot taken in one transaction so two
-- families cannot grab the same time. Called by the app as the anon or
-- signed-in user.
create or replace function request_booking(
  p_session_id uuid,
  p_time_slot_id uuid,
  p_parent_name text,
  p_email text,
  p_phone text,
  p_children jsonb,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_time_slot_id is not null then
    update time_slots
      set available = false
      where id = p_time_slot_id and session_id = p_session_id and available = true;
    if not found then
      raise exception 'That time was just taken. Please choose another.';
    end if;
  end if;

  insert into bookings (session_id, time_slot_id, user_id, parent_name, email, phone, children, notes)
  values (p_session_id, p_time_slot_id, auth.uid(), p_parent_name, lower(p_email), p_phone, coalesce(p_children, '[]'::jsonb), p_notes)
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Client proofs
-- ---------------------------------------------------------------------------
create table if not exists galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  session_date date not null,
  client_email text not null,            -- the email the family signs in with
  cover_path text,                       -- path inside the private "proofs" bucket
  price_sheet_path text,                 -- optional PDF in the "proofs" bucket
  order_by date,
  created_at timestamptz not null default now()
);
create index if not exists galleries_client_email_idx on galleries (lower(client_email));

create table if not exists proofs (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references galleries (id) on delete cascade,
  label text not null,                   -- e.g. DBP-0142
  thumbnail_path text not null,
  full_path text not null,
  width int,
  height int,
  sort_order int not null default 0
);
create index if not exists proofs_gallery_idx on proofs (gallery_id, sort_order);

create table if not exists favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  proof_id uuid not null references proofs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, proof_id)
);

create table if not exists proof_orders (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references galleries (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  -- Each item is either a single print or a composite:
  --   { "kind": "print", "proofId", "label", "size", "quantity" }   (one row per proof per size)
  --   { "kind": "composite", "id", "templateId", "templateName", "size", "quantity",
  --     "slots": [{ "slotId", "proofId", "label" }] }
  items jsonb not null,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- A client "owns" a gallery when their sign-in email matches client_email.
create or replace function owns_gallery(p_gallery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from galleries g
    where g.id = p_gallery_id
      and lower(g.client_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table staff enable row level security;
alter table photo_sessions enable row level security;
alter table session_hostesses enable row level security;
alter table time_slots enable row level security;
alter table portfolio_images enable row level security;
alter table bookings enable row level security;
alter table hostess_applications enable row level security;
alter table galleries enable row level security;
alter table proofs enable row level security;
alter table favorites enable row level security;
alter table proof_orders enable row level security;

create policy "staff read own row" on staff for select using (user_id = auth.uid());

create policy "sessions are public" on photo_sessions for select using (published or is_staff());
create policy "staff manage sessions" on photo_sessions for all using (is_staff()) with check (is_staff());

create policy "hostesses are public" on session_hostesses for select using (true);
create policy "staff manage hostesses" on session_hostesses for all using (is_staff()) with check (is_staff());

create policy "slots are public" on time_slots for select using (true);
create policy "staff manage slots" on time_slots for all using (is_staff()) with check (is_staff());

create policy "portfolio is public" on portfolio_images for select using (published or is_staff());
create policy "staff manage portfolio" on portfolio_images for all using (is_staff()) with check (is_staff());

create policy "clients read own bookings" on bookings for select
  using (is_staff() or user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "staff manage bookings" on bookings for all using (is_staff()) with check (is_staff());

create policy "anyone can apply to host" on hostess_applications for insert with check (true);
create policy "staff read applications" on hostess_applications for select using (is_staff());
create policy "staff manage applications" on hostess_applications for all using (is_staff()) with check (is_staff());

create policy "clients read own galleries" on galleries for select
  using (is_staff() or lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "staff manage galleries" on galleries for all using (is_staff()) with check (is_staff());

create policy "clients read own proofs" on proofs for select using (is_staff() or owns_gallery(gallery_id));
create policy "staff manage proofs" on proofs for all using (is_staff()) with check (is_staff());

create policy "clients manage own favorites" on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "clients place orders for own galleries" on proof_orders for insert
  with check (owns_gallery(gallery_id));
create policy "clients read own orders" on proof_orders for select using (is_staff() or user_id = auth.uid());
create policy "staff manage orders" on proof_orders for all using (is_staff()) with check (is_staff());

-- Stamp the signed-in user on orders automatically.
create or replace function set_order_user()
returns trigger language plpgsql as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;
drop trigger if exists proof_orders_set_user on proof_orders;
create trigger proof_orders_set_user before insert on proof_orders
  for each row execute function set_order_user();

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
-- "portfolio" is public (sample work shown to everyone).
-- "proofs" is private; the app requests short-lived signed URLs and these
-- policies only allow a client to read files inside their own gallery folder
-- (files are stored as proofs/<gallery_id>/<file>).
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('proofs', 'proofs', false)
  on conflict (id) do nothing;

create policy "portfolio is readable" on storage.objects for select
  using (bucket_id = 'portfolio');
create policy "staff manage portfolio files" on storage.objects for all
  using (bucket_id = 'portfolio' and is_staff()) with check (bucket_id = 'portfolio' and is_staff());

create policy "clients read own proof files" on storage.objects for select
  using (
    bucket_id = 'proofs'
    and (is_staff() or owns_gallery(((storage.foldername(name))[1])::uuid))
  );
create policy "staff manage proof files" on storage.objects for all
  using (bucket_id = 'proofs' and is_staff()) with check (bucket_id = 'proofs' and is_staff());
