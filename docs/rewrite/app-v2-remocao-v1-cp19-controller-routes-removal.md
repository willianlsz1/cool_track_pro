# app-v2 - Remocao v1 CP-19 - Corte do registrador de rotas legado

## 1. Objetivo

Remover `src/ui/controller/routes.js` depois da retirada do shell visual,
orquestrador `src/ui/controller.js` e helper de controller legado, sem tocar em
handlers ainda usados por testes de transicao nem em areas sensiveis.

## 2. Diagnostico

Busca executada antes do corte:

```bash
rg -n "controller/routes|registerLegacyRoutes|routes\\.js" src e2e index.html vite.config.js docs/rewrite
rg -n "ui/controller|controller/handlers|controller/serviceRegistrationEntry|controller/routes" src e2e index.html vite.config.js
```

Resultado:

- `src/ui/controller/routes.js` nao tinha import ativo em `index.html`,
  `vite.config.js`, `e2e` ou runtime do app.
- As referencias restantes estavam em testes de lifecycle/contrato do proprio
  registrador de rotas legado e em documentacao historica.
- Handlers de Registro, Equipamentos, Orcamentos, PDF/share e WhatsApp ainda
  possuem consumidores proprios e nao foram removidos neste checkpoint.

## 3. Escopo removido

- `src/ui/controller/routes.js`
- `src/__tests__/clientesRouteAccess.test.js`
- `src/__tests__/contracts/routes.test.js`
- `src/__tests__/equipamentosRouteLifecycle.test.js`
- `src/__tests__/registroRouteLifecycle.test.js`

## 4. Escopo ajustado

- `src/__tests__/legacyShellRetirementGate.test.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`
- `src/__tests__/reactCleanupContracts.test.js`
- `src/__tests__/equipamentos.ownership.test.js`
- `src/__tests__/historicoRegistroIntegration.contract.test.js`

## 5. Escopo preservado

- `src/ui/controller/handlers/**`
- `src/ui/controller/serviceRegistrationEntry.js`
- `src/ui/views/**`
- `src/ui/components/**`
- `src/ui/shell/navigationMode.js`
- `src/ui/shell/templates/views.js`
- `src/ui/shell/templates/modals.js`

## 6. Fora de escopo

Nao foram alterados:

- router core;
- fluxo real de Registro;
- PDF/share;
- WhatsApp;
- assinatura;
- fotos/upload/storage;
- autenticacao;
- Supabase/RLS;
- PMOC real;
- orcamento real.

## 7. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/reactCleanupContracts.test.js src/__tests__/equipamentos.ownership.test.js src/__tests__/historicoRegistroIntegration.contract.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
