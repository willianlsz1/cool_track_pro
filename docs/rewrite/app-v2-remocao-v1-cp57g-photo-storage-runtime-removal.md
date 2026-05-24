# app-v2 - CP-57G Remocao do storage legado de fotos

## Objetivo

Aposentar o runtime client-side herdado de upload, fila offline, signed URL e
migracao automatica de fotos do v1, sem recriar storage real no app-v2 e sem
alterar buckets, policies ou migrations historicas.

## Escopo executado

- Removido `src/core/photoStorage.js`.
- Removido `src/core/storage/storageMigrations.js`.
- Removido `src/__tests__/photoStorage.test.js`.
- Removidos de `src/core/storage.js`:
  - flush automatico de fotos pendentes;
- migracao assincrona de fotos legadas;
  - migracao de fotos antes do push de registros.
- Criado `src/core/storage/photoRefs.js` como normalizador puro de referencias
  de fotos ja existentes, sem Supabase, sem upload, sem signing e sem
  localStorage.
- Atualizados imports de normalizacao em storage/sync/equipamentos para usar o
  normalizador puro.
- Atualizados contratos de remocao para garantir que o runtime legado nao volte.

## Fora de escopo

- Remover bucket/policies/migrations historicas de Supabase.
- Implementar upload/storage real app-v2-native.
- Alterar PDF/share, WhatsApp, PMOC, billing, router ou auth.
- Migrar dados reais de fotos.

## Risco

Baixo para o app-v2, porque o app-v2 segue sem storage real de arquivos.
Medio para fluxos v1 que ainda exibiam fotos antigas: o CP preserva apenas
referencias ja persistidas, mas remove upload, signed URL e migracao automatica.
Esse risco e intencional no plano de aposentadoria do v1.
