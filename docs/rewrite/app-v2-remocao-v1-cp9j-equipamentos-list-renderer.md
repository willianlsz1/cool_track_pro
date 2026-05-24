# app-v2 remocao v1 - CP-9j equipamentos list renderer

## Objetivo

Remover `src/features/equipamentos/ui/listRenderer.js` por co-localizacao com a
view legada de Equipamentos, sem alterar renderizacao, contratos DOM, storage,
CRUD, setores, fotos, PDF/share, WhatsApp, PMOC ou billing.

## Escopo executado

- `src/features/equipamentos/ui/listRenderer.js` foi movido para
  `src/ui/views/equipamentos/ui/listRenderer.js`.
- `src/ui/views/equipamentos/bridges/listBridge.js` passou a importar o renderer
  pelo caminho co-localizado.
- Testes de renderer, bridge e contexto de filtros foram atualizados para o novo
  caminho.
- `legacyV1RemovalContracts.test.js` passou a proteger a ausencia do renderer no
  namespace `src/features`.

## Fora de escopo

- Nao mover o restante de `src/features/equipamentos/ui/**`.
- Nao alterar CRUD, persistencia, setores, fotos ou dados de placa.
- Nao alterar PDF/share, WhatsApp, PMOC, autenticacao, Supabase/RLS ou billing.

## Risco e controle

Risco baixo/medio. O arquivo e renderer DOM da view legada e preserva contratos
publicos de HTML/acoes. O checkpoint ficou restrito a movimento de arquivo,
ajuste de imports e testes focados.
