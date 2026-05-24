# CP-3k - Remocao da ilha React dashboard read-only blocks

## Objetivo

Remover a ilha React legada `dashboardReadOnlyBlocksIsland` do dashboard v1 sem
alterar os contratos publicos usados por handlers e testes durante a remocao dos
vestigios do app v1.

## Alterado

- Removido o dynamic import de
  `src/react/entrypoints/dashboardReadOnlyBlocksIsland.jsx` em
  `src/ui/views/dashboard.js`.
- `dash-readonly-blocks-root` passou a ser renderizado diretamente pelo adapter
  legado do dashboard.
- Preservados ids, classes e atributos publicos:
  - `dash-critical-section`, `dash-critical-now` e `dash-critical-now-count`;
  - `dash-alerts-section`, `dash-alertas-mini` e `dash-upgrade-inline-hint`;
  - `dash-criticos-section` e `dash-criticos`;
  - `dash-recentes-section` e `dash-recentes`;
  - `data-action`, `data-id` e `data-nav`.
- Removidos:
  - `src/react/entrypoints/dashboardReadOnlyBlocksIsland.jsx`;
  - `src/react/pages/DashboardReadOnlyBlocks.jsx`;
  - `src/__tests__/dashboardReadOnlyBlocksIsland.test.jsx`.
- Testes legados foram atualizados para travar a ausencia do entrypoint React e
  manter os contratos DOM.

## Fora de escopo

- Remocao das ilhas React restantes do dashboard:
  - `dashboardProDraftIsland`;
  - `dashboardOnboardingIsland`.
- Refatoracao ampla de `src/ui/views/dashboard.js`.
- Alteracoes em router, storage, Supabase/RLS, PDF/share, WhatsApp, billing ou
  app-v2.

## Validacao esperada

- Testes focados do dashboard legado e header global.
- Scan por vestigios ativos da ilha removida.
- `npm run format`
- `npm run build`
- `npm run check`
