-- ============================================================
-- Mudanca 17 / CP-G: superficies publicas anti-abuso
-- Date: 2026-05-09
--
-- Escopo:
--   - analytics_events e feedback continuam aceitando INSERT publico legitimo,
--     mas nao aceitam user_id forjado por anon/authenticated.
--   - analytics_events passa a exigir payload jsonb do tipo object.
--   - registro-fotos passa a ter bucket privado com limite versionado e
--     policies canonicas de ownership para Storage.
--
-- Limite conhecido:
--   - RLS/constraints nao implementam rate limit real por IP/sessao. Esse
--     controle deve ficar em edge/WAF se o volume publico virar problema.
-- ============================================================

create or replace function public.public_insert_user_id_is_self_or_null(p_user_id uuid)
returns boolean
language plpgsql
stable
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
    return true;
  end if;

  if p_user_id is null then
    return true;
  end if;

  return auth.uid() = p_user_id;
end;
$$;

comment on function public.public_insert_user_id_is_self_or_null(uuid) is
  'Usado por policies publicas de INSERT: anon nao pode forjar user_id e authenticated so pode usar o proprio user_id.';

do $$
begin
  if to_regclass('public.analytics_events') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'analytics_events_payload_object_check'
        and conrelid = 'public.analytics_events'::regclass
    ) then
      alter table public.analytics_events
        add constraint analytics_events_payload_object_check
        check (jsonb_typeof(payload) = 'object') not valid;
    end if;

    drop policy if exists analytics_events_insert_any on public.analytics_events;

    create policy analytics_events_insert_any
      on public.analytics_events
      for insert
      to anon, authenticated
      with check (
        public.public_insert_user_id_is_self_or_null(user_id)
        and jsonb_typeof(payload) = 'object'
      );

    grant insert on table public.analytics_events to anon, authenticated;
    revoke select, update, delete on table public.analytics_events from anon, authenticated;
  end if;
end $$;

do $$
begin
  if to_regclass('public.feedback') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'feedback_user_email_format_check'
        and conrelid = 'public.feedback'::regclass
    ) then
      alter table public.feedback
        add constraint feedback_user_email_format_check
        check (
          user_email is null
          or (
            length(user_email) <= 320
            and user_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
          )
        ) not valid;
    end if;

    drop policy if exists feedback_insert_any on public.feedback;

    create policy feedback_insert_any
      on public.feedback
      for insert
      to anon, authenticated
      with check (public.public_insert_user_id_is_self_or_null(user_id));

    grant insert on table public.feedback to anon, authenticated;
    grant select on table public.feedback to authenticated;
    revoke select on table public.feedback from anon;
    revoke update, delete on table public.feedback from anon, authenticated;
  end if;
end $$;

create or replace function public.can_write_registro_fotos_storage_object(
  p_bucket_id text,
  p_name text,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select case
    when coalesce(p_bucket_id, '') <> 'registro-fotos' then false
    when p_user_id is null then false
    when (storage.foldername(coalesce(p_name, '')))[1] <> p_user_id::text then false
    when (storage.foldername(coalesce(p_name, '')))[2] = 'registros' then
      public.can_write_registro_signature_storage_object(p_bucket_id, p_name, p_user_id)
    when (storage.foldername(coalesce(p_name, '')))[2] = 'equipamentos' then
      public.user_has_plus_plan(p_user_id)
    else false
  end;
$$;

comment on function public.can_write_registro_fotos_storage_object(text, text, uuid) is
  'Predicado canonico para writes no bucket registro-fotos: exige owner no primeiro segmento, permite fotos de registros do dono, exige Plus+ em equipamentos e preserva gate de assinatura.';

do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Tabela storage.buckets nao existe - pulando bucket registro-fotos.';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit)
  values ('registro-fotos', 'registro-fotos', false, 10485760)
  on conflict (id) do update
    set public = false,
        file_size_limit = case
          when storage.buckets.file_size_limit is null then 10485760
          when storage.buckets.file_size_limit > 10485760 then 10485760
          else storage.buckets.file_size_limit
        end;
end $$;

do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'Tabela storage.objects nao existe - pulando policies de registro-fotos.';
    return;
  end if;

  drop policy if exists registro_fotos_select_own on storage.objects;
  create policy registro_fotos_select_own
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'registro-fotos'
      and (storage.foldername(name))[1] = auth.uid()::text
    );

  drop policy if exists registro_fotos_insert_own on storage.objects;
  create policy registro_fotos_insert_own
    on storage.objects
    for insert
    to authenticated
    with check (
      public.can_write_registro_fotos_storage_object(bucket_id, name, auth.uid())
    );

  drop policy if exists registro_fotos_update_own on storage.objects;
  create policy registro_fotos_update_own
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'registro-fotos'
      and (storage.foldername(name))[1] = auth.uid()::text
    )
    with check (
      public.can_write_registro_fotos_storage_object(bucket_id, name, auth.uid())
    );

  drop policy if exists registro_fotos_delete_own on storage.objects;
  create policy registro_fotos_delete_own
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'registro-fotos'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
end $$;
