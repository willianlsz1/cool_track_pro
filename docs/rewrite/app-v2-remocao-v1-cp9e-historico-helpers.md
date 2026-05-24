# app-v2 remocao v1 - CP-9e helpers de Historico

## Objetivo

Remover `src/features/historico/**` sem remover a rota/view v1 de Historico,
que ainda cruza contratos sensiveis de registro, PDF/share e WhatsApp.

## Alterado

- Helpers de Historico foram co-localizados com a view legada em
  `src/ui/views/historico/helpers/**`.
- Testes dos helpers foram movidos para `src/__tests__/historicoHelpers/**`.
- `src/ui/views/historico.js` passou a importar os helpers pelo caminho local da
  view.
- `legacyV1RemovalContracts` passou a bloquear a recriacao de
  `src/features/historico`.

## Fora do escopo

- Remover rota `historico`, view `src/ui/views/historico.js` ou containers do
  shell legado.
- Alterar timeline, filtros, PDF/share, WhatsApp, registro, storage, PMOC,
  router ou app-v2.
- Apagar testes legados que ainda protegem fluxo critico.

## Validacao esperada

- `npm test -- src/__tests__/historicoHelpers src/__tests__/historicoView.test.js src/__tests__/historicoFilters.contract.test.js src/__tests__/historicoRegistroIntegration.contract.test.js src/__tests__/historicoPdfWhatsappIntegration.contract.test.js src/__tests__/legacyV1RemovalContracts.test.js --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
