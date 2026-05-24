# app-v2 - CP54B - Prontidao para remocao de Relatorio v1

## 1. Objetivo

Preparar o corte da view DOM legada de Relatorio sem misturar PDF/share,
WhatsApp ou PMOC no mesmo checkpoint.

Este CP nao remove runtime. Ele registra a fronteira tecnica para que a remocao
posterior de `src/ui/views/relatorio.js` seja feita com escopo fechado e sem
reutilizar arquivos v1 no app-v2.

## 2. Evidencia de escopo

Busca executada antes de qualquer remocao:

```bash
rg -n "ui/views/relatorio|views/relatorio|relatorio\\.js|relatorio/cardsRenderer|relatorio/controlsRenderer|reportExportHandlers|export-pdf|whatsapp-export|src/domain/pdf|pmoc" src/__tests__ src/ui src/app-v2 index.html public e2e
rg --files src/ui/views src/ui/controller/handlers src/ui/components src/domain src/__tests__ | rg "relatorio|reportExport|shareReport|pdf|pmoc"
```

Resultado:

- `src/ui/views/relatorio.js` ainda importa PMOC (`domain/pmoc` e
  `core/pmocProgress`) e renderers DOM de Relatorio.
- `src/ui/views/relatorio/controlsRenderer.js` emite acoes sensiveis
  `export-pdf`, `whatsapp-export`, `open-pmoc-modal` e `open-pmoc-info`.
- `src/ui/views/relatorio/cardsRenderer.js` tambem emite `export-pdf` e
  `whatsapp-export` por registro.
- `src/ui/controller/handlers/reportExportHandlers.js` ainda atende PDF,
  WhatsApp e PMOC para Relatorio/Historico.
- Testes `relatorioLegacy*`, `relatorioView*`,
  `relatorioExportPmocLegacyHandlers.test.js`, `reportExportContracts.test.js`
  e `reportExportHandlers.test.js` cobrem essa cadeia v1.
- `src/app-v2/**` nao importa a view v1 de Relatorio, renderers v1,
  `reportExportHandlers.js` ou `src/domain/pdf/**`.

## 3. Decisao

Nao remover `src/ui/views/relatorio.js` neste CP.

Motivo: a view v1 de Relatorio e o ponto de encontro entre DOM legado,
contratos de exportacao, PDF/share, WhatsApp e PMOC. Apagar essa view agora
forcaria uma remocao conjunta de areas sensiveis que o plano separou em
CP54B, CP54C e CP54F.

O app-v2 ja possui cobertura local/mock para relatorios em `Servicos >
Relatorios`; a remocao futura deve apagar o runtime v1 em vez de adapta-lo ou
importa-lo.

## 4. Plano para o corte de codigo

### CP54B1 - Aposentar Relatorio DOM v1

Escopo:

- `src/ui/views/relatorio.js`.
- `src/ui/views/relatorio/cardsRenderer.js`.
- `src/ui/views/relatorio/controlsRenderer.js`.
- Testes dedicados que importam diretamente a view/renderers v1 e nao protegem
  contratos ainda usados por Historico/PDF/share.
- Gates de remocao em `legacyShellRetirementGate` e
  `legacyV1RemovalContracts`.

Fora de escopo:

- `src/ui/controller/handlers/reportExportHandlers.js`.
- `src/domain/pdf/**`.
- `src/ui/views/historico.js` e seus botoes `export-pdf`/`whatsapp-export`.
- PMOC real, modais PMOC e dominio PDF PMOC.

### CP54C - PDF/share/WhatsApp v1

Executar somente depois que a view DOM v1 de Relatorio estiver aposentada.
Esse CP deve decidir a remocao de `reportExportHandlers.js`, componentes de
toast/quota e dominio de share legado.

### CP54F - PMOC v1

Executar depois dos cortes de Relatorio e PDF/share, porque PMOC ainda aparece
em Relatorio, Historico, Registro, Cliente e dominio PDF.

## 5. Validacao deste CP

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

Se o teste focado falhar por `spawn EPERM` local no Vitest/esbuild, registrar a
falha e usar `npm run check` como validacao ampla somente se ele executar a
suite e sair com codigo 0.
