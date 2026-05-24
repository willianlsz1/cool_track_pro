# app-v2 - Remocao v1 CP57D - Registro photo capture removal

## Objetivo

Aposentar a captura/upload de fotos no Registro v1 sem remover ainda o storage
real de fotos, o editor de fotos de Equipamentos ou a visualizacao historica.

Este CP nao recria fotos/anexos no app-v2. A recriacao deve acontecer em etapa
app-v2-native propria.

## Escopo executado

- Removido do Registro v1 o uso de `Photos.render`, `Photos.pending`,
  `Photos.clear`, `uploadPendingPhotos` e helpers de save de fotos.
- Removida a superficie DOM de captura de fotos no template do Registro v1:
  `input-fotos`, `input-fotos-camera`, `photo-drop-zone`, `photo-preview` e
  `registro-photos-root`.
- Atualizados contratos publicos do Registro para nao listar mais roots/actions
  de captura de fotos.
- Reduzido `src/ui/components/photos.js` para ponte de lightbox read-only,
  ainda usada por Historico/Equipamentos ate CPs proprios.
- Removidos testes dedicados a captura/upload legado de fotos no Registro.

## Fora de escopo

- Equipamentos v1 e `EquipmentPhotos`.
- Historico v1 e visualizacao read-only de fotos antigas.
- `src/core/photoStorage.js`, fila offline e retry.
- Supabase, bucket `registro-fotos`, RLS, migrations e limpeza de conta.
- PDF/share, WhatsApp, PMOC, billing, pricing e qualquer storage real app-v2.

## Contrato resultante

- Criacao de Registro v1 ainda preserva o shape `fotos: []`, mas nao faz upload
  e nao captura novas imagens.
- Edicao de registros antigos preserva o campo `fotos` existente porque o fluxo
  de edicao atual continua mesclando sobre o registro anterior.
- Lightbox read-only permanece em `Photos.openLightbox` para nao misturar este
  corte com Historico/Equipamentos.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contracts/registroSelectors.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/registroLegacyHeaderRender.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/regressions/edit-preserves-photos.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo CP recomendado

CP57E: aposentar o editor de fotos de Equipamentos v1 em corte dedicado,
mantendo Historico, storage real e Supabase para etapas posteriores.
