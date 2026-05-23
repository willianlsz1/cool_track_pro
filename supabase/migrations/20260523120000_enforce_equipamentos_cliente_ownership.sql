-- ============================================================
-- App-v2 CP-J: enforce equipamentos.cliente_id ownership
--
-- Garante que public.equipamentos.cliente_id, quando informado, aponte para
-- public.clientes.id do mesmo user_id do equipamento. A FK existente confirma
-- existencia do cliente, mas nao garante tenant ownership.
--
-- Idempotente: CREATE OR REPLACE + DROP/CREATE trigger; guarda shadow DBs onde
-- as tabelas/colunas ainda nao existam.
-- ============================================================

create or replace function public.enforce_equipamentos_cliente_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.cliente_id is null then
    return new;
  end if;

  if not exists (
    select 1
      from public.clientes
     where id = new.cliente_id
       and user_id = new.user_id
  ) then
    raise exception 'equipamento cliente_id must belong to the same user_id'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.enforce_equipamentos_cliente_ownership() is
  'Bloqueia INSERT/UPDATE de equipamentos com cliente_id de outro tenant.';

do $$
begin
  if not exists (
    select 1
      from information_schema.tables
     where table_schema = 'public'
       and table_name = 'equipamentos'
  ) then
    raise notice 'Tabela public.equipamentos nao existe - pulando trigger de ownership.';
    return;
  end if;

  if not exists (
    select 1
      from information_schema.tables
     where table_schema = 'public'
       and table_name = 'clientes'
  ) then
    raise notice 'Tabela public.clientes nao existe - pulando trigger de ownership.';
    return;
  end if;

  if not exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'equipamentos'
       and column_name in ('cliente_id', 'user_id')
     group by table_schema, table_name
    having count(*) = 2
  ) then
    raise notice 'Colunas public.equipamentos.(cliente_id,user_id) ausentes - pulando trigger de ownership.';
    return;
  end if;

  if not exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'clientes'
       and column_name in ('id', 'user_id')
     group by table_schema, table_name
    having count(*) = 2
  ) then
    raise notice 'Colunas public.clientes.(id,user_id) ausentes - pulando trigger de ownership.';
    return;
  end if;

  drop trigger if exists enforce_equipamentos_cliente_ownership_trigger on public.equipamentos;

  create trigger enforce_equipamentos_cliente_ownership_trigger
    before insert or update of cliente_id, user_id on public.equipamentos
    for each row execute function public.enforce_equipamentos_cliente_ownership();
end $$;
