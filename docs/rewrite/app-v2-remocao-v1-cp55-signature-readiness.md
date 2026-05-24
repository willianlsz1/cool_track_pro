# app-v2 - CP55 readiness para remover assinatura legada

## 1. Objetivo

Mapear a assinatura digital legada restante e definir a ordem segura de corte
sem reutilizar o fluxo v1 no app-v2.

Este CP e documental. Ele nao altera runtime, storage, router, Supabase/RLS,
PDF/share, WhatsApp, billing, upload/fotos, PMOC ou orcamento real.

## 2. Diagnostico atual

A assinatura legada ainda nao pode ser removida em massa porque cruza quatro
fronteiras sensiveis:

- Registro v1:
  - `src/ui/views/registro.js`
  - `src/ui/views/registro/signatureHint.js`
  - `src/ui/views/registro/save/signature.js`
  - `src/ui/viewModels/registroSignatureModel.js`
- Historico v1:
  - `src/ui/views/historico.js`
  - `src/ui/views/historico/timelineRenderer.js`
  - view models e testes que ainda modelam `hasSignature` e acao
    `hist-view-signature`
- UI/modal de assinatura:
  - `src/ui/components/signature.js`
  - `src/ui/components/signature/signature-modal.js`
  - `src/ui/components/signature/signature-viewer-modal.js`
  - `src/ui/components/signature/signature-storage.js`
  - `src/ui/components/signature/signature-canvas.js`
- Storage real:
  - `src/core/signatureStorage.js`
  - `src/core/storage.js`
  - normalizers/remotes que ainda carregam ou reduzem `registros.assinatura`

O app-v2 nao usa assinatura real. As ocorrencias em `src/app-v2` sao blocos
visuais de relatorio local ou textos de backlog, sem captura, upload, Supabase
Storage, localStorage ou assinatura digital real.

## 3. Riscos de remover tudo em um unico CP

- Quebrar salvamento de Registro v1 antes de aposentar a superficie visual de
  captura.
- Deixar o Historico chamando viewer/modal removido.
- Manter `core/storage.js` chamando flush de assinaturas pendentes sem modulo
  existente.
- Misturar remocao de assinatura com storage real, router e limpeza de testes.
- Apagar cobertura de seguranca antes de criar contratos de ausencia.

## 4. Ordem segura recomendada

### CP55A - Aposentar captura/salvamento de assinatura no Registro v1

Escopo:

- Fazer Registro v1 salvar sempre sem assinatura.
- Remover import dinamico de `../components/signature.js` no fluxo de save.
- Manter feedback local simples quando houver tentativa de captura.
- Atualizar testes de Registro para confirmar que `SignatureModal` e
  `saveSignatureForRecord` nao sao chamados.

Fora de escopo:

- Historico viewer.
- `src/core/signatureStorage.js`.
- router/popstate.
- campos persistidos `registros.assinatura`.

Validacao focada:

```bash
npm test -- src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/registroSaveSignatureHelpers.test.js src/__tests__/registroSignatureHint.test.js src/__tests__/registroSignatureLegacyHandlers.test.jsx --run
```

### CP55B - Aposentar visualizacao de assinatura no Historico v1

Escopo:

- Remover acao `hist-view-signature` da timeline v1.
- Remover dependencia de `SignatureViewerModal`, `getSignatureForRecord` e
  `cleanupOrphanSignatures` em Historico.
- Atualizar contratos da timeline para tratar assinatura como dado legado nao
  renderizado.

Fora de escopo:

- Storage real.
- router global.
- campos persistidos.

Validacao focada:

```bash
npm test -- src/__tests__/historicoView.test.js src/__tests__/historicoTimelineRenderer.test.js src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoCardActions.contract.test.js --run
```

### CP55C - Remover UI/modal de assinatura

Escopo:

- Remover `src/ui/components/signature.js`.
- Remover `src/ui/components/signature/**`.
- Remover testes dedicados dos modais e handlers legados de assinatura.
- Atualizar contratos de ausencia.

Fora de escopo:

- `src/core/signatureStorage.js`, se ainda houver chamadas por storage remoto.
- router, se ainda tiver fechamento de overlays de assinatura.

Validacao focada:

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/router.test.js --run
```

### CP55D - Remover storage real de assinatura

Escopo:

- Remover `src/core/signatureStorage.js`.
- Remover `flushPendingSignatures` de `src/core/storage.js`.
- Remover testes `signatureStorage`, `signatureFlush` e `signatureResolver`
  quando nao houver consumidor runtime.
- Atualizar normalizers somente se a ausencia de assinatura como feature
  permitir; caso contrario, manter campo como dado legado booleano ate CP de
  storage/schema proprio.

Fora de escopo:

- Fotos/upload real.
- Migrations/RLS.
- Remocao de colunas ou schemas.

Validacao focada:

```bash
npm test -- src/__tests__/signatureStorage.test.js src/__tests__/signatureFlush.test.js src/__tests__/storageCacheOffline.contract.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
```

## 5. Contratos publicos envolvidos

- `data-action="registro-signature-capture"`
- `data-action="registro-signature-open"`
- `data-action="registro-signature-remove"`
- `data-hist-action="hist-view-signature"`
- IDs de overlay:
  - `modal-signature-overlay`
  - `modal-signature-viewer-overlay`
- storage key:
  - `cooltrack-sig-pending-upload`
- campo persistido:
  - `registros.assinatura`

Esses contratos nao devem ser removidos sem o CP correspondente e teste focado.

## 6. Criterio de pronto para assinatura legada removida

- `src/app-v2/**` continua sem assinatura real.
- Registro v1 nao captura nem salva assinatura.
- Historico v1 nao renderiza nem abre assinatura.
- UI/modal legado de assinatura nao existe.
- Storage de assinatura pendente nao e chamado pelo sync.
- Contratos de ausencia cobrem os arquivos removidos.
- `npm run format`, `npm run build` e `npm run check` passam.

## 7. Proximo passo recomendado

Executar CP55A: aposentar captura/salvamento de assinatura no Registro v1. Este
e o menor corte de runtime porque interrompe a entrada de novas assinaturas sem
misturar Historico, router ou storage real.
