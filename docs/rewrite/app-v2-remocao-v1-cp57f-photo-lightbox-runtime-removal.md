# app-v2 - Remocao v1 CP57F - Photo lightbox runtime removal

## Objetivo

Aposentar o lightbox legado de fotos v1 depois da remocao dos fluxos de captura
em Registro e Equipamentos.

## Escopo executado

- Removido `src/ui/components/photos.js`.
- Removida a abertura de `Photos.openLightbox` no Historico v1.
- Removida a acao `hist-open-photo` e o atributo `data-photo-url` das miniaturas
  do Historico.
- Removida a abertura de lightbox pela capa do detalhe de Equipamentos.
- Removido o handler global `close-lightbox`.
- Removido o markup `#lightbox` / `#lightbox-img` do shell legado.
- Atualizados contratos para impedir retorno do runtime legado de lightbox.

## Fora de escopo

- `src/core/photoStorage.js`, normalizacao de listas e fila legada.
- Storage real, Supabase, bucket `registro-fotos`, RLS e migrations.
- Limpeza de dados antigos de fotos.
- Recriacao de fotos/anexos no app-v2.
- PDF/share, WhatsApp, PMOC, billing e pricing.

## Contrato resultante

- Fotos antigas ainda podem aparecer como imagens estaticas quando ja estiverem
  no dado.
- Nao ha caminho runtime v1 para abrir lightbox, ampliar foto ou fechar lightbox.
- O armazenamento/normalizacao legado de fotos continua isolado para CP
  dedicado seguinte.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/historicoTimelineRenderer.test.js src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoViewModel.test.js src/__tests__/equipamentosDetailController.test.js src/__tests__/equipamentosListRenderer.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo CP recomendado

CP57G: remover storage client-side legado de fotos (`photoStorage.js`,
`uploadPendingPhotos`, `flushPendingPhotos` e normalizadores acoplados), sem
misturar com bucket/policies/migrations de Supabase.
