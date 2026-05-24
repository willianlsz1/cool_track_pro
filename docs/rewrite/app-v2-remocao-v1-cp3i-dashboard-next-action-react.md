# app-v2 - Remocao v1 CP-3i - Proxima acao do dashboard React

## Objetivo

Remover a ilha React legada da proxima acao do dashboard sem alterar KPIs, hero,
ultimo servico, resumo mensal, cards Pro, onboarding, alertas, storage,
PDF/share ou WhatsApp.

## Arquivos alterados

- `src/ui/views/dashboard.js`
- `src/__tests__/dashboardLegacyNextAction.test.js`
- `src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js`
- `src/__tests__/dashboardLegacyProDraftContracts.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/react/entrypoints/dashboardNextActionIsland.jsx`
- `src/react/pages/DashboardNextAction.jsx`
- `src/__tests__/dashboardNextActionIsland.test.jsx`

## Decisao

A proxima acao do dashboard era apenas renderer visual do shell v1. O adapter
`src/ui/views/dashboard.js` agora renderiza o card diretamente em DOM,
preservando os contratos publicos:

- `#dash-next-action-card`
- `#dash-next-title`
- `#dash-next-sub`
- `#dash-next-cta`
- `#dash-next-cta-label`
- `.dash__card`
- `.dash__card--next-action`
- `.dash__card-label`
- `.dash__card-title`
- `.dash__card-sub`
- `.dash__card-cta`
- `.dash__card-cta-label`
- `data-tone`
- `data-nav`
- `data-action`
- `data-id`

Conteudo dinamico continua sendo aplicado com `textContent`, e atributos
opcionais continuam passando pelo helper que remove atributos vazios.

## Fora de escopo

- Demais ilhas React do dashboard.
- Hero.
- KPIs.
- Ultimo servico.
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
npm test -- src/__tests__/dashboardLegacyNextAction.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/globalHeaderContracts.test.js --run
rg -n "dashboardNextActionIsland|DashboardNextAction|mountDashboardNextActionReact|unmountDashboardNextActionReact|reactDashboardNextActionMounted|data-react-dashboard-next-action" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O renderer preserva ids, classes, tons, atributos de navegacao e
escaping por `textContent`, mas ainda fica dentro do dashboard legado enquanto o
v1 e removido por checkpoints.
