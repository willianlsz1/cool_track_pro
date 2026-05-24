# app-v2 - CP55B retirada da assinatura no Historico v1

## Objetivo

Aposentar a visualizacao de assinatura digital no Historico v1 sem tocar no
storage real de assinatura, no router global, no campo persistido
`registros.assinatura` ou no componente/modal legado que ainda sera removido em
CP proprio.

Este checkpoint continua a decisao de nao reutilizar assinatura v1 no app-v2.
A assinatura deve ser reconstruida depois como solucao app-v2-native.

## Escopo executado

- `src/ui/views/historico.js`
  - Removeu import de `cleanupOrphanSignatures`, `getSignatureForRecord` e
    `SignatureViewerModal`.
  - Removeu limpeza automatica de assinaturas orfas durante render do Historico.
  - O item da timeline passa a receber `signature: null`.
  - Removeu handler local de `[data-hist-action="hist-view-signature"]`.

- `src/ui/views/historico/timelineRenderer.js`
  - Removeu renderizacao do preview clicavel `.hist-signature-preview`.
  - Removeu o icone local usado exclusivamente por esse preview.

- `src/ui/viewModels/historicoContracts.js`
  - Removeu `HISTORICO_ACTIONS.viewSignature`.
  - Removeu `.hist-signature-preview` da lista de classes publicas do Historico.

- Testes focados do Historico
  - Atualizados para provar que fotos continuam com contrato DOM seguro.
  - Atualizados para provar que `hist-view-signature` nao e mais renderizado.

## Fora de escopo

- `src/core/signatureStorage.js`.
- Integracao de `flushPendingSignatures` em `src/core/storage.js`.
- `src/ui/components/signature.js` e subcomponentes.
- Overlays de assinatura tratados pelo router global.
- Campo persistido `registros.assinatura`.
- Qualquer implementacao de assinatura app-v2-native.

## Validacao focada

Executado:

```bash
npm test -- src/__tests__/historicoView.test.js src/__tests__/historicoTimelineRenderer.test.js src/__tests__/historicoTimelineLegacyRender.test.js src/__tests__/historicoCardActions.contract.test.js src/__tests__/historicoViewModel.test.js --run
```

Resultado:

- 5 arquivos de teste passaram.
- 50 testes passaram.

## Riscos remanescentes

- Dados antigos ainda podem conter `registros.assinatura`, mas o Historico v1
  nao exibe mais a acao de visualizacao.
- Storage e modal de assinatura ainda existem para CP55C/CP55D.
- Testes de outros fluxos ainda podem mockar assinatura por vestigio historico;
  a remocao deve continuar por camadas para evitar misturar storage/router.

## Proximo passo recomendado

Executar CP55C: remover a UI/modal legado de assinatura e seus testes dedicados,
preservando storage real para CP55D.
