# app-v2 - Remocao v1 CP-9d: helper puro de Relatorio

## Objetivo

Remover o pequeno modulo `src/features/relatorio/**` restante, movendo o helper
puro de copy de compartilhamento para `src/domain`.

## Alterado

- Criado `src/domain/reportExportHelpers.js` com `buildWhatsAppSuccessCopy`.
- `reportExportHandlers` passou a importar o helper da camada `domain`.
- O teste co-localizado em `src/features/relatorio/**` foi movido para
  `src/__tests__/reportExportHelpers.test.js`.
- `legacyV1RemovalContracts` passou a travar a ausencia dos arquivos antigos.
- Removidos:
  - `src/features/relatorio/export/reportExportHelpers.js`;
  - `src/features/relatorio/__tests__/export/reportExportHelpers.test.js`.

## Nao alterado

- Fluxo real de exportacao PDF/WhatsApp.
- `domain/pdf`, `domain/pdf/shareReport`, quota, storage, Supabase/RLS, PMOC,
  assinatura, billing, pricing ou router.
- Copy retornada por `buildWhatsAppSuccessCopy`.

## Risco

Baixo. O helper nao tinha imports de adapter, DOM, PDF, share, Toast, Router,
`document`, `window` ou `navigator`. A mudanca reclassifica o modulo como helper
puro de dominio e preserva o contrato por teste.

## Validacao esperada

```bash
npm test -- src/__tests__/reportExportHelpers.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/relatorioExportPmocLegacyHandlers.test.js src/__tests__/reportExportContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
```
