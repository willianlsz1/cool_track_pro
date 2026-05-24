# app-v2 remocao v1 - CP-9i equipamentos nameplate

## Objetivo

Remover o subgrupo `src/features/equipamentos/nameplate/**` por co-localizacao
do helper com a view legada de Equipamentos, sem alterar comportamento de
coleta, validacao, storage, upload, PDF/share, WhatsApp, PMOC ou billing.

## Escopo executado

- `src/features/equipamentos/nameplate/dadosPlaca.js` foi movido para
  `src/ui/views/equipamentos/nameplate/dadosPlaca.js`.
- `src/features/equipamentos/__tests__/nameplate/dadosPlaca.test.js` foi movido
  para `src/__tests__/equipamentosNameplate/dadosPlaca.test.js`.
- `src/ui/views/equipamentos.js` passou a importar o helper pelo caminho
  co-localizado na view.
- `src/__tests__/legacyV1RemovalContracts.test.js` passou a proteger a ausencia
  de `src/features/equipamentos/nameplate`.

## Fora de escopo

- Nao alterar captura real de dados de placa.
- Nao alterar storage, upload de fotos, CRUD de equipamentos ou setores.
- Nao alterar PDF/share, WhatsApp, PMOC, autenticacao, Supabase/RLS ou billing.
- Nao remover a view legada de Equipamentos.

## Risco e controle

Risco baixo/medio. O helper ainda toca feedback visual (`Toast`) e foco/select
de input, entao o checkpoint ficou restrito a movimento de arquivo e ajuste de
imports.

Controle esperado:

- teste direto do helper de nameplate;
- teste de save de equipamentos que consome o helper;
- contrato de ausencia em `legacyV1RemovalContracts.test.js`;
- validacao geral do projeto.
