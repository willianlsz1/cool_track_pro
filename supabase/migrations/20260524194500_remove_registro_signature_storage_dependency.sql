-- ============================================================
-- CP56C2 - Remove dependencia obsoleta de assinatura no bucket registro-fotos
--
-- CP56C removeu as funcoes especificas de assinatura de Registro. Esta
-- migration atualiza o predicado canonico de storage para que fotos de
-- registros continuem dependendo apenas de ownership do path, sem chamar o gate
-- de assinatura aposentado.
-- ============================================================

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
    when (storage.foldername(coalesce(p_name, '')))[2] = 'registros' then true
    when (storage.foldername(coalesce(p_name, '')))[2] = 'equipamentos' then
      public.user_has_plus_plan(p_user_id)
    else false
  end;
$$;

comment on function public.can_write_registro_fotos_storage_object(text, text, uuid) is
  'Predicado canonico para writes no bucket registro-fotos: exige owner no primeiro segmento, permite fotos de registros do dono e exige Plus+ em equipamentos.';
