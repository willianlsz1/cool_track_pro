# app-v2 remocao v1 - CP-3u historico timeline React

## Objetivo

Remover a ilha React da timeline do Historico legado mantendo os contratos DOM
usados por filtros, edicao/exclusao, fotos, assinatura, PDF e WhatsApp.

## Alteracoes

- Substituido `src/react/entrypoints/historicoTimelineIsland.jsx` por renderer
  DOM em `src/ui/views/historico/timelineRenderer.js`.
- Removido `src/react/pages/HistoricoTimeline.jsx`.
- Removido `src/react/components/CardActions.jsx`, agora incorporado no renderer
  DOM da timeline.
- `src/ui/views/historico.js` agora monta a timeline por import local estatico.
- Teste da ilha foi convertido para `historicoTimelineRenderer.test.js`.
- Testes de contratos de Historico/PDF/WhatsApp foram atualizados para o novo
  renderer DOM.

## Contratos preservados

- Root publico: `#timeline`.
- Classes publicas: `hist-op-summary`, `hist-attention`, `hist-day-group`,
  `timeline`, `timeline__item`, `timeline__item--latest`, `timeline__dot`,
  `timeline__item__service`, `timeline__item__equipment`,
  `timeline__item__photos`, `hist-signature-preview`, `hist-item-actions`,
  `card-actions` e `empty-state`.
- Atributos publicos:
  - `data-reg-id`
  - `data-id`
  - `data-equip-id`
  - `data-photo-url`
  - `data-action="edit-reg"`
  - `data-action="delete-reg"`
  - `data-action="export-pdf"`
  - `data-action="whatsapp-export"`
  - `data-registro-id`
  - `data-hist-action="toggle-card-menu"`
  - `data-hist-action="hist-filter-equip"`
  - `data-hist-action="hist-open-photo"`
  - `data-hist-action="hist-view-signature"`

## Fora de escopo

- Handlers reais de PDF/share e WhatsApp.
- Registro/checklist/PMOC.
- Storage, router, Supabase/RLS, billing e pricing.
- Reescrita visual da timeline.

## Validacao

- RED inicial: `npm test -- src\__tests__\historicoTimelineRenderer.test.js --run`
  falhou porque o renderer DOM ainda nao existia.
- Foco executado apos implementacao:
  `npm test -- src\__tests__\historicoTimelineRenderer.test.js src\__tests__\criticalFlow.contract.test.js src\__tests__\historicoCardActions.contract.test.js src\__tests__\historicoPdfWhatsappIntegration.contract.test.js src\__tests__\historicoFiltersLegacyRender.test.js src\__tests__\historicoFilters.contract.test.js src\__tests__\historicoFiltersSheetIntegration.test.js src\__tests__\historicoRegistroIntegration.contract.test.js src\features\historico\__tests__\render\renderHelpers.test.js --run`.

## Riscos remanescentes

- O renderer usa `innerHTML` controlado localmente; conteudo dinamico passa por
  escaping e testes cobrem texto malicioso e URLs de midia inseguras.
- A logica real de export/share nao foi alterada; a validacao cobre somente os
  contratos DOM usados pelos handlers existentes.
