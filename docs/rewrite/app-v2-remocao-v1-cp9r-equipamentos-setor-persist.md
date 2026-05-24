# app-v2 - Remocao v1 CP-9r: persistencia de Setores

## Objetivo

Remover `setorPersist` de `src/features/equipamentos/**` e co-localizar a
persistencia local de Setores com a view legada de Equipamentos, sem alterar o
CRUD de equipamentos.

## Escopo executado

- Movido `src/features/equipamentos/setor/setorPersist.js` para
  `src/ui/views/equipamentos/setor/setorPersist.js`.
- Movido o teste correspondente para
  `src/__tests__/equipamentosSetorPersist.test.js`.
- Ajustado o import da view de Equipamentos.
- Ajustado o mock de `equipamentosSaveEquip.test.js`.
- Ajustado o import dinamico de `core/modal.js` relativo ao novo local.
- Atualizados contratos e documentos funcionais que apontavam para o caminho
  antigo.

## Fora de escopo

- Nao foram alterados CRUD de equipamentos, storage real, PDF/share, WhatsApp,
  auth, Supabase/RLS, PMOC real, billing ou regras comerciais.

## Validacao esperada

```bash
npm test -- src/__tests__/equipamentosSetorPersist.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Continuidade

O grupo `src/features/equipamentos/crud/**` foi tratado depois no CP-9s.
