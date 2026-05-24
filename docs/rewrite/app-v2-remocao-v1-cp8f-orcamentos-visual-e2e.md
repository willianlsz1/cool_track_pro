# app-v2 - Remocao v1 CP-8f - Orcamentos visual e2e legado

## Objetivo

Remover o E2E visual legado de Orcamentos depois da promocao do app-v2 para
entrada principal.

## Arquivos alterados

- `e2e/specs/orcamentos-visual-smoke.spec.js`
- `src/__tests__/legacyV1RemovalContracts.test.js`

## Evidencia

O spec removido dependia de contratos do app legado/v1:

- `#main-content`
- `body[data-route="inicio"]`
- `src/core/router.js`
- `#view-orcamentos`
- atributo de ilha legada `data-react-orcamentos-page`
- classes e actions DOM legadas `.orc-card`, `.orc-chip`, `orc-share`,
  `orc-download` e `orc-mark-approved`

## Cobertura preservada

O checkpoint remove apenas o smoke E2E do shell v1. Permanecem as coberturas
focadas de Orcamentos/Quotes em testes unitarios e app-v2, incluindo view model,
DataPort e fluxo local de rascunho.

## Alteracao

- Removido `e2e/specs/orcamentos-visual-smoke.spec.js`.
- Adicionado contrato em `legacyV1RemovalContracts.test.js` para impedir retorno
  do E2E visual legado.

## Fora de escopo

Este checkpoint nao altera:

- runtime de Orcamentos;
- orcamento real;
- PDF/share;
- WhatsApp;
- storage real;
- Supabase/RLS;
- app-v2;
- billing ou pricing.

## Validacao esperada

1. RED:
   `npm test -- src/__tests__/legacyV1RemovalContracts.test.js --run`
   deve falhar enquanto o spec legado existir.
2. GREEN:
   o mesmo teste deve passar depois da remocao.
3. Validacao geral:
   `npm run format`, `npm run build`, `npm run check` e `git diff --check`.
