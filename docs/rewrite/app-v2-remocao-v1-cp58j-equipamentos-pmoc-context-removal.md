# CP-58J - Remocao do contexto PMOC no detalhe de Equipamentos

## Objetivo

Remover a superficie PMOC do detalhe legado de Equipamentos sem perder o atalho
operacional de preventiva.

## Escopo executado

- Trocado `pmocContext` por `preventiveContext` no model do detalhe.
- Trocado o bloco visual `eq-pmoc-context` por `eq-preventive-context`.
- Removida a dependencia do detalhe de Equipamentos em `domain/pmoc/serviceType`.
- Mantido apenas o reconhecimento de servicos preventivos/limpeza/higienizacao
  para o contexto local de preventiva.
- Atualizados testes dedicados e contrato de remocao v1.

## Fora do escopo

- Checklist PMOC no Registro.
- `src/domain/pmoc/checklistTemplates.js` e `src/domain/pmoc/serviceType.js`.
- Supabase, migrations, RLS, storage, PDF/share, billing e app-v2 runtime.

## Validacao esperada

- Testes focados de detalhe de Equipamentos.
- Scan de referencias PMOC no detalhe de Equipamentos.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
