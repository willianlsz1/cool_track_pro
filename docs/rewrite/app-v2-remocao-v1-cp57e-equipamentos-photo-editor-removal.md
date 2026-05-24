# app-v2 - Remocao v1 CP57E - Equipamentos photo editor removal

## Objetivo

Aposentar o editor/upload de fotos de Equipamentos v1 sem remover ainda leitura
de fotos antigas, `photoStorage.js`, Historico ou Supabase/storage.

## Escopo executado

- Removido o modulo `src/ui/views/equipamentos/fotos.js`.
- Removido o componente `src/ui/components/equipmentPhotos.js`.
- Removidos os actions `open-eq-photos-editor` e `save-eq-photos`.
- Removido o modal `modal-eq-photos` do shell legado.
- Removidas as CTAs de foto do card e do detalhe de equipamento.
- Atualizados contratos/testes para bloquear o retorno do editor legado.

## Fora de escopo

- Historico v1 e lightbox read-only.
- `src/core/photoStorage.js`, fila offline, normalizacao e retry.
- Supabase, bucket `registro-fotos`, RLS e migrations.
- App-v2-native de fotos/anexos.
- PDF/share, WhatsApp, PMOC, billing e pricing.

## Contrato resultante

- Criacao/edicao de dados do equipamento continua preservando `fotos` ja
  existentes em modo edicao.
- Fotos antigas ainda podem aparecer como capa quando ja existirem no dado.
- Nao ha caminho de UI v1 para capturar, carregar, remover, promover capa ou
  salvar novas fotos de equipamento.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/equipamentosDetail.test.js src/__tests__/equipamentosLegacyRender.test.js src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js src/__tests__/equipamentosLegacySetorDetailHandlers.test.js src/__tests__/equipamentosLegacyHeaderHandlers.test.js src/__tests__/equipamentosViewModel.test.js src/__tests__/equipamentosSaveEquip.test.js src/__tests__/equipamentos.ownership.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo CP recomendado

CP57F: aposentar a dependencia de `Photos.openLightbox` em Historico v1 e entao
remover `src/ui/components/photos.js` se nao houver mais consumidor runtime.
