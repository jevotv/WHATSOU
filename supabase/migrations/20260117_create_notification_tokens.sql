create table if not exists public.notification_tokens (
  id uuid not null default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  token text not null,
  platform text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint notification_tokens_pkey primary key (id),
  constraint notification_tokens_token_key unique (token)
);

-- Add indexes
create index if not exists notification_tokens_user_id_idx on public.notification_tokens(user_id);

-- Enable RLS
alter table public.notification_tokens enable row level security;

-- Policies (Adjust based on your auth implementation)
create policy "Users can view their own tokens"
on public.notification_tokens for select
using ( user_id = auth.uid() );  -- Assuming you map your custom user ID to auth.uid() or similar context

create policy "Users can insert their own tokens"
on public.notification_tokens for insert
with check ( true ); -- Controlled by API endpoint logic usually

create policy "Users can delete their own tokens"
on public.notification_tokens for delete
using ( user_id = auth.uid() );
