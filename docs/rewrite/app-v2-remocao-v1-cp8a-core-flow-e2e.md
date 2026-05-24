# app-v2 - CP-8a: remocao do e2e core-flow v1

## Objetivo

Remover um smoke e2e legado, ja pulado por flake, que ainda validava a jornada
integrada do app v1 depois da promocao do app-v2 como entrada principal.

## Alteracoes

- Removido `e2e/specs/core-flow-smoke.spec.js`.
- Ampliado `src/__tests__/legacyV1RemovalContracts.test.js` para bloquear o
  retorno desse smoke v1 pulado.

## Justificativa

O spec dependia de `src/core/router.js`, `data-route="inicio"` e rotas DOM do
shell legado. Ele ja estava `test.skip` e nao protegia o entrypoint principal
atual do app-v2.

## Fora do escopo

- Remocao de rotas sensiveis de Registro, Relatorio, Orcamentos, PDF/share,
  WhatsApp, storage, Supabase/RLS, assinatura ou PMOC real.
- Reescrita de cobertura e2e do app-v2.
- Remocao em massa de specs legados ainda ativos.

## Validacao

- RED inicial: `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
  falhou enquanto `e2e/specs/core-flow-smoke.spec.js` existia.
