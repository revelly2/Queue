-- =============================================================================
-- QueUA — Migration 0009: admin user/role management (RBAC UI backend)
-- auth.users is not exposed via the API, so an admin-only SECURITY DEFINER
-- function joins it with profiles to list staff with their emails + roles.
-- =============================================================================

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role public.app_role,
  created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Admin role required' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, p.full_name, p.role, p.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    order by u.email;
end;
$$;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role public.app_role)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare v_p public.profiles%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin role required' using errcode = '42501';
  end if;
  update public.profiles set role = p_role where id = p_user_id returning * into v_p;
  if not found then
    raise exception 'User % not found', p_user_id using errcode = 'P0002';
  end if;
  return jsonb_build_object('id', v_p.id, 'role', v_p.role);
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
revoke all on function public.admin_set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.app_role) to authenticated;
