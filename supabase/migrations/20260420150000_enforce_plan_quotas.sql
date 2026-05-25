-- ============================================================
-- DB-level enforcement: limites de equipamentos e registros mensais
-- Date: 2026-04-20
--
-- Contexto:
--   Depois de fechar o gate de fotos (migration 20260420130000) e setores
--   (20260420140000), os ultimos buracos de bypass via SDK direto eram:
--     1. Criacao de equipamentos acima do limite operacional.
--     2. Criacao de registros acima do limite mensal operacional.
--
--   Ambos eram bloqueados so client-side (canCreateEquipment no
--   equipamentos.js, checkLimits no registro.js). Usuario com dev tools
--   consegue:
--     supabase.from('equipamentos').insert({ ...payload })  -- N vezes
--     supabase.from('registros').insert({ ...payload })     -- N vezes
--
--   Esta migration fecha os dois buracos com triggers BEFORE INSERT.
--
-- Manutencao:
--   Os limites estao hardcoded em SQL (get_plan_equipamentos_limit + 5 no
--   trigger de registros). IMPORTANTE: se mudar o catalogo operacional,
--   atualizar tambem essa funcao. Grep por
--   "PLAN_CATALOG LIMITS MIRROR" pra achar os dois pontos.
--
-- Escopo:
--   - INSERT equipamentos: conta rows do user e compara com limite operacional.
--   - INSERT registros: conta rows criados no mes e compara com limite.
--   - service_role: bypassa.
--   - is_dev=true: bypassa, coerente com getEffectivePlan client-side.
--
-- Idempotente: CREATE OR REPLACE + DROP trigger antes de CREATE.
-- Defensive: migration adiciona coluna created_at em registros se não
-- existir (necessaria pro filtro mensal).
-- ============================================================

-- Helper: limite de equipamentos pro usuario.
-- PLAN_CATALOG LIMITS MIRROR - contrato operacional historico.
create or replace function public.get_plan_equipamentos_limit(p_user_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_plan_code text;
  v_status text;
  v_is_dev boolean;
begin
  if p_user_id is null then
    return 0;
  end if;

  select plan_code, subscription_status, coalesce(is_dev, false)
    into v_plan_code, v_status, v_is_dev
  from public.profiles
  where id = p_user_id;

  -- Dev bypass: sem limite.
  if v_is_dev then
    return 2147483647;
  end if;

  -- Status precisa estar ativo para valer codigo elevado. Caso contrario
  -- trata como codigo base, consistente com getEffectivePlan client-side.
  if v_status is null or v_status not in ('active', 'trialing') then
    return 3; -- Codigo base
  end if;

  if v_plan_code = 'pro' then
    return 2147483647;
  end if;

  if v_plan_code = 'plus' then
    return 15;
  end if;

  return 3; -- Fallback base
end;
$$;

comment on function public.get_plan_equipamentos_limit(uuid) is
  'Retorna o limite operacional de equipamentos do usuario. Espelha o catalogo operacional historico.';

-- Trigger: equipamentos INSERT count.
create or replace function public.enforce_equipamentos_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_count integer;
  v_limit integer;
begin
  -- service_role/admin bypassa.
  begin
    v_role := coalesce(auth.role(), '');
  exception when others then
    v_role := '';
  end;

  if v_role = 'service_role' then
    return new;
  end if;

  v_limit := public.get_plan_equipamentos_limit(new.user_id);

  -- Count rows atuais do usuario (excluindo o que esta sendo inserido).
  select count(*) into v_count
  from public.equipamentos
  where user_id = new.user_id;

  if v_count >= v_limit then
    raise exception 'equipamentos limit reached for your plan (used=%, limit=%)',
      v_count, v_limit
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_equipamentos_limit() is
  'Bloqueia INSERT em equipamentos quando o user ja atingiu o limite operacional.';

-- Trigger: registros monthly limit.
-- Conta registros criados no mes corrente (timezone UTC) e bloqueia se
-- atingiu o limite operacional. Codigos elevados/dev passam direto.
create or replace function public.enforce_registros_monthly_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_plan_code text;
  v_status text;
  v_is_dev boolean;
  v_count integer;
  v_limit constant integer := 5; -- Limite base (PLAN_CATALOG LIMITS MIRROR)
begin
  -- service_role bypassa.
  begin
    v_role := coalesce(auth.role(), '');
  exception when others then
    v_role := '';
  end;

  if v_role = 'service_role' then
    return new;
  end if;

  -- Le codigo operacional do user.
  select plan_code, subscription_status, coalesce(is_dev, false)
    into v_plan_code, v_status, v_is_dev
  from public.profiles
  where id = new.user_id;

  -- Dev / codigos elevados: unlimited.
  if v_is_dev then
    return new;
  end if;

  if v_plan_code in ('plus', 'pro')
     and v_status in ('active', 'trialing') then
    return new;
  end if;

  -- Codigo base: count rows criados nesse mes (UTC).
  select count(*) into v_count
  from public.registros
  where user_id = new.user_id
    and created_at >= date_trunc('month', timezone('utc', now()));

  if v_count >= v_limit then
    raise exception 'monthly registros limit reached for Free plan (used=%, limit=%)',
      v_count, v_limit
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_registros_monthly_limit() is
  'Bloqueia INSERT em registros quando o codigo base atingiu o limite mensal. Codigos elevados/dev passam.';

-- Attach triggers (se tabelas existem).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'equipamentos'
  ) then
    drop trigger if exists enforce_equipamentos_limit_trigger on public.equipamentos;
    create trigger enforce_equipamentos_limit_trigger
      before insert on public.equipamentos
      for each row execute function public.enforce_equipamentos_limit();
  else
    raise notice 'Tabela public.equipamentos não existe — pulando trigger (esperado em shadow DB).';
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'registros'
  ) then
    -- Defensivo: garante que a coluna created_at existe no registros.
    -- Se a tabela foi criada out-of-band sem created_at, o filtro do trigger
    -- quebraria. ALTER ... ADD COLUMN IF NOT EXISTS e idempotente.
    alter table public.registros
      add column if not exists created_at timestamptz not null default timezone('utc', now());

    drop trigger if exists enforce_registros_monthly_limit_trigger on public.registros;
    create trigger enforce_registros_monthly_limit_trigger
      before insert on public.registros
      for each row execute function public.enforce_registros_monthly_limit();
  else
    raise notice 'Tabela public.registros não existe — pulando trigger (esperado em shadow DB).';
  end if;
end $$;
