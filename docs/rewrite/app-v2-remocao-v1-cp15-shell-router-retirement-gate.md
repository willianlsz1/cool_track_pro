# app-v2 - Remocao v1 CP-15 - Gate de aposentadoria shell/router

## 1. Objetivo

Criar uma trava executavel para impedir que testes de shell/router v1 sejam
apagados de forma oportunista antes da remocao deliberada do runtime legado.

Este checkpoint nao remove runtime nem testes. Ele prepara a primeira
aposentadoria real de shell/router.

## 2. Diagnostico

O CP-14 classificou 67 arquivos de teste ainda ligados a `ui/shell` ou
`ui/controller`. Dentro desse grupo, ha um subconjunto de testes puramente
shell/router que pode ser aposentado junto com `src/ui/shell.js`,
`src/ui/shell/**`, `src/ui/controller.js` e `src/ui/controller/routes.js`, desde
que a cobertura app-v2 equivalente exista.

## 3. Alteracao

Foi criado `src/__tests__/legacyShellRetirementGate.test.js`.

O gate faz duas verificacoes:

1. Enquanto `src/ui/shell.js` e `src/ui/controller.js` existem, os testes
   shell/router-only rastreados tambem precisam existir.
2. A cobertura app-v2 de substituicao precisa estar presente antes da
   aposentadoria:
   - `e2e/specs/app-v2-primary-entrypoint.spec.js`;
   - `e2e/specs/app-v2-authenticated-primary.spec.js`;
   - `src/app-v2/shell/AppV2Shell.test.tsx`;
   - `src/app-v2/shell/AppV2ShellDataPort.test.tsx`.

## 4. Testes shell/router rastreados

- `src/__tests__/shell.test.js`
- `src/__tests__/navigationMode.test.js`
- `src/__tests__/controller.init.test.js`
- `src/__tests__/contracts/routes.test.js`
- `src/__tests__/clientesRouteAccess.test.js`
- `src/__tests__/equipamentosRouteLifecycle.test.js`
- `src/__tests__/registroRouteLifecycle.test.js`
- `src/__tests__/globalHeaderContracts.test.js`
- `src/__tests__/a11y/views.test.js`
- `src/__tests__/equipmentDetailOverlayShell.test.js`
- `src/__tests__/equipamentosCpIAssets.test.js`

## 5. Como remover no futuro

Quando o checkpoint de remocao real chegar:

1. Remover o lote shell/router e os testes rastreados no mesmo CP.
2. Atualizar ou remover o gate explicitamente nesse commit.
3. Manter fora do lote qualquer teste sensivel de PDF/share, WhatsApp,
   Registro, assinatura, fotos, auth, storage ou PMOC.

## 6. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
