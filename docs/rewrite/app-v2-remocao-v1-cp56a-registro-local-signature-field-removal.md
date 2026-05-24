# app-v2 - Remocao v1 CP56A - Registro local signature field removal

## Objetivo

Remover o campo legado `assinatura` do payload local de criacao do Registro,
sem tocar ainda em storage/sync/schema.

## Escopo

- Remover `assinaturaPayload` de `buildRegistroCreateRecord`.
- Parar de passar `assinaturaPayload: false` em `src/ui/views/registro.js`.
- Atualizar testes de Registro para esperar ausencia de `assinatura`, nao
  `assinatura: false`.
- Travar a ausencia em `legacyV1RemovalContracts`.

## Fora do escopo

- Normalizers e sync remoto.
- Supabase/RLS/migrations.
- Assinatura de orcamento.
- Billing/features.
- Fotos, PDF/share, PMOC e router.

## Risco

Medio/baixo. A alteracao muda o shape local criado pelo Registro, mas a
normalizacao/sync ainda sera tratada em CP separado para evitar misturar areas
sensiveis.

## Validacao esperada

```bash
npm test -- src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/exploratory/signature-payload.test.js src/__tests__/registroSavePersistenceHelpers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
```
