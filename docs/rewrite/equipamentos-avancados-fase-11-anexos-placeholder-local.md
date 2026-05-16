# Equipamentos avancados fase 11 - anexos placeholder local

## Objetivo

Implementar somente anexos/fotos placeholder mock/local no app-v2 usando o
contrato da fase 10, com no maximo 3 itens por equipamento, exibicao no
card/detalhe e preservacao em editar, arquivar e desarquivar.

## Escopo executado

- Adicionado contrato local `EquipmentAttachment` em `Equipamento`.
- Criada action pura `saveEquipmentAttachment`.
- Adicionado seed mock de foto local para equipamento existente.
- Card de equipamento passou a exibir indicio de capa/anexos locais.
- Detalhe passou a exibir lista de anexos locais e acao para adicionar
  placeholder.
- Testes cobrem action, view model e shell.

## Contrato implementado

O contrato inicial aceita apenas:

- `id`;
- `kind`: `foto` ou `documento`;
- `label`;
- `source`: `mock` ou `placeholder`;
- `createdAt`;
- `cover` opcional.

A action bloqueia metadados que indiquem storage/arquivo real, como `file`,
`blob`, `url`, `path`, `dataUrl`, `signedUrl`, `bucket` e `userId`.

## Anti-escopo preservado

- Input real de arquivo.
- Camera, upload, compressao, lightbox ou download.
- Storage real, bucket, signed URL, fila offline, `localStorage` e IndexedDB.
- Supabase/RLS e migrations.
- Billing real, assinatura real, quota, pricing e gates reais.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Router novo, aba global nova, CSS legado ou redesign geral.

## Validacao executada

- `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2ShellEquipmentAttachments.test.tsx --run`
  passou com 33 testes.
- `npm run format` passou.
- `npm run build` passou com warnings Vite conhecidos de chunks/static+dynamic.
- `npm run check` passou com o warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check` passou.

## Riscos remanescentes

- A etapa ainda nao prova upload, permissao, RLS, billing ou persistencia real.
- O limite de 3 itens foi mantido por paridade com fotos do v1 e pode precisar
  nova decisao quando documentos reais entrarem.
- A UI e propositalmente simples; refinamento visual amplo deve esperar etapa
  de Design System/UI.

## Proximo checkpoint recomendado

Equipamentos avancados fase 12: reauditar a area de Equipamentos apos anexos
placeholder locais, atualizar a porcentagem/estado de paridade UX v1-v2 e
decidir documentalmente se o restante deve ir para design, backlog sensivel ou
etapas proprias, sem implementar storage real, Supabase/RLS, migrations, PMOC,
PDF/share, billing real, assinatura real ou redesign geral.
