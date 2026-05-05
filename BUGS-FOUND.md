# BUGS-FOUND

## BUG-CT-003

- **Tipo**: gap de cobertura de storage
- **Arquivo**: `src/__tests__/storage.integration.test.js` e fluxos de `src/ui/views/registro.js`
- **Motivo**: contratos existentes cobrem shape e sincronização, mas não garantem explicitamente que fluxos de save persistem URLs/referências remotas em vez de payload inline/base64.
- **Critério de resolução**: adicionar regressões direcionadas para save de fotos/assinatura verificando payload final persistido.

## BUG-CT-001

- **Tipo**: limitação de método (teste estático)
- **Arquivo**: `src/__tests__/contracts/selectors.test.js`
- **Motivo**: contrato atual usa regex em source para congelar `data-action`, `data-nav`, `data-id`; não captura seletores gerados dinamicamente em runtime.
- **Critério de resolução**: adicionar suíte complementar de montagem runtime por view para cobrir seletores dinâmicos.

## BUG-CT-002

- **Tipo**: limitação de extração estática
- **Arquivo**: `src/__tests__/contracts/selectors.test.js`
- **Motivo**: placeholders de template string (`\${...}`) não são literais de contrato; precisam ser filtrados para não poluir snapshots com valores não determinísticos.
- **Critério de resolução**: manter filtro ativo no helper `extract()` e complementar com teste runtime para validar caminhos dinâmicos.

## BUG-001

- **Tipo**: limpeza de estado de edição (`clearRegistro/sessionStorage`)
- **Arquivo**: `src/ui/views/registro.js`
- **Status**: não reproduzível na baseline atual; teste mantido como regressão preventiva.
- **Cobertura adicionada**: `src/__tests__/regressions/clear-registro-edit-state.test.js` (cenários cancelar, salvar edição e saída sem salvar).
- **Referência**: PR 1.5.1.

## BUG-002

- **Tipo**: edição preservando fotos originais
- **Arquivo**: `src/ui/views/registro.js`
- **Status**: não reproduzível na baseline atual; teste mantido como regressão preventiva.
- **Cobertura adicionada**: `src/__tests__/regressions/edit-preserves-photos.test.js` (edição alterando apenas `r-obs` preserva 3 fotos existentes no payload salvo).
- **Referência**: PR 1.5.2.

## BUG-003

- **Tipo**: persistência de fotos base64 no payload final
- **Arquivo**: `src/ui/views/registro.js` + `src/core/photoStorage.js` + `src/core/storage.js`
- **Status**: resolvido em PR 1.5.4.
- **Evidência técnica**:
  - fallback de upload em `uploadPendingPhotos` passou a enfileirar blob + marker pendente (sem `data:image` no payload novo);
  - `saveRegistro` persiste markers em `fotos` e queue keys em `fotos_pendentes`;
  - `flushPendingPhotos` reconcilia markers para refs remotas sem perder pendências parciais.
- **Cobertura de regressão**: `src/__tests__/regressions/photo-failure-path.test.js` (5 cenários, incluindo flush parcial sem perda).

## BUG-004

- **Tipo**: persistência de assinatura em cloud vs base64 inline
- **Arquivo**: `src/ui/views/registro.js` + `src/core/signatureStorage.js`
- **Status**: não reproduzível no caminho validado (upload retorna referência); teste mantido como regressão preventiva.
- **Achado**: payload final persiste objeto de referência (`version/provider/bucket/path/url`), sem DataURL/base64.
- **Comportamento em falha de upload (design atual)**: assinatura cai em fila pendente e `saveRegistro` salva `assinatura: true` como flag local para reconcile posterior.
- **Cobertura adicionada**: `src/__tests__/exploratory/signature-payload.test.js`.

## BUG-006

- **Tipo**: limpeza de dados legados base64 no Postgres
- **Arquivo**: `registros.fotos` históricos
- **Status**: fora de escopo deste PR.
- **Nota**: PR 1.5.4 previne novos base64. Migração/limpeza de dados antigos fica para PR futuro dedicado.

## BUG-007

- **Tipo**: hipótese de gap no modo edição
- **Arquivo**: fluxo de edição em `src/ui/views/registro.js`
- **Status**: a validar.
- **Hipótese**: edição com novas fotos e falha de upload pode não estar coberta pelo mesmo conjunto de testes do create mode.

## BUG-008

- **Tipo**: inconsistência de shape (`fotos_pendentes`)
- **Arquivo**: `saveRegistro` vs `flushPendingPhotos`
- **Status**: aberto (cleanup futuro).
- **Nota**: save omite campo vazio; flush grava `null` quando esvazia pendências.
