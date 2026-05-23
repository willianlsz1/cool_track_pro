# App-v2 Data Port Attachment CP-N

## Escopo

- Migrar a acao local de adicionar foto/anexo placeholder no detalhe do equipamento
  para usar `AppV2DataPort.saveEquipmentAttachment` quando `dataPort` for injetado
  no `AppV2Shell`.
- Preservar o fallback mock/local atual quando nao houver `dataPort`.
- Manter o anexo como placeholder local, sem arquivo real, upload, URL, storage
  real ou Supabase.

## Contratos

- `AppV2Shell.addPlaceholderAttachmentDraft` continua calculando `equipment`,
  `attachmentCount` e `nextIndex` a partir de `appState.equipamentos`.
- O payload preservado e:
  - `id`: `foto-${equipmentId}-${nextIndex}`
  - `kind`: `foto`
  - `label`: `Foto principal local` no primeiro anexo, senao
    `Foto local ${nextIndex}`
  - `source`: `placeholder`
  - `createdAt`: `appState.today`
  - `cover`: `nextIndex === 1`
- Quando `dataPort` existe, o shell chama
  `dataPort.saveEquipmentAttachment(equipmentId, attachment)`, aplica
  `preserveCurrentServiceDraft(appState, nextState)` e retorna `null`.
- Quando `dataPort` rejeita, o erro volta para a UI com a mensagem do `Error` ou
  fallback `Nao foi possivel adicionar a foto.`.
- `EquipmentDetail.onAddPlaceholderAttachment` aceita resultado sincrono ou
  assincrono e so limpa o erro apos sucesso.

## Nao Alterado

- Nenhum fluxo do app legado/v1.
- Nenhum upload real, storage real, Supabase/RLS, WhatsApp, billing, PDF/share ou
  router.
- Nenhum contrato de `package.json`, Vite, ESLint ou TypeScript.
- Nenhum limite funcional de anexos, validacao de payload ou regra de capa em
  `equipmentActions`.

## Validacao Planejada

- `npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run build`
- `npm run check`
- `git diff --check`

## Proximo CP Recomendado

- Continuar a migracao incremental de acoes mockadas do detalhe/listagem de
  equipamentos para `AppV2DataPort`, mantendo fallback local e testes focados por
  acao.
