# CP-58H - Remocao do progresso PMOC core legado

## Objetivo

Remover o helper legado `core/pmocProgress.js` depois que as superficies de PMOC
por cliente deixaram de consumir resumo anual de progresso.

## Escopo executado

- Removido `src/core/pmocProgress.js`.
- Removido o teste dedicado `src/__tests__/pmocProgress.test.js`.
- Adicionado contrato para bloquear a volta de `getPmocSummaryForCliente`.

## Fora do escopo

- Checklist PMOC no Registro.
- Contexto preventiva/PMOC em Equipamentos.
- `src/domain/pmoc/**`.
- Supabase, migrations, RLS, storage, PDF/share, billing e app-v2 runtime.

## Validacao esperada

- Scan de referencias para `pmocProgress` e `getPmocSummaryForCliente`.
- Teste focado de contrato de remocao v1.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
