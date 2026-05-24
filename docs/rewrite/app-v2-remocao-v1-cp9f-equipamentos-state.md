# app-v2 remocao v1 - CP-9f equipamentos state

## Objetivo

Remover o subgrupo `src/features/equipamentos/state/**` da camada `features`,
co-localizando o estado de UI/cache com a view legada de Equipamentos.

## Alterado

- `bridgeState.js`, `editingState.js` e `renderPlanState.js` foram movidos para
  `src/ui/views/equipamentos/state/**`.
- Testes puros desse estado foram movidos para
  `src/__tests__/equipamentosState/**`.
- Imports da view, bridges e testes foram atualizados para o novo caminho.
- `legacyV1RemovalContracts` passou a bloquear o retorno de
  `src/features/equipamentos/state`.

## Fora do escopo

- CRUD de equipamentos, persistencia, storage, fotos, nameplate, setores e
  post-actions.
- Registro, PDF/share, WhatsApp, PMOC, billing/pricing, Supabase/RLS ou schema.
- Remocao da view/rota legada de Equipamentos.

## Risco

Baixo. Os modulos movidos mantem apenas estado em memoria da view legada e nao
alteram runtime, storage ou contratos publicos. O risco principal e import
quebrado, coberto por testes focados e build.

## Validacao esperada

- `npm test -- src/__tests__/equipamentosState src/features/equipamentos/__tests__/bridges src/__tests__/equipamentosSaveEquip.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
