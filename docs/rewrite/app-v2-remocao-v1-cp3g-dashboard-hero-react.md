# app-v2 - Remocao v1 CP-3g - Hero do dashboard React

## Objetivo

Remover a ilha React legada do hero do dashboard sem alterar KPIs, proxima
acao, resumo mensal, cards Pro, onboarding, alertas, storage, PDF/share ou
WhatsApp.

## Arquivos alterados

- `src/ui/views/dashboard.js`
- `src/__tests__/dashboardLegacyHero.test.js`
- `src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js`
- `src/__tests__/dashboardLegacyProDraftContracts.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/react/entrypoints/dashboardHeroIsland.jsx`
- `src/react/pages/DashboardHero.jsx`
- `src/__tests__/dashboardHeroIsland.test.jsx`

## Decisao

O hero do dashboard era apenas renderer do shell v1. O adapter
`src/ui/views/dashboard.js` agora renderiza o bloco diretamente em DOM,
preservando os contratos publicos:

- `#dash-hero`
- `#dash-hero-greeting`
- `#dash-hero-summary`
- `#dash-hero-cta`
- `#dash-hero-cta-label`
- `#dash-hero-cta-secondary`
- `#dash-hero-cta-secondary-label`
- `.dash__hero`
- `.dash__hero--quick`
- `.dash__hero-body`
- `.dash__hero-greeting`
- `.dash__hero-summary`
- `.dash__hero-cta-wrap`
- `.dash__hero-cta`
- `.dash__hero-cta--secondary`
- `.dash__hero-cta-label`
- `data-tier`
- `data-tone`
- `data-action`
- `data-nav`
- `data-id`

## Fora de escopo

- Demais ilhas React do dashboard.
- KPIs.
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
npm test -- src/__tests__/dashboardLegacyHero.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/globalHeaderContracts.test.js --run
rg -n "dashboardHeroIsland|DashboardHero|mountDashboardHeroReact|unmountDashboardHeroReact|data-react-dashboard-hero" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O renderer e pequeno, mas fica dentro do dashboard legado. A
cobertura focada preserva estado vazio, modo empresa, escaping de texto e
contratos publicos dos CTAs.
