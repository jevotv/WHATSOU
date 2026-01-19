-- Enable the pg_net extension to make HTTP requests
create extension if not exists pg_net;

-- 1. Create the function that constructs the payload and sends the request
create or replace function public.handle_new_order_notification()
returns trigger as $$
declare
  payload jsonb;
  request_id bigint;
begin
  -- Construct the payload
  payload := jsonb_build_object('record', row_to_json(NEW));

  -- Send the HTTP POST request using pg_net
  -- UPDATED WITH CORRECT PROJECT ID: bwezqrjwdrobztgeutji
  select net.http_post(
    url := 'https://bwezqrjwdrobztgeutji.supabase.functions.supabase.co/functions/v1/push-notification', -- Using new Supabase Edge Function URL format
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  ) into request_id;

  return new;
exception
  when others then
    return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger to call the function
drop trigger if exists send_order_notification on public.orders;

create trigger send_order_notification
after insert
on public.orders
for each row
execute function public.handle_new_order_notification();
