# app-v2 - CP-58D remocao do painel PMOC em Clientes v1

## Objetivo

Remover a superficie PMOC da tela legada de Clientes, mantendo o v1 apenas como
referencia funcional para uma futura implementacao app-v2-native.

## Escopo executado

- Removido `src/ui/components/clientePmocPanel.js`.
- Removido o teste dedicado do painel PMOC de Clientes.
- Removidas as acoes `pmoc-focus` e `open-pmoc-panel` dos contratos de Clientes.
- Removidos o card/resumo PMOC e o botao PMOC do renderer legado de Clientes.
- Removido o calculo `pmocSummary`/`pmocOverdueCount` do view model de Clientes.
- Removida a dependencia de Clientes em `core/pmocProgress` e
  `domain/maintenance` para fins PMOC.

## Referencias boas do v1 para recriacao futura

Nao reutilizar codigo. Como referencia de produto, o v2 pode preservar:

- PMOC visivel no contexto do cliente.
- Status agregado por cliente derivado dos equipamentos.
- Acoes que levam direto ao registro de servico quando houver pendencia.

## Fora de escopo

- Remover `src/core/clientePmoc.js`.
- Remover `src/core/pmocProgress.js`.
- Remover checklist PMOC de Registro.
- Remover PMOC de Dashboard/Historico.
- Qualquer alteracao em Supabase, migrations, storage, RLS ou buckets.

## Validacao esperada

- Testes focados de Clientes e contratos de remocao v1.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
