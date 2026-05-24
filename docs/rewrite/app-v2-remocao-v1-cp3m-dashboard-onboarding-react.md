# app-v2 remocao v1 - CP-3m dashboard onboarding React

## Objetivo

Remover a ilha React legada de onboarding/empty/overflow do Dashboard v1,
mantendo os contratos DOM necessarios enquanto o v1 e desmontado por cortes
pequenos.

## Alterado

- `dashboard.js` deixou de importar dinamicamente
  `dashboardOnboardingIsland.jsx`.
- A renderizacao de empty state, install prompt, checklist, onboarding
  contextual e overflow passou para `src/ui/views/dashboard/onboarding.js`.
- Removidos os arquivos React:
  - `src/react/entrypoints/dashboardOnboardingIsland.jsx`
  - `src/react/pages/DashboardOnboarding.jsx`
- Removido o teste dedicado da ilha React.
- Testes de contrato do Dashboard e header foram ajustados para o renderer DOM.

## Contratos preservados

- IDs publicos:
  - `dash-empty`
  - `dash-onboarding`
  - `dash-overflow-banner`
  - `dash-pro-draft-root`
- Classes publicas de empty state, onboarding, install prompt e overflow.
- `data-action`, `data-id`, `data-nav`, `data-tier` e `data-limit-type`.
- Empty state continua em `dash-empty`, overflow continua em
  `dash-overflow-banner` e o root de rascunho continua dentro de
  `dash-onboarding`.
- Texto dinamico via DOM/textContent, sem `innerHTML` para payload dinamico.

## Fora de escopo

- Reescrever o Dashboard inteiro.
- Remover ilhas React de outras telas.
- Alterar router, storage, PDF/share, WhatsApp, Supabase/RLS, billing ou PMOC.

## Validacao

- `npm test -- src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/globalHeaderContracts.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js --run`
- Scan por referencias removidas:
  `dashboardOnboardingIsland`, `DashboardOnboarding`,
  `mountDashboardOnboardingReact`, `unmountDashboardOnboardingReact`,
  `reactDashboardOnboardingMounted`, `data-react-dashboard-onboarding`.
- Validacao completa esperada:
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - `git diff --check`
  - `git diff --cached --check`

## Risco residual

Ainda restam ilhas React fora do Dashboard, principalmente em Clientes,
Equipamentos, Historico, Registro e Relatorio. Elas devem seguir o mesmo padrao:
um checkpoint pequeno por ilha ou por bloco coeso.
