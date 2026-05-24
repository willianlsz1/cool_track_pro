# app-v2 - CP35 remocao do helper equipamentosPure

## Objetivo

Reduzir a superficie v1 em `src/ui/helpers` removendo um helper puro legado sem
consumidor runtime.

## Evidencia

- `src/ui/helpers/equipamentosPure.js` era importado apenas por
  `src/__tests__/viewPureHelpers.test.js`.
- As funcoes equivalentes usadas pelo runtime legado de Equipamentos permanecem
  em `src/ui/views/equipamentos/helpers.js`.
- O app-v2 nao importa `src/ui/helpers/equipamentosPure.js`.
- `src/domain` e `src/core` nao importam esse helper.

## Alteracoes

- Removido `src/ui/helpers/equipamentosPure.js`.
- Removido o teste dedicado `src/__tests__/viewPureHelpers.test.js`, que cobria
  apenas o helper removido.
- Atualizado `legacyShellRetirementGate` para manter o helper aposentado fora da
  arvore.

## Fora de escopo

- Nenhuma alteracao em Equipamentos v1 ativo.
- Nenhuma alteracao em app-v2, storage, router, auth, PDF/share, PMOC,
  assinatura, billing ou orcamento real.

## Validacao

```bash
rg -n --fixed-strings "src/ui/helpers/equipamentosPure.js" src docs e2e index.html vite.config.js
rg -n "normalizeText|classifyRiskFactor|recencia|ctaLabelForAction" src docs e2e index.html vite.config.js
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/equipamentosUtils/viewModels.test.js src/__tests__/equipamentosViewModel.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
