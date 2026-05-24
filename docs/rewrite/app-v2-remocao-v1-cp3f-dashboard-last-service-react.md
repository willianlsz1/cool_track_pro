# app-v2 - Remocao v1 CP-3f - Ultimo servico do dashboard React

## Objetivo

Remover a ilha React legada do card "Ultimo servico" do dashboard sem alterar
hero, KPIs, proxima acao, resumo mensal, cards Pro, onboarding, alertas,
storage, PDF/share ou WhatsApp.

## Arquivos alterados

- `src/ui/views/dashboard.js`
- `src/__tests__/dashboardLegacyLastService.test.js`
- `src/__tests__/dashboardLegacyProDraftContracts.test.js`
- `src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/react/entrypoints/dashboardLastServiceIsland.jsx`
- `src/react/pages/DashboardLastService.jsx`
- `src/__tests__/dashboardLastServiceIsland.test.jsx`

## Decisao

O card de ultimo servico era apenas renderer do shell v1. O adapter
`src/ui/views/dashboard.js` agora renderiza esse card diretamente em DOM,
preservando os contratos publicos:

- `#dash-last-service`
- `#dash-last-title`
- `#dash-last-sub`
- `#dash-last-desc`
- `.dash__card`
- `.dash__card--last-service`
- `.dash__card-icon`
- `.dash__card-body`
- `.dash__card-label`

## Fora de escopo

- Demais ilhas React do dashboard.
- Fluxos Pro/draft.
- Onboarding.
- Alertas.
- Charts.
- Storage/Supabase.
- PDF/share e WhatsApp.
- Redesign visual.

## Validacao esperada

```bash
npm test -- src/__tests__/dashboardLegacyLastService.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/globalHeaderContracts.test.js --run
rg -n "dashboardLastServiceIsland|mountDashboardLastServiceReact|unmountDashboardLastServiceReact|DashboardLastService.jsx|data-react-dashboard-last-service" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O renderer e pequeno, mas fica dentro do dashboard legado. A
cobertura focada preserva estado vazio, estado preenchido, escaping de texto e
contratos publicos do card.
