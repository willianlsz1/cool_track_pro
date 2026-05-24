# app-v2 - CP-9z - Registro save post-save/share

## Escopo

Remover o ultimo cluster `src/features/registro/save/**` sem alterar runtime,
PDF/share real, WhatsApp real, storage, router, billing ou app-v2.

## Mudancas

- Movido `src/features/registro/save/postSave.js` para
  `src/ui/views/registro/save/postSave.js`.
- Movido `src/features/registro/save/reportShare.js` para
  `src/ui/views/registro/save/reportShare.js`.
- Movidos os testes para:
  - `src/__tests__/registroSavePostSaveHelpers.test.js`
  - `src/__tests__/registroSaveReportShareHelpers.test.js`
- Atualizado `src/ui/views/registro.js` para importar os helpers pelo caminho
  co-localizado na view legada de Registro.
- Atualizado contrato de remocao para impedir regressao dos caminhos antigos em
  `src/features/registro/save/**`.

## Contratos preservados

- Filtros `{ equipId, registroId }` para PDF/WhatsApp.
- Fallback para `goTo('relatorio', { equipId, intent, registroId })`.
- Toast rico de pos-salvamento com CTAs de PDF/WhatsApp.
- Fluxo de edicao para `historico`.
- Prompt de proxima preventiva apos salvar.
- Dependencias concretas continuam injetadas por DI.

## Fora de escopo

- Alterar `exportPdfFlow`, `shareWhatsAppFlow`, quota, PDF/share ou WhatsApp.
- Alterar router, storage, auth, Supabase/RLS, billing ou app-v2.
- Remover `src/features/userData.js`.

## Risco remanescente

`src/features/userData.js` permanece como area sensivel separada porque cruza
exportacao/exclusao de dados do usuario, auth, Edge Functions e modais de conta.
