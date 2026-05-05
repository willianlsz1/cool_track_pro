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
