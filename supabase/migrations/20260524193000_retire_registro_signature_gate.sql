-- ============================================================
-- CP56C - Aposenta assinatura digital legada de Registro
--
-- Contexto:
--   O app-v2 nao reutiliza assinatura digital de Registro do v1. A UI,
--   storage dedicado, router, Historico, payload local e storage/sync ja foram
--   removidos em CPs anteriores. Esta migration remove os vestigios server-side
--   especificos de public.registros.assinatura.
--
-- Fora do escopo:
--   - assinatura de orcamento;
--   - billing/features;
--   - PDF/share, WhatsApp, fotos, PMOC e storage real app-v2-native.
-- ============================================================

do $$
begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists registro_signature_require_plus_insert on storage.objects';
    execute 'drop policy if exists registro_signature_require_plus_update on storage.objects';
  end if;
end $$;

do $$
begin
  if to_regclass('public.registros') is not null then
    drop trigger if exists enforce_registro_signature_plan_gate_trigger on public.registros;
    alter table public.registros drop column if exists assinatura;
  end if;
end $$;

drop function if exists public.enforce_registro_signature_plan_gate();
drop function if exists public.registro_signature_payload_requires_plan(jsonb);
drop function if exists public.can_write_registro_signature_storage_object(text, text, uuid);
drop function if exists public.is_registro_signature_storage_object(text, text);
