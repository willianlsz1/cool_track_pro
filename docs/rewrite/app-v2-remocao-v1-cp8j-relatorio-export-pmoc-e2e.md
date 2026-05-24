# app-v2 remocao v1 - CP-8j relatorio export PMOC e2e

## Objetivo

Remover o ultimo E2E legado de Relatorio que ainda dependia do shell/router v1,
tratando PDF, WhatsApp e PMOC como checkpoint isolado por serem areas sensiveis.

## Arquivo removido

- `e2e/specs/relatorio-export-pmoc.spec.js`

## Evidencia

O spec removido navegava pela aplicacao v1 e validava contratos funcionais
mockados do Relatorio legado:

- `#main-content`
- `body[data-route="inicio"]`
- import dinamico de `/src/core/router.js`
- rota interna `relatorio`
- `#view-relatorio`
- `#rel-equip`
- `#btn-export-dd-toggle`
- `#rel-export-dd-menu`
- `#btn-export-pdf`
- `#btn-whatsapp`
- `#rel-dd-pmoc-main`
- `#pdf-quota-slot`

O spec interceptava `src/ui/controller/handlers/reportExportHandlers.js` para
evitar downloads, popups, PDF real, WhatsApp real e PMOC real. Mesmo assim, era
um E2E do shell legado e nao do app-v2.

## Cobertura preservada

O checkpoint nao alterou runtime, dominio PDF, WhatsApp, PMOC, cotas ou handlers
de exportacao. Permanecem testes focados para os contratos sensiveis:

- `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`
- `src/__tests__/reportExportContracts.test.js`
- `src/__tests__/reportExportHandlers.test.js`
- `src/__tests__/shareReport.test.js`
- `src/features/relatorio/__tests__/export/reportExportHelpers.test.js`

Tambem foi adicionada trava em
`src/__tests__/legacyV1RemovalContracts.test.js` para impedir retorno acidental
do spec E2E removido.

## Fora de escopo

Nao foram alterados:

- runtime de Relatorio em `src/ui/`;
- app-v2;
- geracao de PDF;
- compartilhamento WhatsApp;
- PMOC real;
- cotas;
- storage real;
- Supabase/RLS;
- billing/pricing.

## Validacao esperada

- RED: `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
  falha antes da remocao porque o arquivo ainda existe.
- GREEN: `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
  passa apos a remocao.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
