# app-v2 - CP54B1 - Remocao de Relatorio v1

## 1. Objetivo

Remover a view DOM legada de Relatorio e seus renderers locais, mantendo
PDF/share, WhatsApp, Historico e PMOC para checkpoints proprios.

Este CP nao recria relatorio real no app-v2, nao altera `src/domain/pdf/**`,
nao remove `reportExportHandlers.js`, nao muda `vendor-pdf`, nao mexe em
`manualChunks` e nao remove PMOC.

## 2. Evidencia de escopo

Busca executada antes da remocao:

```bash
rg -n "ui/views/relatorio|views/relatorio|\\.\\/relatorio\\/controlsRenderer|\\.\\/relatorio\\/cardsRenderer|src/ui/views/relatorio|relatorio/cardsRenderer|relatorio/controlsRenderer" src index.html public e2e docs/rewrite
rg -n "relatorio" src/ui/controller src/ui/shell src/ui/views/historico.js src/ui/shell/templates/views.js src/ui/shell/navigationMode.js
```

Resultado:

- A view `src/ui/views/relatorio.js` nao era importada pelo runtime principal
  app-v2.
- O vestigio v1 estava em `src/ui/shell/templates/views.js`,
  `src/ui/shell/navigationMode.js`, CTA/toggle legado de Historico e testes
  dedicados da view/renderers.
- `reportExportHandlers.js` continua usado por Historico/Registro e fica para
  CP54C.

## 3. Alteracoes

- Removida `src/ui/views/relatorio.js`.
- Removidos os renderers `src/ui/views/relatorio/cardsRenderer.js` e
  `src/ui/views/relatorio/controlsRenderer.js`.
- Removido o placeholder `#view-relatorio` e os toggles legados
  `data-nav="relatorio"` do template v1.
- Removido `relatorio` do layout de navegacao legado.
- Removido o CTA legado de Historico para a view de Relatorio v1.
- Removidos `src/ui/viewModels/relatorioContracts.js` e
  `src/ui/viewModels/relatorioViewModel.js`, que ficaram sem consumidor
  runtime apos a remocao da view.
- Aposentados testes dedicados `relatorioLegacy*`, `relatorioView*`,
  `relatorioCardsLegacyHandlers`, `relatorioCompanyPmocContracts` e
  `relatorioExportPmocLegacyHandlers`.
- Atualizados gates de remocao para impedir retorno da view/renderers v1.
- Mantido o contrato de PDF/share por Historico em `reportExportContracts`.

## 4. Fora de escopo

- `src/ui/controller/handlers/reportExportHandlers.js`.
- `src/domain/pdf/**`.
- `src/ui/views/historico.js` como view legada restante.
- `export-pdf` e `whatsapp-export` emitidos por Historico.
- PMOC real, modais PMOC e dominio PDF PMOC.
- novo gerador app-v2-native de PDF/share.

## 5. Validacao esperada

```bash
rg -n "src/ui/views/relatorio|view-relatorio|relatorio-corpo|data-nav=\"relatorio\"|relatorio/cardsRenderer|relatorio/controlsRenderer" src index.html public e2e
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/navigationMode.test.js src/__tests__/contracts/selectors.test.js src/__tests__/reportExportContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
