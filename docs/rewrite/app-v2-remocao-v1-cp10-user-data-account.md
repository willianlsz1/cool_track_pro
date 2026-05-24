# app-v2 - CP-10 - User data account handlers

## Escopo

Remover `src/features/userData.js` sem alterar comportamento de exportacao de
dados, exclusao de conta, auth, Supabase Edge Functions, storage, router,
billing, pricing ou app-v2.

## Mudancas

- Movido `src/features/userData.js` para `src/ui/account/userData.js`.
- Atualizados imports em:
  - `src/ui/views/conta.js`
  - `src/ui/components/accountModal.js`
  - `src/__tests__/userData.test.js`
- Adicionado contrato para impedir retorno de `src/features/userData.js`.

## Contratos preservados

- `exportUserData()`.
- `deleteUserAccount()`.
- `refreshSession()` com fallback para token cacheado ainda valido.
- Chamadas POST para:
  - `/functions/v1/export-user-data`
  - `/functions/v1/delete-user-account`
- Download por `URL.createObjectURL`.
- `signOut({ scope: 'local' })` apos exclusao bem-sucedida.
- `handleError` e mensagens de falha existentes.

## Fora de escopo

- Alterar Edge Functions, RLS, auth, storage, payloads, headers ou tokens.
- Alterar UX de Conta, modais, textos ou fluxo destrutivo.
- Remover `src/features` como diretorio fisico vazio.

## Risco remanescente

A area continua sensivel por envolver LGPD, auth e Edge Functions. Este
checkpoint foi limitado a move/import paths, com cobertura pelos testes
existentes de `userData`.
