create table if not exists public.users (
  id uuid not null default gen_random_uuid(),
  phone text not null,
  password_hash text not null,
  created_at timestamp with time zone not null default now(),
  constraint users_pkey primary key (id),
  constraint users_phone_key unique (phone)
);
