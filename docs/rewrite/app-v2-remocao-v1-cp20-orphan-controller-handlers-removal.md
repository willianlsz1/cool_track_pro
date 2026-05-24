# app-v2 - Remocao v1 CP-20 - Corte de handlers orfaos do controller

## 1. Objetivo

Remover handlers de controller v1 que ficaram orfaos depois da retirada do
orquestrador `src/ui/controller.js` e do registrador `src/ui/controller/routes.js`.

## 2. Diagnostico

Buscas executadas antes do corte:

```bash
rg -n "clienteHandlers|bindClienteHandlers|profileAccountHandlers|bindProfileAccountHandlers" src e2e index.html vite.config.js docs/rewrite
rg -n "controller/handlers/(clienteHandlers|profileAccountHandlers)" src e2e index.html vite.config.js docs/rewrite
```

Resultado:

- `src/ui/controller/handlers/clienteHandlers.js` nao era importado por runtime
  ativo.
- `src/ui/controller/handlers/profileAccountHandlers.js` nao era importado por
  runtime ativo.
- A referencia restante a `profileAccountHandlers.js` era apenas em teste de
  limpeza de billing/pricing.
- A referencia restante a `clienteHandlers` era comentario em view legada.

## 3. Escopo removido

- `src/ui/controller/handlers/clienteHandlers.js`
- `src/ui/controller/handlers/profileAccountHandlers.js`

## 4. Escopo ajustado

- `src/__tests__/legacyShellRetirementGate.test.js`
- `src/__tests__/billingPricingCleanupContracts.test.js`
- `src/ui/views/clientes.js`

## 5. Escopo preservado

- `src/ui/controller/handlers/equipmentHandlers.js`
- `src/ui/controller/handlers/navigationHandlers.js`
- `src/ui/controller/handlers/orcamentoHandlers.js`
- `src/ui/controller/handlers/registroHandlers.js`
- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/ui/controller/serviceRegistrationEntry.js`

## 6. Fora de escopo

Nao foram alterados:

- handlers de Registro;
- handlers de Equipamentos;
- handlers de Orcamentos;
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
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/billingPricingCleanupContracts.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
