# CP-57I - Remocao de vestigio lightbox no router

## Objetivo

Remover o tratamento especial do router legado para `#lightbox` depois da
aposentadoria do runtime de fotos do v1.

## Escopo

- `src/core/router.js`
- `src/__tests__/router.test.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## Alteracoes

- Removido o fechamento dedicado de `#lightbox` em `closeTopBlockingLayer`.
- Removida a contagem dedicada de `#lightbox` em `countOpenBlockingLayers`.
- Mantida a cobertura de back/popstate com camadas bloqueantes genericas via
  `registerBlockingLayer`.
- Adicionado contrato para impedir retorno de `lightbox` no router.

## Fora de escopo

- Storage real de fotos.
- Buckets, policies, migrations ou Supabase/RLS.
- Recriacao app-v2-native de fotos.
- PDF/share, assinatura, PMOC ou billing.

## Validacao esperada

```bash
npm test -- src/__tests__/router.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
