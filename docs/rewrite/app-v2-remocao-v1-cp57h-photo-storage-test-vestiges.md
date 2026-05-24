# app-v2 - CP-57H Limpeza de vestigios test-only de photoStorage

## Objetivo

Remover referencias de teste ao modulo `src/core/photoStorage.js` depois que o
runtime foi aposentado no CP-57G.

## Escopo executado

- Removidos mocks de `photoStorage.js` em testes de Registro, exploratorio e
  regressoes.
- Removidas expectativas antigas sobre `uploadPendingPhotos`.
- Adicionado contrato em `legacyV1RemovalContracts` para impedir novos mocks de
  `photoStorage.js` ou `uploadPendingPhotos` em `src/__tests__`.

## Fora de escopo

- Runtime de Registro, Equipamentos, Historico ou app-v2.
- Supabase/RLS, buckets, policies e migrations.
- PDF/share, WhatsApp, PMOC, billing, router ou auth.
