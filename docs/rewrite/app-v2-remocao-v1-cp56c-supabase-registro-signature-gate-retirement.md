# app-v2 - Remocao v1 CP56C - Supabase/RLS sem assinatura de Registro

## Objetivo

Aposentar os vestigios server-side da assinatura digital legada de Registro,
depois da remocao em UI, payload local e storage/sync.

## Escopo executado

- Adicionada migration para:
  - remover policies restritivas `registro_signature_require_plus_*` em
    `storage.objects`;
  - remover trigger `enforce_registro_signature_plan_gate_trigger`;
  - remover a coluna `public.registros.assinatura`;
  - remover funcoes `registro_signature_*` e
    `can_write_registro_signature_storage_object`.
- Removido o teste SQL dedicado ao gate de assinatura de Registro.
- Atualizado o README de testes Supabase.

## Fora do escopo

- Assinatura de orcamento.
- Billing/features.
- PDF/share, WhatsApp, fotos, upload/storage real app-v2-native e PMOC.

## Riscos remanescentes

- Migrations historicas ainda mostram a criacao antiga da coluna e do gate; a
  nova migration e responsavel por levar bancos novos e existentes ao estado
  final.
- Assinatura de orcamento ainda possui schema e RPCs proprios e sera tratada em
  CP separado.

## Validacao esperada

```bash
supabase test db
npm run format
npm run build
npm run check
```
