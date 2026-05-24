# app-v2 - CP23 remocao do post-save completion legado orfao

## Objetivo

Remover um modal legado de conclusao de Registro que nao era mais usado pelo
fluxo ativo de pos-salvamento.

## Diagnostico

Comando usado:

```bash
rg -n "postSaveRegistroCompletion\.js|PostSaveRegistroCompletion" src e2e index.html vite.config.js docs/rewrite
```

Resultado:

- `src/ui/components/postSaveRegistroCompletion.js` nao tinha import ativo em
  runtime principal, app-v2, e2e ou configuracao.
- A unica cobertura ativa era `src/__tests__/postSaveRegistroCompletion.test.js`,
  dedicada ao proprio componente orfao.
- O fluxo ativo de Registro continua usando
  `src/ui/components/postSaveRegistroToast.js`, importado por
  `src/ui/views/registro.js` e coberto por testes existentes.

## Arquivos alterados

- Removido: `src/ui/components/postSaveRegistroCompletion.js`
- Removido: `src/__tests__/postSaveRegistroCompletion.test.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- `src/ui/components/postSaveRegistroToast.js`, fluxo ativo de pos-salvamento.
- `src/ui/views/registro.js` e helpers de save/pos-save.
- PDF/share, WhatsApp, storage, assinatura, PMOC e orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/billingPricingCleanupContracts.test.js --run`
- `npm test -- src/__tests__/postSaveRegistroToast.test.js src/__tests__/registroSavePostSaveHelpers.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
