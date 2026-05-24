# CP-3r - Remocao da ilha React de cards do Relatorio

## Objetivo

Remover `relatorioCardsIsland` do runtime legado/v1 mantendo os contratos
publicos dos cards de Relatorio usados por expandir detalhes, assinatura,
PDF por registro, WhatsApp por registro, empty state e navegacao delegada.

## Alteracoes

- Criado `src/ui/views/relatorio/cardsRenderer.js` como renderer DOM local para
  os cards de Relatorio.
- `src/ui/views/relatorio.js` deixou de importar dinamicamente
  `relatorioCardsIsland`.
- Removidos:
  - `src/react/entrypoints/relatorioCardsIsland.jsx`
  - `src/react/pages/RelatorioCards.jsx`
  - `src/__tests__/relatorioCardsIsland.test.jsx`
- Atualizados testes que esperavam `data-react-relatorio-cards-mounted` ou
  leitura direta da pagina React removida.

## Contratos preservados

- Root publico:
  - `#relatorio-corpo`
- Estado vazio:
  - `.rel-empty`
  - `.rel-empty__cta`
  - `data-nav="registro"`
- Cards:
  - `.rel-record`
  - `.rel-record[data-id]`
  - `.rel-record__head`
  - `.rel-record__title`
  - `.rel-record__meta`
  - `.rel-record__toggle`
  - `.rel-record__details`
  - `.rel-record__section`
  - `.rel-spec`
  - `.rel-status`
  - `.rel-tipo-icon`
  - `.rel-sigthumb`
- Acoes delegadas:
  - `data-rel-action="rel-toggle-card"`
  - `data-action="rel-view-signature"`
  - `data-action="export-pdf"`
  - `data-action="whatsapp-export"`
  - `data-registro-id`
- Blocos auxiliares:
  - `.rel-corretivas-banner`
  - `.rel-proximas__item`
  - `.card-actions`

## Fora de escopo

- PDF/share real, storage, WhatsApp real, assinatura real, PMOC real, quota
  real, router, billing, Supabase/RLS ou app-v2.
- Remocao de outras ilhas React ainda usadas por Historico, Registro,
  Clientes ou Equipamentos.

## Validacao planejada/executada

```bash
npm run format
npm test -- src/__tests__/relatorioLegacyCards.test.js src/__tests__/relatorioCardsLegacyHandlers.test.js src/__tests__/relatorioNavigationLegacyContracts.test.js src/__tests__/relatorioExportPmocLegacyHandlers.test.js src/__tests__/reportExportContracts.test.js --run
npm run build
npm run check
git diff --check
```

Observacao: `npm run build` e `npm run check` podem manter o warning conhecido
de chunk acima de 500 kB e os ruidos conhecidos de testes com jsdom/navigation,
Supabase/GoTrue, storage offline e telemetria.
