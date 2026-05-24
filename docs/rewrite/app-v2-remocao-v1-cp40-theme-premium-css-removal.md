# app-v2 - CP-40 remocao do CSS legado theme-premium

## Objetivo

Remover a folha legada `src/assets/styles/theme-premium.css`, que nao e mais
carregada pelo entrypoint principal app-v2 e permanecia apenas como vestigio do
shell visual v1.

## Evidencia antes da remocao

Comandos usados:

```bash
rg -n "theme-premium\\.css|theme-premium|ct-premium|premium dark" src index.html public e2e docs vite.config.js package.json
rg -n "assets/styles|components\\.css|redesign\\.css|layout\\.css|theme-premium\\.css|styles/" src index.html vite.config.js docs/rewrite
```

Achados:

- `index.html` nao referencia `theme-premium.css`.
- `src/app-v2/**` nao importa `theme-premium.css`.
- Nao havia referencias runtime em `src/`, `public/`, `e2e/`, `vite.config.js`
  ou `package.json`.
- As ocorrencias restantes estavam em documentos historicos e no proprio arquivo
  CSS.

## Arquivos alterados

- Removido: `src/assets/styles/theme-premium.css`
- Atualizado: `src/__tests__/legacyV1RemovalContracts.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora do escopo

- Nao remover `components.css`, `redesign.css`, `layout.css`,
  `desktop-fonts.css`, `tokens.css`, `ux-polish.css` ou CSS de Equipamentos.
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
