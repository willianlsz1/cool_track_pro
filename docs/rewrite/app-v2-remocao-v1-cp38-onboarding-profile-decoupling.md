# app-v2 - Remocao v1 CP38: desacoplamento Profile/onboarding

## Objetivo

Reduzir o acoplamento residual do runtime legado sem alterar layout, storage,
auth real, PDF/share, PMOC, billing, upload ou contratos de dados.

## Diagnostico

Comandos usados:

```bash
rg -n "import \{ OnboardingBanner, Profile \} from '../components/onboarding\.js'|import \{ Profile \} from '../components/onboarding\.js'|Profile: \{ get" src/__tests__ src/ui/views/dashboard.js
rg -n "SavedHighlight|markForHighlight|applyIfPending|cooltrack-highlight-id|timeline__item--saved" src docs e2e index.html vite.config.js
```

Resultado:

- `src/ui/views/dashboard.js` era o unico consumidor runtime de `Profile` via
  `src/ui/components/onboarding.js`.
- `Profile` ja tem origem canonica em `src/core/profile.js`.
- O barrel `src/ui/components/onboarding.js` ainda precisa existir para
  `OnboardingBanner`, `ProfileModal`, `FirstTimeExperience` e `SavedHighlight`.

## Alteracao

- `src/ui/views/dashboard.js` passou a importar `Profile` diretamente de
  `src/core/profile.js`.
- `src/ui/components/onboarding.js` deixou de reexportar `Profile`.
- Testes do Dashboard que mockavam `Profile` pelo barrel passaram a mockar
  `src/core/profile.js`.
- `legacyV1RemovalContracts.test.js` ganhou contrato para impedir retorno do
  re-export de `Profile` pelo barrel legado.

## Fora do escopo

- Remover `src/ui/components/onboarding.js`.
- Alterar `SavedHighlight`.
- Alterar onboarding, tour, preferencias, perfil real, auth, storage,
  PDF/share, PMOC, billing ou upload.

## Validacao planejada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/dashboardLegacyHero.test.js src/__tests__/dashboardLegacyKpis.test.js src/__tests__/dashboardLegacyNextAction.test.js src/__tests__/dashboardLegacyLastService.test.js src/__tests__/dashboardLegacyMonth.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js src/__tests__/dashboardLegacyReadOnlyBlocks.test.js src/__tests__/dashboardLegacyOnboardingEmptyOverflow.test.js src/__tests__/dashboard.premium.test.js src/__tests__/dashboard.rules.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```
