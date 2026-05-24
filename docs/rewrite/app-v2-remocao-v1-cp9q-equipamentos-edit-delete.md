# app-v2 - Remocao v1 CP-9q: edicao e delecao de Equipamentos

## Objetivo

Remover os helpers de edicao e delecao de equipamento de
`src/features/equipamentos/**` e co-localiza-los com a view legada de
Equipamentos, sem alterar storage, CRUD ou comportamento operacional.

## Escopo executado

- Movidos para `src/ui/views/equipamentos/ui/**`:
  - `openEditEquip.js`;
  - `deleteEquip.js`.
- Testes correspondentes foram movidos para `src/__tests__`:
  - `equipamentosOpenEditEquip.test.js`;
  - `equipamentosDeleteEquip.test.js`.
- Imports da view e contrato de remocao v1 foram atualizados.
- Corrigidas mensagens corrompidas nos arquivos movidos:
  - `Nao foi possivel abrir o modal de edicao`;
  - `Equipamento removido, mas nao foi possivel fechar o modal`;
  - `Salvar alteracoes`.

## Fora de escopo

- Nao foram alterados CRUD, `setorPersist`, storage real, PDF/share, WhatsApp,
  auth, Supabase/RLS, PMOC real, billing ou regras comerciais.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosOpenEditEquip.test.js src/__tests__/equipamentosDeleteEquip.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Risco remanescente

Ainda restam em `src/features/equipamentos/**` os recortes com persistencia e
mutacao de dados: CRUD e `setorPersist`. Esses devem continuar em checkpoints
proprios por tocarem storage/state e contratos mais sensiveis.
