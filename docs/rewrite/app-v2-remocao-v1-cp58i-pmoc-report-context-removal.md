# CP-58I - Remocao do contexto PMOC de relatorio legado

## Objetivo

Remover o helper legado de resumo PMOC/preventivo para relatorio depois da
aposentadoria das superficies v1 de PDF/share/relatorio PMOC.

## Escopo executado

- Removido `src/domain/pmoc/reportContext.js`.
- Removido o teste dedicado `src/__tests__/pmocReportContext.test.js`.
- Adicionado contrato para bloquear a volta de
  `buildContextualPmocReportSummary`.

## Fora do escopo

- Checklist PMOC no Registro.
- Contexto preventiva/PMOC em Equipamentos.
- `src/domain/pmoc/checklistTemplates.js` e `src/domain/pmoc/serviceType.js`.
- Supabase, migrations, RLS, storage, PDF/share, billing e app-v2 runtime.

## Validacao esperada

- Scan de referencias para `buildContextualPmocReportSummary` e
  `pmoc/reportContext`.
- Teste focado de contrato de remocao v1.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
