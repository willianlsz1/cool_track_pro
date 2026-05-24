# app-v2 - Remocao v1 CP-58B - Contrato de drenagem de `registro-fotos`

## Objetivo

Adicionar uma trava de teste para impedir que o runtime client-side volte a
escrever ou depender diretamente do bucket legado `registro-fotos`.

## Escopo

- Amplia `legacyV1RemovalContracts.test.js`.
- Garante que arquivos runtime em `src/`, exceto testes, nao contenham
  `registro-fotos`.

## Fora de escopo

- Edge Function `delete-user-account`.
- Migrations historicas.
- Policies Supabase/RLS.
- Bucket real.
- Nova arquitetura de fotos/anexos.

## Decisao

`registro-fotos` permanece como legado em drenagem:

- permitido em delete-user-account enquanto puder existir dado antigo;
- bloqueado para retorno em runtime client-side;
- remocao final depende de etapa propria de storage/Supabase.

## Validacao

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
