# app-v2 - CP21 remocao do account modal legado orfao

## Objetivo

Remover um componente legado de conta que ficou orfao depois da aposentadoria do
shell/controller v1 e da remocao de billing/pricing.

## Diagnostico

Comandos usados:

```bash
rg -n "\.\/accountModal|components/accountModal|accountModal\.js|openAccountModal|closeAccountModal" src e2e index.html vite.config.js --glob '!src/__tests__/billingPricingCleanupContracts.test.js'
rg -n "accountModal\.js|supportFeedbackModal\.js|passwordRecoveryModal\.js|installAppPrompt\.js" src e2e index.html vite.config.js docs/rewrite
```

Resultado:

- `src/ui/components/accountModal.js` nao tinha import ativo no runtime
  principal, app-v2, e2e ou configuracao.
- A unica leitura ativa era o contrato de limpeza
  `src/__tests__/billingPricingCleanupContracts.test.js`.
- O componente ainda importava contratos comerciais antigos de planos, portanto
  sua remocao reduz vestigios de billing/pricing sem alterar fluxo ativo.

## Arquivos alterados

- Removido: `src/ui/components/accountModal.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `src/__tests__/billingPricingCleanupContracts.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- `src/ui/components/passwordRecoveryModal.js`, ainda usado por
  `src/ui/components/authscreen.js`.
- `src/ui/components/supportFeedbackModal.js` e
  `src/ui/components/installAppPrompt.js`, ainda usados por
  `src/ui/controller/handlers/navigationHandlers.js` e/ou
  `src/ui/views/dashboard.js`.
- `src/ui/shell/templates/views.js` e `src/ui/shell/templates/modals.js`, ainda
  usados como suporte de testes legados.
- PDF/share, WhatsApp, storage, autenticacao, PMOC e orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/billingPricingCleanupContracts.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
