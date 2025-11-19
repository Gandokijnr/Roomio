alter table public.profiles enable row level security;

-- Drop old/legacy profile policies if they exist
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- 1) Every authenticated user can always see and update their own profile
create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2) Tenant admins/managers can manage all profiles within their tenant
create policy "profiles_tenant_admin_manage_tenant" on public.profiles
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p_admin
      where p_admin.id = auth.uid()
        and p_admin.tenant_id = tenant_id
        and p_admin.role in ('admin', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p_admin
      where p_admin.id = auth.uid()
        and p_admin.tenant_id = tenant_id
        and p_admin.role in ('admin', 'manager')
    )
  );

-- 3) Super admins can see and manage all profiles across tenants
create policy "profiles_super_admin_all" on public.profiles
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_super_admin = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_super_admin = true
    )
  );
