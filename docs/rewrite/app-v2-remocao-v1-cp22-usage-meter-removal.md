# app-v2 - CP22 remocao do usage meter legado orfao

## Objetivo

Remover o componente legado de medidor de uso que sobrou apos a remocao de
billing/pricing e nao era mais usado por nenhuma tela ativa.

## Diagnostico

Comandos usados:

```bash
rg -n "usage-meter|usageMeter|UsageMeter|UsageMeterInternal|usage-progress|usage-label" src e2e index.html vite.config.js docs/rewrite
rg -n "usage-meter|usage-meter__|usageMeter|UsageMeter" src/assets src/ui docs/rewrite
```

Resultado:

- `src/ui/components/usageMeter.js` nao tinha import ativo em runtime principal,
  app-v2, e2e ou configuracao.
- A unica cobertura ativa era `src/__tests__/usageMeter.test.js`, que testava o
  proprio componente orfao.
- `src/ui/components/overflowBanner.js` mantinha apenas uma mencao textual ao
  medidor antigo no comentario de contexto.

## Arquivos alterados

- Removido: `src/ui/components/usageMeter.js`
- Removido: `src/__tests__/usageMeter.test.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `src/ui/components/overflowBanner.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- `src/ui/components/pdfQuotaBadge.js`, `pdfSuccessToast.js` e
  `shareSuccessToast.js`, ainda acoplados a PDF/share.
- `src/ui/components/pushOptInCard.js`, `tour.js`, `overflowBanner.js` e
  `installAppPrompt.js`, ainda usados por views/handlers legados.
- PDF/share, WhatsApp, storage, autenticacao, PMOC e orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/billingPricingCleanupContracts.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
