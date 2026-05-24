# app-v2 - Remocao v1 CP-3j - Resumo mensal do dashboard React

## Objetivo

Remover a ilha React legada do resumo mensal do dashboard sem alterar hero,
KPIs, proxima acao, ultimo servico, cards Pro, onboarding, alertas, storage,
PDF/share ou WhatsApp.

## Arquivos alterados

- `src/ui/views/dashboard.js`
- `src/__tests__/dashboardLegacyMonth.test.js`
- `src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js`
- `src/__tests__/dashboardLegacyProDraftContracts.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/react/entrypoints/dashboardMonthSummaryIsland.jsx`
- `src/react/pages/DashboardMonthSummary.jsx`
- `src/__tests__/dashboardMonthSummaryIsland.test.jsx`

## Decisao

O resumo mensal do dashboard era apenas renderer visual do shell v1. O adapter
`src/ui/views/dashboard.js` agora renderiza a secao diretamente em DOM,
preservando os contratos publicos:

- `#dash-month-section`
- `#dash-month-label`
- `#dash-month-services`
- `#dash-month-equips`
- `#dash-month-pending`
- `#dash-month-trend`
- `.dash__section`
- `.dash__section-header`
- `.dash__section-label`
- `.dash__kpi-grid`
- `.dash__kpi`
- `.dash__kpi-label`
- `.dash__kpi-value`
- `.dash__kpi-sub`

Conteudo dinamico continua sendo aplicado com `textContent`. A secao nao possui
`data-action`, `data-id` ou `data-nav`.

## Fora de escopo

- Demais ilhas React do dashboard.
- Hero.
- KPIs.
- Proxima acao.
- Ultimo servico.
- Fluxos Pro/draft.
- Onboarding.
- Alertas.
- Charts.
- Storage/Supabase.
- PDF/share e WhatsApp.
- Redesign visual.

## Validacao esperada

```bash
npm test -- src/__tests__/dashboardLegacyMonth.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/globalHeaderContracts.test.js --run
rg -n "dashboardMonthSummaryIsland|DashboardMonthSummary|mountDashboardMonthSummaryReact|unmountDashboardMonthSummaryReact|reactDashboardMonthSummaryMounted|data-react-dashboard-month-summary" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O renderer preserva ids, classes e escaping por `textContent`, mas
ainda fica dentro do dashboard legado enquanto o v1 e removido por checkpoints.
