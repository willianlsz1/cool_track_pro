# app-v2 - CP34 remocao do summaryRenderer de Clientes

## Objetivo

Reduzir a superficie v1 em `src/ui/views/clientes` removendo o renderer de
resumo usado apenas pela pagina legada de Clientes.

## Evidencia

- `src/ui/views/clientes/summaryRenderer.js` era importado apenas por
  `src/ui/views/clientes/pageRenderer.js` e por seu teste dedicado.
- A co-localizacao deixa `pageRenderer.js` abaixo de 1000 linhas.
- O app-v2 nao importa `src/ui/views/clientes/summaryRenderer.js`.

## Alteracoes

- `renderKpis`, `renderSummary`, `renderActiveContext` e `renderAlertStrip`
  foram co-localizados em `src/ui/views/clientes/pageRenderer.js`.
- `src/ui/views/clientes/summaryRenderer.js` foi removido.
- `clientesSummaryRenderer.test.js` passou a importar os helpers de
  `pageRenderer.js`.
- `legacyShellRetirementGate` passou a bloquear o retorno do renderer removido.
- Textos tocados do resumo foram corrigidos de mojibake para portugues legivel.

## Fora do escopo

- Runtime v1 amplo, CSS legado, storage, PDF/share, WhatsApp, PMOC, billing,
  pricing, router ou app-v2.

## Validacao planejada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/clientesSummaryRenderer.test.js src/__tests__/clientesRenderer.test.js src/__tests__/clientesRenderer.contract.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
