# app-v2 - Remocao v1 CP-57L - Registro photos model

## Objetivo

Remover o helper orfao `src/ui/viewModels/registroPhotosModel.js` depois da
aposentadoria do runtime legado de fotos do registro.

## Escopo

- Remove o arquivo `src/ui/viewModels/registroPhotosModel.js`.
- Remove mocks test-only desse helper em testes de registro.
- Ajusta o contrato de seletores de registro para nao ler o helper removido.
- Amplia o contrato de remocao v1 para bloquear retorno desse helper/mocks.

## Fora de escopo

- Storage real.
- Supabase/RLS.
- Bucket `registro-fotos`.
- PDF/share.
- WhatsApp.
- App-v2 runtime.

## Validacao

- `rg -n "isSafeRegistroPhotoSrc|registroPhotosModel" src`
- Testes focados de contratos/registro afetados.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`

## Risco

Baixo. O helper nao tinha import em runtime e era mantido apenas por contratos e
mocks de teste apos os CPs de remocao do runtime de fotos.
