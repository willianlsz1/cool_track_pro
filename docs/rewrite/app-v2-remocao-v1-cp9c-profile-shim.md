# app-v2 - Remocao v1 CP-9c: shim legado de Profile

## Objetivo

Remover o shim `src/features/profile.js`, que apenas reexportava
`src/core/profile.js`, reduzindo um acoplamento artificial entre codigo legado e
a camada `features`.

## Alterado

- Imports runtime que apontavam para `src/features/profile.js` agora apontam
  diretamente para `src/core/profile.js`.
- Mocks de testes legados foram atualizados para o mesmo caminho real.
- `src/features/profile.js` foi removido.
- `legacyV1RemovalContracts` passou a travar a ausencia do shim.

## Nao alterado

- API publica de `Profile`.
- Implementacao de `src/core/profile.js`.
- Storage, autenticacao, PDF/share, WhatsApp, PMOC, billing, pricing,
  Supabase/RLS ou router.
- Fluxos visuais e comportamentais do legado/v1.

## Risco

Baixo. O arquivo removido era apenas:

```js
export { Profile } from '../core/profile.js';
```

A mudanca substitui o caminho intermediario pelo modulo real sem alterar o
objeto exportado.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/profile.userScope.test.js src/__tests__/profileModal.test.js src/__tests__/reportExportContracts.test.js src/__tests__/whatsappExport.test.js --run
npm run format
npm run build
npm run check
git diff --check
```
