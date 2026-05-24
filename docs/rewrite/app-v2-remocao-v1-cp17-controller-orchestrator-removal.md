# app-v2 - Remocao v1 CP-17 - Corte do controller orchestrator legado

## 1. Objetivo

Remover o orquestrador morto `src/ui/controller.js` do app v1 sem tocar nos
handlers, rotas, views, modais ou areas sensiveis que ainda aguardam
checkpoints proprios.

## 2. Escopo removido

- `src/ui/controller.js`
- `src/__tests__/controller.init.test.js`

## 3. Escopo preservado

- `src/ui/controller/**`
- `src/ui/controller/routes.js`
- `src/ui/controller/handlers/**`
- `src/ui/controller/helpers/**`
- `src/ui/shell/navigationMode.js`
- `src/ui/shell/templates/views.js`
- `src/ui/shell/templates/modals.js`

Motivo:

- `src/ui/controller.js` nao era mais entrypoint ativo;
- o build principal e o app-v2 nao importam o orquestrador legado;
- rotas, handlers e helpers ainda sao cobertos por testes legados e serao
  removidos em lotes menores por dominio.

## 4. Ajuste de gate

`src/__tests__/legacyShellRetirementGate.test.js` passou a exigir tambem a
ausencia de:

- `src/ui/controller.js`;
- `src/__tests__/controller.init.test.js`.

O mesmo gate preserva explicitamente arquivos que ficam para checkpoints
posteriores.

## 5. Fora de escopo

Nao foram alterados:

- router core;
- rotas legadas;
- handlers de Registro, Relatorio, Equipamentos, Clientes, Conta ou Orcamentos;
- PDF/share;
- WhatsApp;
- assinatura;
- fotos/upload/storage;
- autenticacao;
- Supabase/RLS;
- PMOC real;
- orcamento real.

## 6. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contracts/routes.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
