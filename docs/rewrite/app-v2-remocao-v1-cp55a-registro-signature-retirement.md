# app-v2 - CP55A aposentadoria da assinatura no Registro v1

## 1. Objetivo

Aposentar a captura e o salvamento de assinatura digital no fluxo legado de
Registro, sem remover ainda Historico, router, UI/modal compartilhada ou storage
real de assinatura.

## 2. Escopo executado

- `src/ui/views/registro.js`
  - O bloco de assinatura do Registro agora renderiza sempre como indisponivel.
  - `captureRegistroSignatureFromHint` nao importa mais `../components/signature.js`.
  - `openRegistroSignatureFromHint` nao abre mais viewer legado.
  - O save de novo registro nao passa mais gate de plano para assinatura.
  - O save nao injeta loader dinamico de assinatura.
- `src/ui/views/registro/save/signature.js`
  - `getRegistroSignatureState` retorna assinatura sempre desabilitada.
  - `loadRegistroSignatureSaveModule` nunca carrega modulo legado.
  - `captureRegistroSignatureIfNeeded` nunca aciona modal.
  - `persistRegistroSignatureForSave` nunca aciona storage.
  - `buildRegistroSignaturePayload` sempre retorna `false`.
- Testes de Registro foram atualizados para travar o novo contrato:
  - assinatura nao captura;
  - assinatura nao persiste;
  - payload segue `assinatura: false`;
  - modal/storage nao sao chamados.

## 3. Fora de escopo

- `src/ui/views/historico.js` e timeline de Historico.
- `src/ui/components/signature.js` e `src/ui/components/signature/**`.
- `src/core/signatureStorage.js`.
- `src/core/storage.js` e `flushPendingSignatures`.
- router/popstate de overlays de assinatura.
- schema, migrations, RLS, Supabase Storage ou campo `registros.assinatura`.
- app-v2-native de assinatura.

## 4. Validacao

Executado:

```bash
npm test -- src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/registroSaveSignatureHelpers.test.js src/__tests__/registroSignatureHint.test.js src/__tests__/registroSignatureLegacyHandlers.test.jsx --run
```

Resultado:

- 4 arquivos de teste passaram.
- 24 testes passaram.

Busca de contrato:

```bash
rg -n "components/signature|SignatureModal|saveSignatureForRecord|signatureStorage|loadSignatureModule" src/ui/views/registro.js src/ui/views/registro/save/signature.js src/__tests__/registroSaveSignatureHelpers.test.js src/__tests__/registroSaveSignatureHandlers.test.js
```

Resultado relevante:

- `src/ui/views/registro.js` nao referencia mais `components/signature`,
  `SignatureModal`, `saveSignatureForRecord`, `signatureStorage` ou
  `loadSignatureModule`.
- As ocorrencias restantes ficam no helper no-op e nos testes que provam que o
  loader/modal/storage nao sao chamados.

## 5. Risco remanescente

Assinatura legada ainda existe em Historico, UI/modal, router e storage real.
Isso e intencional para manter o corte pequeno. A entrada de novas assinaturas
por Registro foi interrompida neste CP.

## 6. Proximo passo recomendado

Executar CP55B: aposentar a visualizacao de assinatura no Historico v1, removendo
`hist-view-signature` e a dependencia de `SignatureViewerModal`/`getSignatureForRecord`.
