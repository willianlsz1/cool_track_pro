# app-v2 remocao v1 - CP-8g historico functional e2e

## Objetivo

Remover o E2E funcional legado de Historico que ainda dependia do shell/router
v1 apos a promocao do app-v2 como entrada principal.

## Arquivo removido

- `e2e/specs/historico-functional-smoke.spec.js`

## Evidencia

O spec removido navegava pela aplicacao v1 e validava contratos DOM do historico
legado:

- `#main-content`
- `body[data-route="inicio"]`
- import dinamico de `/src/core/router.js`
- rota interna `historico`
- `#view-historico`
- `#hist-filters-root`
- `#timeline`
- `data-react-historico-filters-mounted`
- `data-react-historico-timeline-mounted`
- `timeline__item--saved`
- sheet mobile `#hist-filters-sheet-overlay`

Esses contratos pertencem ao runtime legado em `src/ui/` e nao ao app-v2 em
`src/app-v2/`.

## Cobertura preservada

O checkpoint nao removeu testes unitarios ou de contrato do dominio historico
legado ainda presente na base congelada. Permanecem testes focados para filtros,
renderizacao, sheet mobile e helpers de historico, incluindo:

- `src/__tests__/historicoFiltersRenderer.test.js`
- `src/__tests__/historicoFiltersLegacyRender.test.js`
- `src/__tests__/historicoFilters.contract.test.js`
- `src/__tests__/historicoFiltersSheetIntegration.test.js`
- `src/features/historico/__tests__/`

Tambem foi adicionada trava em
`src/__tests__/legacyV1RemovalContracts.test.js` para impedir retorno acidental
do spec E2E removido.

## Fora de escopo

Nao foram alterados:

- runtime de Historico em `src/ui/`;
- app-v2;
- storage real;
- upload/storage de arquivos;
- PDF/share;
- WhatsApp;
- Supabase/RLS;
- billing/pricing;
- PMOC real.

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
