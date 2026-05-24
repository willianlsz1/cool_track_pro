# app-v2 remocao v1 - CP-3w registro checklist React

## Objetivo

Remover a ilha React do checklist PMOC/NBR 13971 do Registro mantendo os
contratos DOM usados pelos handlers legados de status, observacao, medicao,
resumo, save, PDF/WhatsApp e pos-save.

## Alteracoes

- Substituido `src/react/entrypoints/registroChecklistIsland.jsx` por renderer
  DOM em `src/ui/views/registro/checklistRenderer.js`.
- Removido `src/react/pages/RegistroChecklist.jsx`.
- `src/ui/views/registro.js` agora monta o checklist por import local estatico.
- Teste da ilha foi convertido para `registroChecklistRenderer.test.js`.
- Testes de Registro/PMOC foram atualizados para validar o dataset DOM
  `registroChecklistMounted`.

## Contratos preservados

- Root publico: `#r-checklist-body`.
- Classes publicas principais: `r-checklist__body`, `r-checklist__intro`,
  `r-checklist__legend`, `r-checklist__group`, `r-checklist__row`,
  `r-checklist__status`, `r-checklist__measure-input` e `r-checklist__obs`.
- Atributos publicos:
  - `data-action="r-checklist-set"`
  - `data-action="r-checklist-obs"`
  - `data-action="r-checklist-measure"`
  - `data-item`
  - `data-item-id`
  - `data-status`
  - `data-unit`
  - `aria-pressed`

## Fora de escopo

- PMOC real alem das regras ja existentes.
- Storage, router, Supabase/RLS, billing e pricing.
- PDF/share real e WhatsApp real.
- Redesign visual de Registro.
- Remocao dos utilitarios React remanescentes sem runtime.

## Validacao

- RED inicial: `npm test -- src/__tests__/registroChecklistIsland.test.jsx --run`
  falhou porque `checklistRenderer.js` ainda nao existia.
- Foco executado apos implementacao:
  `npm test -- src/__tests__/registroChecklistRenderer.test.js src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/registroChecklistHandlers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroPostSaveLegacyFlow.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/registroPdfWhatsappLegacyContracts.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/registroLegacySignatureRender.test.js src/__tests__/contracts/registroSelectors.test.js src/features/registro/__tests__/checklist/pmocChecklist.test.js src/__tests__/registroMateriaisToggle.test.js --run`.

## Riscos remanescentes

- O renderer usa `innerHTML` controlado localmente; conteudo dinamico passa por
  escaping e testes cobrem texto malicioso.
- O diretorio `src/react/` ainda contem utilitarios/testes sem runtime; deve ser
  removido em checkpoint proprio.
