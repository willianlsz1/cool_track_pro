# app-v2 - CP27 remocao do helper legado registroPure

## Objetivo

Remover um helper legado pequeno de Registro sem alterar o fluxo de salvamento,
renderizacao, PDF/share, WhatsApp ou PMOC.

## Diagnostico

Comandos usados:

```bash
rg -n --fixed-strings "registroPure.js" src docs/rewrite
rg -n --fixed-strings "asArray" src docs/rewrite
rg -n --fixed-strings "isPreventivaTipo" src docs/rewrite
```

Resultado:

- O unico consumidor runtime do arquivo era `src/ui/views/registro.js`.
- Esse consumidor usava apenas `asArray`.
- `isPreventivaTipo` tinha cobertura em `viewPureHelpers.test.js`, mas nao tinha
  consumidor runtime direto no estado atual.

## Arquivos alterados

- Removido: `src/ui/helpers/registroPure.js`
- Atualizado: `src/ui/views/registro.js`
- Atualizado: `src/__tests__/viewPureHelpers.test.js`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizados: mocks regressivos/exploratorios que ainda apontavam para o
  helper removido.
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- `src/ui/helpers/equipamentosPure.js`
- Registro real, storage, assinatura, PDF/share, WhatsApp, PMOC e orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/viewPureHelpers.test.js src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroLifecycle.contract.test.js --run`
- `npm test -- src/__tests__/regressions/photo-failure-path.test.js src/__tests__/regressions/edit-preserves-photos.test.js src/__tests__/regressions/clear-registro-edit-state.test.js src/__tests__/exploratory/photo-base64-payload.test.js src/__tests__/exploratory/signature-payload.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
