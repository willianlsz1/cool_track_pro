# app-v2 - CP-45 remocao do CSS legado tokens

## Objetivo

Remover a folha legada `src/assets/styles/tokens.css`, que nao e carregada pelo
entrypoint principal app-v2 e permanecia apenas como contrato visual historico
do redesign v1.

## Evidencia antes da remocao

Comando usado:

```bash
rg -n "tokens\\.css|assets/styles/tokens\\.css" index.html src public e2e vite.config.js package.json
```

Achados:

- `index.html` nao referencia `tokens.css`.
- `src/app-v2/**` nao importa `tokens.css`.
- `public/`, `e2e/`, `vite.config.js` e `package.json` nao referenciam
  `tokens.css`.
- As ocorrencias runtime restantes eram comentarios em `redesign.css`.
- `src/__tests__/internalVisualIdentity.test.js` lia `tokens.css` diretamente
  para validar a identidade visual antiga, nao o app-v2 principal.

## Arquivos alterados

- Removido: `src/assets/styles/tokens.css`
- Removido: `src/__tests__/internalVisualIdentity.test.js`
- Atualizado: `src/__tests__/legacyV1RemovalContracts.test.js`
- Atualizado: `src/assets/styles/redesign.css`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora do escopo

- Nao remover `components.css`, `redesign.css` ou CSS de Equipamentos.
- Nao tocar app-v2 visual.
- Nao tocar PDF/share, billing, auth, storage, router, upload, PMOC real ou
  orcamento real.

## Validacao esperada

```bash
npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/billingPricingCleanupContracts.test.js src/__tests__/legacyShellRetirementGate.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```
