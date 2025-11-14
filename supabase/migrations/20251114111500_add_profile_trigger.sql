-- Create a trigger to create a profile automatically when a user is created in auth.users
-- This prevents FK violations on profiles.id REFERENCES auth.users(id)

-- Ensure the schema and extensions are present (idempotent)
create extension if not exists pgcrypto;

-- Create the function in the public schema and run as SECURITY DEFINER so it bypasses RLS
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert a matching profile row using metadata from auth
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'receptionist'),
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger on auth.users AFTER INSERT
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

-- Policies for profiles to allow users to read/update their own profile
alter table public.profiles enable row level security;

-- Allow authenticated users to select their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Allow authenticated users to update limited fields on their own profile (optional)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
