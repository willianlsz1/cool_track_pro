# app-v2 remocao v1 - CP-3t historico filters React

## Objetivo

Remover a ilha React dos filtros do Historico legado sem alterar timeline,
PDF/share, WhatsApp, storage, router, billing, pricing ou app-v2.

## Alteracoes

- Substituido `src/react/entrypoints/historicoFiltersIsland.jsx` por renderer DOM
  em `src/ui/views/historico/filtersRenderer.js`.
- Removido `src/react/pages/HistoricoFilters.jsx`.
- `src/ui/views/historico.js` agora monta os filtros por import estatico local.
- Teste da ilha foi convertido para `historicoFiltersRenderer.test.js`.
- Mocks dos contratos de Historico foram atualizados para o novo renderer DOM.

## Contratos preservados

- Root publico: `#hist-filters-root`.
- IDs publicos: `#hist-sticky-header`, `#hist-busca`, `#hist-setor`,
  `#hist-equip`, `#hist-filters-trigger`, `#hist-filters-count`,
  `#hist-quickfilters-slot`, `#hist-active-chips-slot` e `#hist-count`.
- Classes `hist-*` usadas por CSS e testes.
- `data-hist-action` de periodo, tipo, sheet de filtros e limpeza.
- Interface assincrona do fluxo principal continua normalizada por
  `normalizeHistoricoMountResult`.

## Fora de escopo

- Timeline do Historico.
- Checklist de registro.
- PDF/share e WhatsApp.
- Storage, router, Supabase/RLS, billing e pricing.
- Limpeza dos documentos historicos de migracao que apenas citam a antiga ilha.

## Validacao

- RED inicial: `npm test -- src\__tests__\historicoFiltersRenderer.test.js --run`
  falhou porque o renderer DOM ainda nao existia.
- Foco executado apos implementacao:
  `npm test -- src\__tests__\historicoFiltersRenderer.test.js src\__tests__\historicoFilters.contract.test.js src\__tests__\historicoFiltersSheetIntegration.test.js src\__tests__\historicoRegistroIntegration.contract.test.js src\features\historico\__tests__\render\renderHelpers.test.js --run`.

## Riscos remanescentes

- O renderer usa `innerHTML` controlado localmente; conteudo dinamico passa por
  escaping e o teste de XSS cobre valores maliciosos em busca, selects e chips.
- Documentos historicos em `docs/migration/` ainda mencionam a ilha antiga como
  historico de migracao, nao como runtime atual.
