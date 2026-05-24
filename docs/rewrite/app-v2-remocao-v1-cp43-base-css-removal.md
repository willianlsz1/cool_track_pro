# app-v2 - CP-43 remocao do CSS legado base

## Objetivo

Remover a folha legada `src/assets/styles/base.css`, que nao e carregada pelo
entrypoint principal app-v2 e permanecia como base visual do shell v1.

## Evidencia antes da remocao

Comando usado:

```bash
rg -n "base\\.css|assets/styles/base\\.css" index.html src public e2e vite.config.js package.json
```

Achados:

- `index.html` nao referencia `base.css`.
- `src/app-v2/**` nao importa `base.css`.
- `public/`, `e2e/`, `vite.config.js` e `package.json` nao referenciam
  `base.css`.
- As ocorrencias restantes em `src/` eram comentarios internos ou o proprio
  arquivo CSS.

## Arquivos alterados

- Removido: `src/assets/styles/base.css`
- Atualizado: `src/__tests__/legacyV1RemovalContracts.test.js`
- Atualizado: `src/assets/styles/components.css`
- Atualizado: `src/ui/components/onboarding/firstTimeExperience.css`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora do escopo

- Nao remover `components.css`, `redesign.css`, `layout.css`, `tokens.css` ou
  CSS de Equipamentos.
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
