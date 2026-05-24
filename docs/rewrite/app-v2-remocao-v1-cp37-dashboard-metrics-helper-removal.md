# app-v2 - CP37 remocao dos helpers dashboard metrics/constants

## Objetivo

Reduzir a superficie v1 em `src/ui/views/dashboard` removendo helpers legados de
metricas sem consumidor runtime.

## Evidencia

- `src/ui/views/dashboard/metrics.js` nao tinha import estatico em `src`,
  `e2e`, `index.html` ou `vite.config.js`.
- `src/ui/views/dashboard/constants.js` era importado apenas por
  `src/ui/views/dashboard/metrics.js`.
- As funcoes equivalentes usadas pelo Dashboard legado permanecem em
  `src/ui/views/dashboard.js` e `src/ui/viewModels/dashboardViewModel.js`.
- O app-v2 nao importa esses helpers.
- A remocao nao toca PDF/share, PMOC, assinatura, storage, router, auth,
  billing ou orcamento real.

## Alteracoes

- Removido `src/ui/views/dashboard/metrics.js`.
- Removido `src/ui/views/dashboard/constants.js`.
- Atualizado `legacyShellRetirementGate` para manter os helpers aposentados fora
  da arvore.
- Atualizado o plano de remocao v1 com o CP-37 e a nova contagem de `src/ui`.

## Fora de escopo

- Nenhuma alteracao no Dashboard v1 ativo.
- Nenhuma alteracao em constantes canonicas de `src/domain/constants/**`.
- Nenhuma alteracao no app-v2.

## Validacao

```bash
rg -n "dashboard/metrics|dashboard/constants|getMostSevereAlert|getMonthRange|countRegistrosNoMes|sparklineData|trendTag|sparklineHtml|alertContextText|calcHealthScore\\(|getHealthClass\\(" src docs e2e index.html vite.config.js
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/dashboard.rules.test.js src/__tests__/dashboardViewModel.test.js src/__tests__/dashboardLegacyKpis.test.js src/__tests__/dashboardLegacyMonth.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
