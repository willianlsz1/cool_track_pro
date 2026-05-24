# app-v2 - Remocao v1 CP-4c: alertas legado

## Objetivo

Remover a tela standalone legada de alertas do shell v1, mantendo os alertas
operacionais do app-v2 como caminho principal.

## Escopo executado

- Removida a rota legada `alertas` de `src/ui/controller/routes.js`.
- Removidos os atalhos legados `go-alertas` do header, help menu, dashboard e
  sidebar.
- Removidos os containers `#view-alertas`, `#alertas-contextual` e
  `#lista-alertas` do shell v1.
- Removidos `src/ui/views/alertas.js` e
  `src/ui/viewModels/alertasViewModel.js`.
- Removidos os testes dedicados ao renderer legado de alertas.
- Atualizados contratos de rotas, navegacao e header para a lista publica sem a
  rota `alertas`.

## Fora de escopo

- Regras de alerta do app-v2.
- Home/Alertas do app-v2.
- Blocos read-only de alertas no dashboard legado.
- Storage, notificacoes, calendario, Supabase/RLS, PDF/share e WhatsApp.

## Validacao planejada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contracts/routes.test.js src/__tests__/contracts/selectors.test.js src/__tests__/navigationMode.test.js src/__tests__/globalHeaderContracts.test.js src/__tests__/clientesRouteAccess.test.js src/__tests__/equipamentosRouteLifecycle.test.js src/__tests__/registroRouteLifecycle.test.js src/__tests__/historicoRegistroIntegration.contract.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
