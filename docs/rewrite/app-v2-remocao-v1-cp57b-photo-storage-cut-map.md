# app-v2 - Remocao v1 CP57B - Photo/storage cut map

## Objetivo

Mapear a ordem segura para remover fotos, upload e storage herdados do v1 sem
reaproveitar essa implementacao no app-v2.

Este CP e documental. Nao altera runtime, schema, migrations, policies,
bucket `registro-fotos`, UI, uploads, fila offline ou contratos publicos.

## Diagnostico

O corte direto de `src/core/photoStorage.js`, `src/ui/components/photos.js` ou
`src/ui/components/equipmentPhotos.js` ainda e inseguro porque os consumidores
restantes estao em grupos diferentes:

- Registro v1: `src/ui/views/registro.js`,
  `src/ui/views/registro/save/photos.js`,
  `src/ui/viewModels/registroPhotosModel.js` e selectors publicos
  `input-fotos`, `input-fotos-camera`, `registro-photos-root`.
- Equipamentos v1: `src/ui/views/equipamentos.js`,
  `src/ui/views/equipamentos/fotos.js`,
  `src/ui/components/equipmentPhotos.js` e os actions
  `open-eq-photos-editor` / `save-eq-photos`.
- Historico v1: `src/ui/views/historico.js` ainda usa `Photos.openLightbox`
  para visualizar fotos de registros.
- Storage/sync: `src/core/storage.js` chama `flushPendingPhotos`, e os
  normalizers/sync ainda usam `normalizePhotoList` e
  `migrateLegacyPhotosForRegistros`.
- Supabase/storage: migrations e testes ainda protegem o bucket
  `registro-fotos`, policies, ownership e limpeza em exclusao de conta.

## Ordem de corte recomendada

### CP57C - Aposentar captura de fotos no Registro v1

Escopo:

- Remover `Photos.render`, `Photos.pending` e `uploadPendingPhotos` do fluxo de
  Registro v1.
- Remover os inputs/seletores de foto do template v1 quando nao houver outro
  consumidor.
- Atualizar/remover testes que cobrem exclusivamente a captura legada de fotos.

Fora de escopo:

- Equipamentos.
- Historico.
- `src/core/photoStorage.js`.
- Supabase, bucket, RLS e migrations.

### CP57D - Aposentar editor de fotos de Equipamentos v1

Escopo:

- Remover actions `open-eq-photos-editor` e `save-eq-photos`.
- Remover `src/ui/views/equipamentos/fotos.js` e
  `src/ui/components/equipmentPhotos.js` quando ficarem sem consumidor.
- Preservar ou normalizar o campo `equipamentos.fotos` apenas se ainda for
  necessario para leitura existente durante o desmonte.

Fora de escopo:

- Registro.
- Historico.
- Bucket/policies.
- Recriacao de anexos/fotos no app-v2.

### CP57E - Aposentar lightbox de fotos no Historico v1

Escopo:

- Remover a dependencia de `Photos.openLightbox` em Historico.
- Remover o componente `src/ui/components/photos.js` se Registro e Historico ja
  nao o usarem.

Fora de escopo:

- Storage real.
- Schema e limpeza de dados existentes.

### CP57F - Remover storage client-side legado de fotos

Escopo:

- Remover `flushPendingPhotos`, `uploadPendingPhotos`,
  `migrateLegacyPhotosForRegistros`, fila pendente e normalizacao acoplada ao
  storage real quando nao houver consumidores runtime.
- Atualizar `src/core/storage.js`, normalizers e sync para nao dependerem de
  `photoStorage.js`.
- Remover testes dedicados a retry/upload/fallback legados.

Fora de escopo:

- Supabase bucket/policies e migrations.
- Edge Function de exclusao de conta.

### CP57G - Retirar bucket/policies de fotos legadas

Escopo:

- Etapa propria de Supabase/storage para decidir se `registro-fotos` sera
  removido, migrado ou mantido temporariamente para cleanup de dados antigos.
- Atualizar tests SQL e `delete-user-account` se o bucket deixar de existir.

Fora de escopo:

- UI v1.
- App-v2-native de fotos/anexos.

## Validacao por etapa

Cada CP de codigo deve rodar:

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

Para CP57G, adicionar:

```bash
supabase db reset --local --yes
supabase test db
```

## Risco remanescente

Fotos, uploads e storage cruzam UI legada, cache offline, sync remoto,
Supabase storage e exclusao de conta. A remocao deve continuar em lotes
pequenos; qualquer tentativa de apagar `photoStorage.js` agora misturaria
runtime, storage e schema em um unico checkpoint.
