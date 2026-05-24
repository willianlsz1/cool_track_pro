# app-v2 - Remocao v1 CP-3d - Fotos do registro React

## Objetivo

Remover a ilha React legada de fotos do registro sem alterar persistencia,
storage, PDF/share, assinatura, rotas ou o fluxo de salvamento do registro.

## Arquivos alterados

- `src/ui/components/photos.js`
- `src/__tests__/registroLegacyPhotosRender.test.js`
- `src/__tests__/contracts/registroSelectors.test.js`
- `src/react/entrypoints/registroPhotosIsland.jsx`
- `src/react/pages/RegistroPhotos.jsx`
- `src/__tests__/registroPhotosIsland.test.jsx`

## Decisao

O componente React era usado apenas como renderer do bloco de fotos do v1.
O adapter `Photos` agora renderiza o DOM diretamente e preserva os contratos
publicos usados por handlers e testes:

- `#registro-photos-root`
- `#photo-drop-zone`
- `#photo-drop-text`
- `#input-fotos`
- `#input-fotos-camera`
- `#photo-preview`
- `.registro-photo-drop`
- `.registro-photo-quick`
- `.photo-thumb`
- `.photo-thumb__remove`
- `data-r-action`
- `data-photo-index`

As URLs de foto continuam filtradas por `buildRegistroPhotoItems` e
`isSafeRegistroPhotoSrc`, evitando HTML, `javascript:` e SVG inline inseguro no
preview.

## Fora de escopo

- Compressao e persistencia real de fotos.
- PDF/share.
- WhatsApp.
- Assinatura.
- Storage/Supabase.
- Redesign visual.
- Remocao das demais ilhas React de Registro.

## Validacao esperada

```bash
npm test -- src/__tests__/registroLegacyPhotosRender.test.js src/__tests__/contracts/registroSelectors.test.js src/features/registro/__tests__/save/photos.test.js --run
rg -n "registroPhotosIsland|mountRegistroPhotosReact|unmountRegistroPhotosReact|RegistroPhotos.jsx|data-react-registro-photos-mounted" src index.html public -S
npm run format
npm run build
npm run check
```

## Risco remanescente

Baixo/medio. O checkpoint remove uma ponte React usada no shell v1, mas o bloco
mantem os IDs, classes, inputs e actions publicos. A validacao completa ainda
precisa cobrir rotas e salvamento legado porque `Photos.pending` continua sendo
consumido por fluxos de registro/PDF/share.
