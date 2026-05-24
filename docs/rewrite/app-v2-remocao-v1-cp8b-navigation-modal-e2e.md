# app-v2 - CP-8b: remocao do e2e de navegacao/modal v1

## Objetivo

Remover o e2e legado que validava navegacao e modal do shell v1 depois da
promocao do app-v2 como entrada principal.

## Alteracoes

- Removido `e2e/specs/navigation-and-modal.spec.js`.
- Ampliado `src/__tests__/legacyV1RemovalContracts.test.js` para bloquear o
  retorno desse e2e v1.

## Justificativa

O spec assumia `body[data-route="inicio"]`, `#main-content`,
`#modal-add-eq`, `data-testid="equipamentos-add-equipment"` e navegacao pelo
router legado. Esses contratos nao representam o entrypoint principal atual do
app-v2.

## Fora do escopo

- Alteracoes no router legado.
- Remocao de fluxos sensiveis de Registro, Relatorio, Orcamentos, PDF/share,
  WhatsApp, storage, Supabase/RLS, assinatura ou PMOC real.
- Reescrita de cobertura e2e do app-v2.

## Validacao

- RED inicial: `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
  falhou enquanto `e2e/specs/navigation-and-modal.spec.js` existia.
