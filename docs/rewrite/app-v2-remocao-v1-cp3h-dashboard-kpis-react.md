# app-v2 - Remocao v1 CP-3h - KPIs do dashboard React

## Objetivo

Remover a ilha React legada dos KPIs do dashboard sem alterar hero, proxima
acao, resumo mensal, cards Pro, onboarding, alertas, storage, PDF/share ou
WhatsApp.

## Arquivos alterados

- `src/ui/views/dashboard.js`
- `src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js`
- `src/__tests__/dashboardLegacyProDraftContracts.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/react/entrypoints/dashboardKpisIsland.jsx`
- `src/react/pages/DashboardKpis.jsx`
- `src/__tests__/dashboardKpisIsland.test.jsx`

## Decisao

Os KPIs do dashboard eram apenas renderer visual do shell v1. O adapter
`src/ui/views/dashboard.js` agora renderiza os cards diretamente em DOM,
preservando os contratos publicos:

- `#dash-kpis-root`
- `#dash-kpi-ativos`
- `#dash-kpi-ativos-sub`
- `#dash-kpi-ef`
- `#dash-kpi-ef-spark`
- `#dash-kpi-ef-sub`
- `#dash-kpi-anom`
- `#dash-kpi-anom-sub`
- `#dash-kpi-mes`
- `#dash-kpi-mes-spark`
- `#dash-kpi-mes-sub`
- `.dash__kpi-grid`
- `.dash__kpi`
- `.dash__kpi-label`
- `.dash__kpi-value`
- `.dash__kpi-spark`
- `.dash__kpi-sub`
- `data-tone`

## Fora de escopo

- Demais ilhas React do dashboard.
- Hero.
- Proxima acao.
- Resumo mensal.
- Fluxos Pro/draft.
- Onboarding.
- Alertas.
- Charts.
- Storage/Supabase.
- PDF/share e WhatsApp.
- Redesign visual.

## Validacao esperada

```bash
npm test -- src/__tests__/dashboardLegacyKpis.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/globalHeaderContracts.test.js --run
rg -n "dashboardKpisIsland|DashboardKpis|mountDashboardKpisReact|unmountDashboardKpisReact|reactDashboardKpisMounted|data-react-dashboard-kpis" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O renderer preserva ids, classes, tons e escaping por `textContent`,
mas ainda fica dentro do dashboard legado enquanto o v1 e removido por
checkpoints.
