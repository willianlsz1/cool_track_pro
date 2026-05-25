-- ============================================================
-- Mudanca 17 / CP-B - hardening de profile e contadores
-- Date: 2026-05-09
--
-- Escopo:
--   1. Completa a protecao de public.profiles no INSERT, bloqueando
--      metadados de provedor comercial semeados pelo cliente.
--   2. Remove policies de escrita direta em public.usage_monthly.
--
-- Decisao:
--   - profiles continua legivel pelo proprio usuario e editavel para campos
--     comuns via policies existentes + triggers de protecao.
--   - campos operacionais sensiveis continuam atualizaveis pelo service_role.
--   - usage_monthly continua legivel pelo proprio usuario.
--   - contadores devem ser alterados via public.increment_monthly_usage()
--     (SECURITY DEFINER) ou service_role, nao por insert/update direto.
--
-- Fora de escopo:
--   - Recriacao futura de features pagas.
--   - CP-D env Supabase frontend.
--   - PDF/share, Storage, React Doctor, Vite warnings.
-- ============================================================

create or replace function public.protect_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  begin
    v_role := coalesce(auth.role(), '');
  exception when others then
    v_role := '';
  end;

  if v_role = 'service_role' then
    return new;
  end if;

  -- Usuarios autenticados so conseguem inserir profile como free/inactive
  -- e sem metadados comerciais. O profile normal tambem e criado pelo
  -- handle_new_user() com esses defaults.
  if coalesce(new.plan_code, 'free') <> 'free' then
    raise exception 'cannot create profile with non-free plan_code' using errcode = '42501';
  end if;

  if coalesce(new.plan, 'free') <> 'free' then
    raise exception 'cannot create profile with non-free plan' using errcode = '42501';
  end if;

  if coalesce(new.subscription_status, 'inactive') <> 'inactive' then
    raise exception 'cannot create profile with active subscription' using errcode = '42501';
  end if;

  if coalesce(new.is_dev, false) = true then
    raise exception 'cannot create profile with is_dev=true' using errcode = '42501';
  end if;

  if new.stripe_customer_id is not null then
    raise exception 'cannot create profile with stripe_customer_id' using errcode = '42501';
  end if;

  if new.stripe_subscription_id is not null then
    raise exception 'cannot create profile with stripe_subscription_id' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_insert_trigger on public.profiles;

create trigger protect_profile_insert_trigger
  before insert on public.profiles
  for each row execute function public.protect_profile_insert();

comment on function public.protect_profile_insert() is
  'Bloqueia INSERT client-side em public.profiles com plano nao operacional, dev flag ou metadados comerciais. service_role bypassa.';

-- usage_monthly: leitura propria permanece; escrita direta pelo usuario sai.
-- O caminho permitido para usuario autenticado e a RPC SECURITY DEFINER
-- public.increment_monthly_usage(), que valida auth.uid() = p_user_id.
alter table public.usage_monthly enable row level security;

drop policy if exists usage_monthly_insert_own on public.usage_monthly;
drop policy if exists usage_monthly_update_own on public.usage_monthly;
drop policy if exists usage_monthly_delete_own on public.usage_monthly;

-- Defensivo para ambientes que tenham policies criadas fora das migrations
-- versionadas ou com nomes diferentes. Mantem apenas SELECT; remove qualquer
-- permissao RLS de INSERT/UPDATE/DELETE/ALL em usage_monthly.
do $$
declare
  v_policy record;
begin
  for v_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'usage_monthly'
      and cmd <> 'SELECT'
  loop
    execute format('drop policy if exists %I on public.usage_monthly', v_policy.policyname);
  end loop;
end $$;

revoke insert, update, delete on table public.usage_monthly from anon;
revoke insert, update, delete on table public.usage_monthly from authenticated;
grant select on table public.usage_monthly to authenticated;
grant select, insert, update, delete on table public.usage_monthly to service_role;
grant execute on function public.increment_monthly_usage(uuid, text, date, integer) to authenticated;
grant execute on function public.increment_monthly_usage(uuid, text, date, integer) to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'usage_monthly'
      and policyname = 'usage_monthly_select_own'
  ) then
    create policy usage_monthly_select_own
      on public.usage_monthly
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

comment on table public.usage_monthly is
  'Contadores mensais de uso. Usuarios autenticados podem ler seus contadores; escrita direta e bloqueada por RLS e deve passar por increment_monthly_usage() ou service_role.';
