# app-v2 - Remocao v1 CP-16A - Plano de corte shell/router

## 1. Objetivo

Preparar o primeiro corte real de shell/router v1 sem remover cobertura por
tentativa. Este checkpoint resolve a divergencia entre o plano do CP-14 e o
gate criado no CP-15.

Este CP nao remove runtime nem testes.

## 2. Diagnostico

O CP-14 recomendou remover primeiro testes puramente shell/router e, depois,
remover o runtime correspondente. O CP-15 endureceu esse fluxo: os testes
rastreados devem existir enquanto `src/ui/shell.js` e `src/ui/controller.js`
existirem.

Essa trava e correta para evitar uma janela em que o runtime legado continue no
repositorio sem sua cobertura historica.

Verificacao read-only deste CP:

- `src/ui/shell.js` nao aparece como entrada ativa fora do runtime legado;
- `src/ui/controller.js` nao aparece como bootstrap ativo fora do runtime
  legado;
- `src/ui/controller.js` ainda importa `src/ui/shell.js`;
- `src/core/router.js` ainda documenta a orquestracao pelo controller legado;
- os testes rastreados no CP-15 incluem casos de shell puro, router, lifecycle
  de views e contratos de header.

## 3. Decisao

O CP-16 nao deve apagar apenas testes.

O primeiro corte real deve remover, no mesmo checkpoint:

1. o lote shell/router escolhido;
2. os testes shell/router rastreados que ficarem obsoletos;
3. o gate `legacyShellRetirementGate` ou sua expectativa de existencia do
   runtime.

## 4. Lote candidato para o primeiro corte real

Lote recomendado para CP-16B:

- `src/ui/shell.js`
- `src/ui/shell/navigationMode.js`
- `src/ui/shell/headerContracts.js`
- `src/ui/shell/templates/header.js`
- `src/ui/shell/templates/nav.js`
- `src/ui/shell/templates/sidebar.js`
- `src/ui/shell/templates/views.js`
- `src/__tests__/shell.test.js`
- `src/__tests__/navigationMode.test.js`
- `src/__tests__/globalHeaderContracts.test.js`

Motivo:

- esse lote concentra shell visual e contratos de header/sidebar/nav do app v1;
- app-v2 ja possui shell proprio em `src/app-v2/shell/`;
- app-v2 ja possui smoke de entrada principal em `e2e/specs/app-v2-primary-entrypoint.spec.js`
  e `e2e/specs/app-v2-authenticated-primary.spec.js`;
- app-v2 ja possui cobertura de shell em `src/app-v2/shell/AppV2Shell.test.tsx`
  e `src/app-v2/shell/AppV2ShellDataPort.test.tsx`.

## 5. Itens que nao entram no primeiro corte

Nao incluir no CP-16B:

- `src/ui/controller.js`
- `src/ui/controller/routes.js`
- `src/ui/controller/handlers/**`
- `src/__tests__/controller.init.test.js`
- `src/__tests__/contracts/routes.test.js`
- `src/__tests__/clientesRouteAccess.test.js`
- `src/__tests__/equipamentosRouteLifecycle.test.js`
- `src/__tests__/registroRouteLifecycle.test.js`
- `src/__tests__/equipmentDetailOverlayShell.test.js`
- `src/__tests__/equipamentosCpIAssets.test.js`

Motivo:

- esses arquivos ainda misturam router, lifecycle de views e contratos
  operacionais do legado;
- alguns passam por Registro, Equipamentos, Clientes e detalhes visuais que
  devem ser tratados em lotes separados;
- nao devem ser misturados com PDF/share, WhatsApp, assinatura, fotos, auth,
  storage, PMOC ou orcamento real.

## 6. Validacao esperada para CP-16B

Antes do commit:

```bash
rg -n "initAppShell|ui/shell|shell\\.js" index.html src e2e vite.config.js --glob "!src/__tests__/**"
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/legacyShellRetirementGate.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

Resultado aceitavel:

- nenhum import ativo de `src/ui/shell/**` fora dos arquivos removidos;
- gate atualizado deliberadamente;
- cobertura app-v2 preservada;
- falhas, se houver, devem bloquear o corte e virar novo diagnostico.

## 7. Proximo passo recomendado

Executar CP-16B como checkpoint de codigo pequeno, limitado ao shell visual v1.
Nao remover controller/router no mesmo commit.
