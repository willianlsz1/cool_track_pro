# BUGS-FOUND

## BUG-CT-001

- **Tipo**: limitação de método (teste estático)
- **Arquivo**: `src/__tests__/contracts/selectors.test.js`
- **Motivo**: contrato atual usa regex em source para congelar `data-action`, `data-nav`, `data-id`; não captura seletores gerados dinamicamente em runtime.
- **Critério de resolução**: adicionar suíte complementar de montagem runtime por view para cobrir seletores dinâmicos.

## BUG-CT-002

- **Tipo**: limitação de extração estática
- **Arquivo**: `src/__tests__/contracts/selectors.test.js`
- **Motivo**: placeholders de template string (`\${...}`) não são literais de contrato; precisam ser filtrados para não poluir snapshots com valores não determinísticos.
- **Critério de resolução**: manter filtro ativo no helper `extract()` e complementar com teste runtime para validar caminhos dinâmicos.

## BUG-009

- **Tipo:** extração arquitetural pendente
- **Arquivo:** `src/ui/views/dashboard.js`
- **Severidade:** baixa
- **Sintoma:** `updateHeader`/`_updateGlobalHeader`/`_renderKPIs` em `dashboard.js`, importado cruzado por `equipamentos.js` e `historico.js`.
- **Critério:** extrair para `src/ui/composables/header.js`. Requer mover `_updateGlobalHeader` e `_renderKPIs` também.
- **Status:** aberto, deferido para sub-PR 2.1B.
- **Código:** BUG-009

## BUG-010

- **Tipo:** dívida de duplicação
- **Arquivo:** `src/ui/views/dashboard.js` e `src/ui/views/dashboard/metrics.js`
- **Severidade:** baixa
- **Sintoma:** ambos arquivos têm wrappers idênticos para `calcHealthScore` e `getHealthClass`.
- **Critério:** consolidar em um único local (ou eliminar wrappers se domain direto for suficiente).
- **Status:** aberto.
- **Código:** BUG-010
