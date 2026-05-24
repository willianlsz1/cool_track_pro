# app-v2 remocao v1 - CP-9g equipamentos bridges

## Objetivo

Remover o subgrupo `src/features/equipamentos/bridges/**` da camada `features`,
co-localizando as bridges de mount/unmount com a view legada de Equipamentos.

## Alterado

- `headerBridge.js`, `listBridge.js` e `renderPlan.js` foram movidos para
  `src/ui/views/equipamentos/bridges/**`.
- Testes diretos das bridges foram movidos para
  `src/__tests__/equipamentosBridges/**`.
- Imports da view, testes e mocks foram atualizados para o novo caminho.
- `legacyV1RemovalContracts` passou a bloquear o retorno de
  `src/features/equipamentos/bridges`.

## Fora do escopo

- CRUD de equipamentos, persistencia, storage, fotos, nameplate, setores e
  post-actions.
- Registro, PDF/share, WhatsApp, PMOC, billing/pricing, Supabase/RLS ou schema.
- Remocao da view/rota legada de Equipamentos.

## Risco

Baixo/medio. As bridges ainda acionam renderizadores e plano operacional, mas o
lote ficou restrito a mudanca de local/imports. O risco principal e import
quebrado ou mock desatualizado, coberto por testes focados e build.

## Validacao esperada

- `npm test -- src/__tests__/equipamentosBridges src/__tests__/equipamentosHeaderBridge.test.js src/__tests__/equipamentosLegacyHeaderHandlers.test.js src/__tests__/equipamentosListRenderer.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
