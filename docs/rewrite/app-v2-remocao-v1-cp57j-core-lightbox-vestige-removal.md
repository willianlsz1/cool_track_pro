# CP-57J - Remocao de vestigios lightbox em core modal/events

## Objetivo

Remover os ultimos tratamentos runtime diretos de `#lightbox` no core depois da
remocao do componente legado de fotos.

## Escopo

- `src/core/modal.js`
- `src/core/events.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## Alteracoes

- Removido o listener especial de clique no overlay `#lightbox` em
  `Modal.init()`.
- Removido o listener global de Escape que fechava `#lightbox`.
- Removido o import de `Utils` em `events.js`, que existia apenas para esse
  vestigio.
- Ampliado o contrato de remocao para impedir `lightbox` em router, modal e
  events.

## Fora de escopo

- Modal generico, `CustomConfirm` e `attachDialogA11y`.
- Router e sincronizacao de history ja tratados no CP-57I.
- Storage real de fotos, bucket, policies, migrations ou Supabase/RLS.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
