# app-v2 - Remocao v1 CP56B - Storage/sync sem assinatura de Registro

## Objetivo

Remover o campo legado `assinatura` dos normalizers e payloads de storage/sync
de registros, depois do CP56A ter removido o campo do payload local de criacao.

## Escopo executado

- Removida a normalizacao `assinatura: Boolean(r.assinatura)` dos normalizers de
  Registro em `src/core/storage/`.
- Removido o envio de `assinatura` nos upserts remotos de Registro.
- Removida a recriacao local de `assinatura` no pull remoto de Registro.
- Atualizados testes de storage para esperar ausencia do campo.
- Adicionado contrato anti-regressao para impedir retorno de `assinatura` nos
  normalizers e mapeadores de sync.

## Fora do escopo

- Supabase/RLS/migrations.
- Assinatura de orcamento.
- Billing/features.
- PDF/share, WhatsApp, fotos, upload/storage real e PMOC.

## Riscos remanescentes

- A coluna `registros.assinatura` e regras Supabase/RLS ainda existem ate CP56C.
- Registros historicos remotos que ainda possuam a coluna podem continuar no
  banco, mas o runtime local nao reidrata nem reenvia esse campo.

## Validacao esperada

```bash
npm test -- src/__tests__/storage.integration.test.js src/__tests__/storageCacheOffline.contract.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
```
