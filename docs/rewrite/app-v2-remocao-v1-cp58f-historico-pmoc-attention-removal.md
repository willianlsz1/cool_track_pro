# CP-58F - Remocao da superficie PMOC no Historico legado

## Objetivo

Remover do Historico legado a dependencia de `core/clientePmoc.js`, mantendo
PMOC v1 apenas como referencia funcional e evitando reaproveitamento no app-v2.

## Escopo executado

- Removido o import de `buildClientePmocDetails` em `src/ui/views/historico.js`.
- Removida a criacao de itens de atencao `pmoc-*` no Historico legado.
- Removida a injecao `buildClientePmocDetails` do view model e dos helpers de
  render do Historico.
- Removidos mocks test-only de `core/clientePmoc.js` dos testes de Historico.
- Adicionado contrato para bloquear retorno da superficie PMOC no Historico.

## Fora do escopo

- Checklist PMOC no Registro.
- Contexto preventiva/PMOC em Equipamentos.
- `src/core/clientePmoc.js`, `src/core/pmocProgress.js` e `src/domain/pmoc/**`.
- Supabase, migrations, RLS, storage, PDF/share, billing e app-v2 runtime.

## Validacao esperada

- Testes focados de Historico.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
