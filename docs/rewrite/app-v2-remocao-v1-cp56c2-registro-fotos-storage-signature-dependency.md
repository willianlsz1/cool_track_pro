# app-v2 - Remocao v1 CP56C2 - Storage sem dependencia de assinatura de Registro

## Objetivo

Corrigir a dependencia residual do predicado canonico de `registro-fotos` no
helper de assinatura de Registro aposentado no CP56C.

## Escopo executado

- Adicionada migration para substituir
  `public.can_write_registro_fotos_storage_object`.
- O branch `registros` agora valida apenas bucket, usuario autenticado e owner
  no primeiro segmento do path.
- O branch `equipamentos` continua exigindo Plus+.
- O teste SQL de superficies publicas agora valida que
  `can_write_registro_signature_storage_object` nao existe mais e que
  `assinatura.png` segue o contrato geral de foto de registro.

## Fora do escopo

- Assinatura de orcamento.
- Billing/features.
- PDF/share, WhatsApp, PMOC e novo desenho de upload/storage app-v2-native.

## Validacao esperada

```bash
supabase test db
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
```
