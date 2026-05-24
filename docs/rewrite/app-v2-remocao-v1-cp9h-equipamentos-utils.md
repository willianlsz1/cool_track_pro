# app-v2 remocao v1 - CP-9h equipamentos utils

## Objetivo

Remover o subgrupo `src/features/equipamentos/utils/**` da camada `features`,
co-localizando helpers de UI/view-model com a view legada de Equipamentos.

## Alterado

- `detail.js` e `viewModels.js` foram movidos para
  `src/ui/views/equipamentos/utils/**`.
- Testes diretos dos helpers foram movidos para
  `src/__tests__/equipamentosUtils/**`.
- Imports da view, renderizador de detail, testes e mocks foram atualizados para
  o novo caminho.
- `legacyV1RemovalContracts` passou a bloquear o retorno de
  `src/features/equipamentos/utils`.

## Fora do escopo

- CRUD de equipamentos, persistencia, storage, fotos, nameplate, setores e
  post-actions.
- Registro, PDF/share, WhatsApp, PMOC, billing/pricing, Supabase/RLS ou schema.
- Remocao da view/rota legada de Equipamentos.

## Risco

Baixo/medio. `viewModels.js` ainda depende de regras puras e modelos da view,
mas o lote nao altera comportamento; apenas remove o local inadequado em
`features`. O risco principal e import quebrado ou mock desatualizado.

## Validacao esperada

- `npm test -- src/__tests__/equipamentosUtils src/features/equipamentos/__tests__/ui/detail.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
