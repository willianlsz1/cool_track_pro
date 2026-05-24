# app-v2 - CP55F remocao da superficie de assinatura no Registro

## Objetivo

Remover a superficie inerte de assinatura do Registro v1 depois da remocao da
captura, visualizacao, UI/modal, storage e integracao com router.

## Escopo alterado

- Removidos helpers de assinatura do save de Registro.
- Removido renderer/modelo do bloco `registro-signature-hint`.
- Removidos handlers delegados de captura/abrir/remover assinatura.
- Removidos selectors publicos e root de assinatura dos contratos de Registro.
- Removido bloco HTML inerte do template de Registro.
- Testes dedicados da superficie inerte foram aposentados.
- Contrato de remocao v1 atualizado para travar a ausencia dessa superficie.

## Fora do escopo

- Campo persistido `registros.assinatura`.
- Normalizadores e sync que ainda preservam shape de registro.
- `src/core/orcamentos.js` e assinatura de orcamento.
- Fotos, PDF/share, WhatsApp, PMOC, billing, schema, migrations ou RLS.

## Validacao esperada

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contracts/registroSelectors.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/registroSaveSignatureHandlers.test.js src/__tests__/exploratory/signature-payload.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
