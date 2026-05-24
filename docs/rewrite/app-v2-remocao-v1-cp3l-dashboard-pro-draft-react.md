# app-v2 remocao v1 - CP-3l dashboard Pro/draft React

## Objetivo

Remover a ilha React legada dos cards Pro/rascunho do Dashboard v1 durante a
preparacao para apagar vestigios do app v1, preservando contratos DOM usados
por handlers e testes.

## Alterado

- `dashboard.js` deixou de importar dinamicamente
  `dashboardProDraftIsland.jsx`.
- A renderizacao dos cards Pro e do card de rascunho passou para
  `src/ui/views/dashboard/proDraft.js`.
- Removidos os arquivos React:
  - `src/react/entrypoints/dashboardProDraftIsland.jsx`
  - `src/react/pages/DashboardProDraft.jsx`
- Removido o teste dedicado da ilha React.
- Testes de contrato do Dashboard passaram a verificar o renderer DOM direto.

## Contratos preservados

- IDs publicos:
  - `dash-pro-ops-row`
  - `dash-critical-alerts-card`
  - `dash-critical-alerts-title`
  - `dash-critical-alerts-sub`
  - `dash-critical-alerts-list`
  - `dash-risk-clients-card`
  - `dash-risk-clients-title`
  - `dash-risk-clients-sub`
  - `dash-risk-clients-list`
  - `dash-pro-draft-root`
- Classes publicas dos cards e do rascunho.
- `data-action`, `data-id`, `data-nav` e `data-tier`.
- Texto dinamico via DOM/textContent, sem `innerHTML` para payload dinamico.

## Fora de escopo

- Remover `dashboardOnboardingIsland`.
- Reescrever Dashboard inteiro.
- Alterar router, storage, PDF/share, WhatsApp, Supabase/RLS, billing ou PMOC.

## Validacao

- `npm test -- src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/globalHeaderContracts.test.js --run`
- Scan por referencias removidas:
  `dashboardProDraftIsland`, `DashboardProDraft`,
  `mountDashboardProDraftReact`, `unmountDashboardProDraftReact`,
  `reactDashboardProDraftMounted`, `data-react-dashboard-pro-draft`.
- Validacao completa esperada:
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - `git diff --check`
  - `git diff --cached --check`

## Risco residual

O Dashboard ainda possui a ilha React `dashboardOnboardingIsland`, que deve ser
tratada em checkpoint separado para manter o corte pequeno e revisavel.
