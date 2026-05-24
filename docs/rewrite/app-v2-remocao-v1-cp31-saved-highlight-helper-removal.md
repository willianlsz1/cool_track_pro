# app-v2 - Remocao v1 CP31: helper SavedHighlight

## Objetivo

Remover o helper legado `src/ui/components/onboarding/savedHighlight.js`,
preservando a API publica `SavedHighlight` exportada por
`src/ui/components/onboarding.js`.

## Diagnostico

`savedHighlight.js` era consumido apenas pelo barrel
`src/ui/components/onboarding.js`. Os consumidores runtime de Registro e
Historico importam `SavedHighlight` pelo barrel, nao pelo arquivo interno.

O helper nao cruzava router, storage real persistido, auth, billing, PDF/share,
WhatsApp, PMOC real, Supabase/RLS ou orcamento real. Ele usa `sessionStorage`,
`requestAnimationFrame` e `setTimeout` ja existentes para destacar o registro
salvo na timeline.

## Alteracoes

- Removido `src/ui/components/onboarding/savedHighlight.js`.
- Co-localizada a implementacao de `SavedHighlight` no barrel
  `src/ui/components/onboarding.js`.
- Corrigido texto corrompido no comentario do barrel tocado.
- Atualizado o gate `legacyShellRetirementGate.test.js`.
- Atualizado o plano de vestigios v1 com CP31 e contagem de `src/ui`.

## Fora de escopo

- Nenhuma alteracao em app-v2.
- Nenhuma alteracao na API publica `SavedHighlight`.
- Nenhuma alteracao em router, storage real persistido, auth, billing,
  PDF/share, WhatsApp, PMOC real, Supabase/RLS ou orcamento real.

## Validacao

Validacao planejada:

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/registroSavePostSaveHelpers.test.js src/__tests__/historicoView.test.js src/__tests__/historicoRegistroIntegration.contract.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
