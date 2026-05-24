# app-v2 remocao v1 - CP-8h relatorio visual e2e

## Objetivo

Remover o E2E visual legado de Relatorio que ainda dependia do shell/router v1
apos a promocao do app-v2 como entrada principal.

## Arquivo removido

- `e2e/specs/relatorio-visual-smoke.spec.js`

## Evidencia

O spec removido navegava pela aplicacao v1 e validava contratos DOM visuais do
Relatorio legado:

- `#main-content`
- `body[data-route="inicio"]`
- import dinamico de `/src/core/router.js`
- rota interna `relatorio`
- `#view-relatorio`
- `#rel-hero`
- `#rel-controls-root`
- `#relatorio-corpo`
- `data-react-relatorio-hero-mounted`
- `data-react-relatorio-controls-mounted`
- `data-react-relatorio-cards-mounted`
- `#rel-company-pmoc-slot`

Esses contratos pertencem ao runtime legado em `src/ui/` e nao ao app-v2 em
`src/app-v2/`.

## Cobertura preservada

O checkpoint nao removeu testes unitarios ou de contrato do Relatorio legado
ainda presente na base congelada. Permanecem testes focados para view model,
controles, cards, export helpers e contratos de exportacao, incluindo:

- `src/__tests__/relatorioView.test.js`
- `src/__tests__/relatorioLegacyControls.test.js`
- `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`
- `src/__tests__/reportExportContracts.test.js`
- `src/__tests__/reportExportHandlers.test.js`
- `src/features/relatorio/__tests__/export/reportExportHelpers.test.js`

Tambem foi preservado o E2E
`e2e/specs/relatorio-export-pmoc.spec.js`, porque ele toca PDF/share,
WhatsApp e PMOC, areas sensiveis que exigem etapa propria.

Foi adicionada trava em `src/__tests__/legacyV1RemovalContracts.test.js` para
impedir retorno acidental do spec visual removido.

## Fora de escopo

Nao foram alterados:

- runtime de Relatorio em `src/ui/`;
- app-v2;
- PDF/share;
- WhatsApp;
- PMOC real;
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
