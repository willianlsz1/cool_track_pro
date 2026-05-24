# app-v2 - CP25 remocao de fragmentos orfaos do first time experience

## Objetivo

Remover dois fragmentos antigos do onboarding inicial que nao eram importados
pelo fluxo ativo.

## Diagnostico

Comandos usados:

```bash
rg -n "firstTimeExperience/steps|firstTimeExperience/styles|FTX_STEPS|firstTimeExperienceStyles" src e2e index.html vite.config.js docs/rewrite
rg -n "firstTimeExperience|onboardingBanner|profileModal|savedHighlight" src/ui src/__tests__ e2e index.html vite.config.js docs/rewrite
```

Resultado:

- `src/ui/components/onboarding/firstTimeExperience/steps.js` nao tinha import
  ativo.
- `src/ui/components/onboarding/firstTimeExperience/styles.js` nao tinha import
  ativo.
- O fluxo usado por `OnboardingBanner` continua importando
  `src/ui/components/onboarding/firstTimeExperience.js`, que por sua vez usa
  `src/ui/components/onboarding/firstTimeExperience.css`.

## Arquivos alterados

- Removido: `src/ui/components/onboarding/firstTimeExperience/steps.js`
- Removido: `src/ui/components/onboarding/firstTimeExperience/styles.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- `src/ui/components/onboarding/firstTimeExperience.js`
- `src/ui/components/onboarding/firstTimeExperience.css`
- `src/ui/components/onboarding/onboardingBanner.js`
- Storage, auth, Supabase/RLS, PDF/share, WhatsApp, PMOC, assinatura e
  orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/firstTimeExperience.test.js src/__tests__/onboardingBanner.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
