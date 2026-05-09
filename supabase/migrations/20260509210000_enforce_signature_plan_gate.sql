-- ============================================================
-- Mudanca 17 / CP-E
-- Server-side gate para assinatura digital de registros
--
-- Risco tratado:
--   A UI ja trata assinatura digital como Plus+, mas um usuario Free podia
--   tentar persistir `registros.assinatura` ou fazer upload direto para
--   `registro-fotos/{user_id}/registros/{registro_id}/assinatura.png`.
--
-- Estrategia:
--   1. Trigger em public.registros bloqueia INSERT/UPDATE de assinatura para
--      usuarios sem Plus+.
--   2. Policies RESTRICTIVE em storage.objects exigem Plus+ somente para o
--      path exato de assinatura. Paths normais de fotos de registros seguem
--      pelas policies permissivas existentes.
-- ============================================================

create or replace function public.registro_signature_payload_requires_plan(p_signature jsonb)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  v_kind text;
  v_string text;
begin
  if p_signature is null or p_signature = 'null'::jsonb or p_signature = 'false'::jsonb then
    return false;
  end if;

  v_kind := jsonb_typeof(p_signature);

  if v_kind = 'boolean' then
    return p_signature = 'true'::jsonb;
  end if;

  if v_kind = 'object' then
    return p_signature <> '{}'::jsonb;
  end if;

  if v_kind = 'array' then
    return jsonb_array_length(p_signature) > 0;
  end if;

  if v_kind = 'string' then
    v_string := trim(both '"' from p_signature::text);
    return length(trim(v_string)) > 0 and lower(trim(v_string)) not in ('false', 'null');
  end if;

  return true;
end;
$$;

comment on function public.registro_signature_payload_requires_plan(jsonb) is
  'Retorna true quando o payload de public.registros.assinatura representa assinatura persistida e deve exigir Plus+.';

create or replace function public.enforce_registro_signature_plan_gate()
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

  if tg_op = 'UPDATE'
     and to_jsonb(new.assinatura) is not distinct from to_jsonb(old.assinatura) then
    return new;
  end if;

  if not public.registro_signature_payload_requires_plan(to_jsonb(new.assinatura)) then
    return new;
  end if;

  if not public.user_has_plus_plan(auth.uid()) then
    raise exception 'registro signature requires Plus plan' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_registro_signature_plan_gate() is
  'Bloqueia INSERT/UPDATE de public.registros.assinatura para usuarios fora do plano Plus/Pro. service_role bypassa.';

do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'registros'
  ) then
    raise notice 'Tabela public.registros nao existe - pulando trigger de assinatura (esperado em shadow DB).';
    return;
  end if;

  drop trigger if exists enforce_registro_signature_plan_gate_trigger on public.registros;

  create trigger enforce_registro_signature_plan_gate_trigger
    before insert or update on public.registros
    for each row execute function public.enforce_registro_signature_plan_gate();
end $$;

create or replace function public.is_registro_signature_storage_object(
  p_bucket_id text,
  p_name text
)
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(p_bucket_id, '') = 'registro-fotos'
    and coalesce(p_name, '') ~ '^[^/]+/registros/[^/]+/assinatura[.]png$';
$$;

comment on function public.is_registro_signature_storage_object(text, text) is
  'Identifica o path padrao de assinatura digital: registro-fotos/{user_id}/registros/{registro_id}/assinatura.png.';

create or replace function public.can_write_registro_signature_storage_object(
  p_bucket_id text,
  p_name text,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.is_registro_signature_storage_object(p_bucket_id, p_name)
    or (
      p_user_id is not null
      and split_part(coalesce(p_name, ''), '/', 1) = p_user_id::text
      and public.user_has_plus_plan(p_user_id)
    );
$$;

comment on function public.can_write_registro_signature_storage_object(text, text, uuid) is
  'Predicado usado por policies RESTRICTIVE de storage.objects: fotos normais passam; assinatura exige dono do path e Plus+.';

do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'Tabela storage.objects nao existe - pulando policies de Storage (esperado fora do Supabase).';
    return;
  end if;

  execute 'drop policy if exists registro_signature_require_plus_insert on storage.objects';
  execute 'create policy registro_signature_require_plus_insert
    on storage.objects
    as restrictive
    for insert
    to authenticated
    with check (
      public.can_write_registro_signature_storage_object(bucket_id, name, auth.uid())
    )';

  execute 'drop policy if exists registro_signature_require_plus_update on storage.objects';
  execute 'create policy registro_signature_require_plus_update
    on storage.objects
    as restrictive
    for update
    to authenticated
    using (
      public.can_write_registro_signature_storage_object(bucket_id, name, auth.uid())
    )
    with check (
      public.can_write_registro_signature_storage_object(bucket_id, name, auth.uid())
    )';
end $$;
