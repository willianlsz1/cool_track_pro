# app-v2 - Remocao v1 CP-16B - Corte do shell visual legado

## 1. Objetivo

Remover o shell visual morto do app v1 sem tocar no router, views legadas,
modais globais ou areas sensiveis.

## 2. Escopo removido

- `src/ui/shell.js`
- `src/ui/shell/headerContracts.js`
- `src/ui/shell/templates/header.js`
- `src/ui/shell/templates/nav.js`
- `src/ui/shell/templates/sidebar.js`
- `src/__tests__/shell.test.js`
- `src/__tests__/globalHeaderContracts.test.js`

## 3. Escopo preservado

- `src/ui/controller.js`
- `src/ui/controller/**`
- `src/ui/shell/navigationMode.js`
- `src/ui/shell/templates/views.js`
- `src/ui/shell/templates/modals.js`
- testes de Registro, Historico, Relatorio, Equipamentos, Clientes e Conta

Motivo:

- `navigationMode.js` ainda e usado por views legadas;
- `views.js` e `modals.js` ainda sustentam testes de fluxos sensiveis e
  operacionais;
- controller/router ainda sera tratado em checkpoint proprio.

## 4. Ajustes de transicao

`src/ui/controller.js` deixou de importar e chamar `updateShellSidebar`, pois
esse helper vivia em `src/ui/shell.js` e atualizava apenas a sidebar/header
visual do shell v1.

`src/__tests__/legacyShellRetirementGate.test.js` passou a exigir:

- ausencia dos arquivos removidos neste CP;
- ausencia dos testes obsoletos correspondentes;
- presenca dos arquivos que continuam em checkpoints futuros;
- presenca da cobertura app-v2 equivalente.

## 5. Fora de escopo

Nao foram alterados:

- PDF/share;
- WhatsApp;
- assinatura;
- fotos/upload/storage;
- autenticacao;
- Supabase/RLS;
- PMOC real;
- orcamento real;
- `package.json`, Vite, ESLint ou TypeScript.

## 6. Validacao esperada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/controller.init.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
