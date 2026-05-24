# app-v2 - CP-41 remocao do CSS legado ux-polish

## Objetivo

Remover a folha legada `src/assets/styles/ux-polish.css`, que nao e carregada
pelo entrypoint principal app-v2 e permanecia apenas como camada visual
transversal do shell v1.

## Evidencia antes da remocao

Comandos usados:

```bash
rg -n "ux-polish\\.css|ux-polish" src index.html public e2e vite.config.js package.json docs/rewrite
rg -n "ux-polish\\.css|desktop-fonts\\.css|equipment-detail-cp-h\\.css|equipment-list-cp-i\\.css|layout\\.css|base\\.css|tokens\\.css" src index.html public e2e docs/rewrite vite.config.js package.json
```

Achados:

- `index.html` nao referencia `ux-polish.css`.
- `src/app-v2/**` nao importa `ux-polish.css`.
- Nao havia referencias runtime em `src/`, `public/`, `e2e/`, `vite.config.js`
  ou `package.json`.
- As ocorrencias restantes estavam em documentos historicos e no proprio arquivo
  CSS.

## Arquivos alterados

- Removido: `src/assets/styles/ux-polish.css`
- Atualizado: `src/__tests__/legacyV1RemovalContracts.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora do escopo

- Nao remover `components.css`, `redesign.css`, `layout.css`,
  `desktop-fonts.css`, `tokens.css` ou CSS de Equipamentos.
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
