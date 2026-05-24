# app-v2 - CP33 remocao do cardRenderer de Clientes

## Objetivo

Reduzir a superficie v1 em `src/ui/views/clientes` removendo um renderer de uso
unico sem alterar contratos publicos da tela legada.

## Evidencia

- `src/ui/views/clientes/cardRenderer.js` era importado apenas por
  `src/ui/views/clientes/pageRenderer.js` e por seu teste dedicado.
- A co-localizacao deixa `pageRenderer.js` abaixo de 1000 linhas.
- O app-v2 nao importa `src/ui/views/clientes/cardRenderer.js`.

## Alteracoes

- `renderCard` foi co-localizado em `src/ui/views/clientes/pageRenderer.js`.
- `src/ui/views/clientes/cardRenderer.js` foi removido.
- `clientesCardRenderer.test.js` passou a importar `renderCard` de
  `pageRenderer.js`.
- `legacyShellRetirementGate` passou a bloquear o retorno do renderer removido.

## Fora do escopo

- `summaryRenderer.js`.
- Runtime v1 amplo, CSS legado, storage, PDF/share, WhatsApp, PMOC, billing,
  pricing, router ou app-v2.

## Validacao planejada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/clientesCardRenderer.test.js src/__tests__/clientesViewModel.test.js src/__tests__/clientesLegacyRender.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
