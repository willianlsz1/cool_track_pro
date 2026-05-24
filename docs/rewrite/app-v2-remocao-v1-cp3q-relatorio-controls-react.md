# CP-3q - Remocao da ilha React de controles do Relatorio

## Objetivo

Remover `relatorioControlsIsland` do runtime legado/v1 mantendo os contratos
publicos dos controles de Relatorio usados por filtros, exportacao PDF,
WhatsApp, quota local, PMOC e navegacao delegada.

## Alteracoes

- Criado `src/ui/views/relatorio/controlsRenderer.js` como renderer DOM local
  para os controles de Relatorio.
- `src/ui/views/relatorio.js` deixou de importar dinamicamente
  `relatorioControlsIsland`.
- Removidos:
  - `src/react/entrypoints/relatorioControlsIsland.jsx`
  - `src/react/pages/RelatorioControls.jsx`
  - `src/__tests__/relatorioControlsIsland.test.jsx`
- Atualizados testes que esperavam `data-react-relatorio-controls-mounted` ou
  leitura direta da pagina React removida.

## Contratos preservados

- Roots e slots publicos:
  - `#rel-controls-root`
  - `#rel-main-title`
  - `#rel-main-subtitle`
  - `#rel-mode-segment-slot`
  - `#rel-hero`
  - `#rel-filters`
  - `#rel-filters-chips`
  - `#rel-filters-advanced`
  - `#pdf-quota-slot`
- Campos publicos:
  - `#rel-equip`
  - `#rel-de`
  - `#rel-ate`
- Acoes delegadas:
  - `whatsapp-export`
  - `export-pdf`
  - `toggle-export-dd`
  - `rel-toggle-advanced`
  - `rel-clear-filters`
  - `open-pmoc-modal`
- Navegacao delegada:
  - `data-nav="historico"`
  - `data-nav="relatorio"`
- Dropdown de exportacao:
  - `#rel-export-dd`
  - `#rel-export-dd-toggle`
  - `#rel-export-dd-menu`
- PMOC:
  - `#rel-dd-pmoc-main`
  - `#rel-dd-pmoc-info`
  - `#rel-dd-pmoc-nudge`

## Fora de escopo

- Remocao da ilha React de cards do Relatorio.
- PDF/share real, storage, WhatsApp real, PMOC real, quota real, router,
  billing, Supabase/RLS ou app-v2.

## Validacao executada

```bash
npm run format
npm test -- src/__tests__/relatorioLegacyControls.test.js src/__tests__/relatorioExportPmocLegacyHandlers.test.js src/__tests__/relatorioNavigationLegacyContracts.test.js src/__tests__/reportExportContracts.test.js --run
npm run build
npm run check
git diff --check
```

Observacao: `npm run build` e `npm run check` ainda emitem o warning conhecido
de chunk acima de 500 kB. O `check` tambem preserva os ruidos conhecidos de
testes com jsdom/navigation, Supabase/GoTrue, storage offline e telemetria.
