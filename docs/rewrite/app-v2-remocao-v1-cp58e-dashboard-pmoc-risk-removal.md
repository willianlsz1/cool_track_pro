# CP-58E - Remocao da superficie PMOC no Dashboard legado

## Objetivo

Remover do Dashboard legado a dependencia do resumo PMOC de cliente, mantendo o
v1 apenas como referencia funcional para o app-v2.

## Escopo executado

- Removido o import de `buildClientePmocDetails` em `src/ui/views/dashboard.js`.
- Removido o bloco que calculava clientes em risco por status PMOC.
- O card legado passa a exibir estado neutro de carteira, sem acao PMOC.
- Removida a prioridade especial por texto `PMOC` em
  `selectNextDashboardAction`.
- Ajustados testes de Dashboard que mockavam `core/clientePmoc.js`.
- Adicionado contrato para bloquear retorno da superficie PMOC no Dashboard.

## Fora do escopo

- Registro/checklist PMOC.
- Equipamentos preventiva/PMOC.
- Historico PMOC.
- `src/core/clientePmoc.js`, `src/core/pmocProgress.js` e `src/domain/pmoc/**`.
- Supabase, migrations, RLS, storage, PDF/share, billing e app-v2 runtime.

## Validacao esperada

- Testes focados de Dashboard.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
