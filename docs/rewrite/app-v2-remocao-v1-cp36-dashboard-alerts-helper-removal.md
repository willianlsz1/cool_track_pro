# app-v2 - CP36 remocao do helper dashboard alerts

## Objetivo

Reduzir a superficie v1 em `src/ui/views/dashboard` removendo um helper de
alertas do Dashboard sem import ativo.

## Evidencia

- `src/ui/views/dashboard/alerts.js` nao tinha import estatico em `src`,
  `e2e`, `index.html` ou `vite.config.js`.
- O Dashboard legado atual mantem suas funcoes de alerta no proprio
  `src/ui/views/dashboard.js` e nos blocos DOM de
  `src/ui/views/dashboard/readOnlyBlocks.js`.
- O app-v2 nao importa `src/ui/views/dashboard/alerts.js`.
- A remocao nao toca PDF/share, PMOC, assinatura, storage, router, auth,
  billing ou orcamento real.

## Alteracoes

- Removido `src/ui/views/dashboard/alerts.js`.
- Atualizado `legacyShellRetirementGate` para manter o helper aposentado fora da
  arvore.
- Atualizado o plano de remocao v1 com o CP-36 e a nova contagem de `src/ui`.

## Fora de escopo

- Nenhuma alteracao nos blocos ativos do Dashboard v1.
- Nenhuma alteracao em CSS legado.
- Nenhuma alteracao no app-v2.

## Validacao

```bash
rg -n --fixed-strings "./dashboard/alerts.js" src docs e2e index.html vite.config.js
rg -n "getAlertActionMeta|alertCardHtml|getActionButton|renderNextAction" src docs e2e index.html vite.config.js
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/dashboardLegacyReadOnlyBlocks.test.js src/__tests__/dashboardLegacyNextAction.test.js src/__tests__/dashboardLegacyProDraftContracts.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
