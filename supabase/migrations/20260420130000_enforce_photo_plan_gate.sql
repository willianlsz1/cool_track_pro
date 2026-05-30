-- ============================================================
-- DB-level enforcement: fotos de equipamento com gate operacional historico
-- Date: 2026-04-20
--
-- Contexto:
--   O gate antigo de "fotos de equipamento" era 100% client-side: UI escondia o
--   wrapper via display:none. Usuario com dev tools
--   consegue bypass trivial. As RLS de `equipamentos` só validam ownership
--   (auth.uid() = user_id), permitindo UPDATE na coluna `fotos` em qualquer
--   plano.
--
-- Fix: trigger BEFORE INSERT/UPDATE em public.equipamentos que valida o
-- codigo operacional quando a coluna `fotos` muda. Usuarios fora do codigo
-- esperado que tentem gravar `fotos` nao-vazio levam 42501.
--
-- Escopo:
--   - INSERT com fotos nao-vazio: exige codigo operacional elevado.
--   - UPDATE que mude `fotos`: exige codigo operacional elevado.
--   - Fotos iguais ao old (noop): passa sem quebrar edits nao relacionados.
--   - service_role: bypassa para backfills e admin.
--   - is_dev=true: bypassa, coerente com getEffectivePlan client-side.
--
-- Idempotente: CREATE OR REPLACE + DROP trigger antes de CREATE.
-- ============================================================

-- Helper: retorna true se o user_id tem codigo operacional elevado ativo.
-- Usa SECURITY DEFINER pra ler profiles sem precisar passar pelas RLS
-- daquela tabela (o trigger chama em nome do próprio user).
create or replace function public.user_has_plus_plan(p_user_id uuid)
returns boolean
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
    return false;
  end if;

  select plan_code, subscription_status, coalesce(is_dev, false)
    into v_plan_code, v_status, v_is_dev
  from public.profiles
  where id = p_user_id;

  -- Dev bypass: casa com getEffectivePlan() client-side.
  if v_is_dev then
    return true;
  end if;

  -- Codigos elevados com status ativo/trialing.
  if v_plan_code in ('plus', 'pro')
     and v_status in ('active', 'trialing') then
    return true;
  end if;

  return false;
end;
$$;

comment on function public.user_has_plus_plan(uuid) is
  'True se o usuario tem codigo operacional elevado ativo (ou e dev). Usado por triggers de gates historicos.';

-- ── Trigger em public.equipamentos ──────────────────────────────────────
create or replace function public.enforce_photo_plan_gate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_old_fotos jsonb;
  v_new_fotos jsonb;
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

  v_new_fotos := coalesce(new.fotos, '[]'::jsonb);
  v_old_fotos := case when tg_op = 'UPDATE' then coalesce(old.fotos, '[]'::jsonb) else '[]'::jsonb end;

  -- Se nao houve mudanca em `fotos`, passa sem checar codigo operacional.
  -- Importante em UPDATEs que so mexem em outras colunas.
  if v_new_fotos = v_old_fotos then
    return new;
  end if;

  -- Se a nova lista e vazia, sempre permite (usuario limpando fotos antigas).
  if jsonb_array_length(v_new_fotos) = 0 then
    return new;
  end if;

  -- Mudanca que adiciona/altera fotos: requer codigo operacional elevado.
  if not public.user_has_plus_plan(auth.uid()) then
    raise exception 'equipamento photos require Plus plan' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_photo_plan_gate() is
  'Bloqueia INSERT/UPDATE de equipamentos.fotos nao-vazio para usuarios fora do codigo operacional elevado.';

-- Só cria o trigger se a tabela existe (evita quebrar shadow DB do CI).
do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'equipamentos'
  ) then
    raise notice 'Tabela public.equipamentos não existe — pulando trigger (esperado em shadow DB).';
    return;
  end if;

  drop trigger if exists enforce_photo_plan_gate_trigger on public.equipamentos;

  create trigger enforce_photo_plan_gate_trigger
    before insert or update on public.equipamentos
    for each row execute function public.enforce_photo_plan_gate();
end $$;

-- ── Storage: policy no bucket que hospeda as fotos ──────────────────────
-- Path esperado: {user_id}/equipamentos/{equipId}/{uuid}.jpg
-- (o bucket e compartilhado com registros de servico, cujo path e
--  {user_id}/registros/{registroId}/{uuid}.jpg, sem gate operacional).
--
-- A policy INSERT ja existente (se houver) valida owner; essa adicional
-- exige codigo operacional elevado quando o path comeca com 'equipamentos/'.
--
-- Nota: se o bucket foi criado via Dashboard sem policies SQL, esse bloco
-- apenas adiciona a policy nova; nao derruba as existentes.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'equipamento_fotos_require_plus_insert'
  ) then
    create policy equipamento_fotos_require_plus_insert
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'registro-fotos'
        and (storage.foldername(name))[2] = 'equipamentos'
        and public.user_has_plus_plan(auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'equipamento_fotos_require_plus_update'
  ) then
    create policy equipamento_fotos_require_plus_update
      on storage.objects for update
      to authenticated
      using (
        bucket_id = 'registro-fotos'
        and (storage.foldername(name))[2] = 'equipamentos'
      )
      with check (
        bucket_id = 'registro-fotos'
        and (storage.foldername(name))[2] = 'equipamentos'
        and public.user_has_plus_plan(auth.uid())
      );
  end if;
end $$;
