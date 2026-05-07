# Mapeamento profundo — CoolTrack Pro

- Data: 2026-05-07
- Worktree: `/home/user/Cool_Track_Pro`
- Branch: `claude/deep-codebase-mapping-d5EUB`
- Commit: `b403168`

> Read-only. Nada em `src/`, configs ou `.env` foi modificado.
> `npm ci` foi executado para popular `node_modules` (deps locked, sem novas
> deps). `npm run build` rodou com sucesso (10.36s). Detalhes em §4.

---

## 0. Resumo executivo

| Indicador                        | Valor                                                           |
| -------------------------------- | --------------------------------------------------------------- |
| LOC total `src/` (todas exts)    | **141.106**                                                     |
| LOC `src/` exc. testes (.js+jsx) | **67.731**                                                      |
| LOC testes (`__tests__/`)        | **38.671** em **185** arquivos `.test.*`                        |
| LOC CSS (`src/assets/styles/`)   | **34.704** em 23 arquivos                                       |
| Arquivos JS                      | 381                                                             |
| Arquivos JSX                     | 88 (sem TS/TSX)                                                 |
| Total deps (prod+dev+opt)        | **22** declaradas → **428** instaladas (transitivas)            |
| `node_modules`                   | **327 MB**                                                      |
| Bundle `dist/` total             | **7,1 MB** (4,2 MB se excluir o PNG `cooling-tech.png` 1,9 MB)  |
| JS bundle gzip (entry+vendors)   | ~720 KB (entry 248 KB + vendor-pdf 238 KB + sentry 115 KB +     |
|                                  | charts 71 KB + supabase 52 KB)                                  |
| CSS gzip                         | 92 KB (index.css 86 KB + tailwind.css 6 KB)                     |
| Edge functions Supabase          | 7 (Stripe, Push, Nameplate AI, Export user data, Delete user)   |
| Tabelas Supabase                 | 14 (todas com RLS + policies próprias OU baseline_core_rls)     |
| Migrations SQL                   | 35 + 8 testes pgTAP                                             |
| Testes                           | 185 unit/integration (Vitest) + 12 e2e (Playwright)             |
| Risco geral (média §13)          | **2,7 / 5** — base sólida, gargalos focados em CSS, god-objects |
|                                  | de view (registro/equipamentos), bundle JS principal e prep     |
|                                  | multi-tenant.                                                   |

**Top 3 áreas para atacar primeiro:**

1. **God-objects de view (`src/ui/views/{equipamentos,registro,historico,dashboard}.js`)** — 4 arquivos somam **~7.700 LOC**, alto out-degree, 60+ try/catch. É o que mais dói pra qualquer refator (TS incremental, feature-sliced, etc).
2. **Bundle do entry principal (`index.*.js` 906 KB raw / 248 KB gzip)** — junto com `vendor-pdf` (758 KB / 238 KB gz), domina o TTI. Já há `manualChunks` e islands, mas o entry continua monolito; precisa code-split por rota.
3. **Schema multi-tenant** — hoje 100% das tabelas usam `user_id uuid` referenciando `auth.users(id)`. **Zero coluna `organization_id`/`tenant_id` em qualquer migration.** Para abrir B2B, cada tabela precisa de coluna de tenant + reescrita de RLS + backfill.

---

## 1. Stack e dependências

### Versão de Node esperada

`package.json` **não tem campo `engines`**. CI usa `node-version: 20` (em
`.github/workflows/ci.yml`). Worktree atual está em `v22.22.2`, npm `10.9.7`.
**Recomendação**: travar `engines.node` em `>=20 <23` pra evitar drift entre
local/CI/Cloudflare.

### Scripts de npm

| Script          | Comando                                         | Para que serve                               |
| --------------- | ----------------------------------------------- | -------------------------------------------- |
| `dev`           | `vite`                                          | Dev server (porta 5173, HMR)                 |
| `build`         | `vite build`                                    | Build produção (saída em `dist/`)            |
| `preview`       | `vite preview`                                  | Preview do `dist/`                           |
| `lint`          | `eslint .`                                      | Lint                                         |
| `lint:fix`      | `eslint . --fix`                                | Lint com autofix                             |
| `format`        | `prettier --write .`                            | Formata                                      |
| `format:check`  | `prettier --check .`                            | Verifica formato                             |
| `check`         | `npm run lint && format:check && test && build` | Gate de qualidade                            |
| `test`          | `vitest run`                                    | Suite unit/integration                       |
| `test:watch`    | `vitest`                                        | Watch mode                                   |
| `test:coverage` | `vitest run --coverage`                         | Coverage v8 — só `src/core/**` e `domain/**` |
| `test:changed`  | `vitest run --changed`                          | Apenas mudanças                              |
| `test:related`  | `vitest related --run`                          | Tests dependentes de arquivos modificados    |
| `test:fast`     | `vitest run --bail=1 --silent --reporter=dot`   | Smoke rápido                                 |
| `lint:css:dead` | `node scripts/dead-css-report.mjs`              | Auditoria de CSS morto                       |
| `css:proof`     | `node scripts/css-proof.mjs`                    | "Prova" de CSS                               |
| `prepare`       | `node .husky/install.mjs`                       | Husky                                        |
| `test:e2e`      | `playwright test -c e2e/playwright.config.js`   | E2E (Playwright)                             |
| `test:e2e:ci`   | `playwright test --reporter=github`             | E2E em CI                                    |

### `dependencies` (7 prod)

| Dep                     | Versão   | Categoria             |
| ----------------------- | -------- | --------------------- |
| `@supabase/ssr`         | ^0.10.2  | database/auth (SSR)   |
| `@supabase/supabase-js` | ^2.103.0 | database/auth         |
| `chart.js`              | ^4.4.2   | ui-component (charts) |
| `jspdf`                 | ^4.2.1   | util (PDF)            |
| `jspdf-autotable`       | ^5.0.7   | util (PDF tables)     |
| `react`                 | ^18.3.1  | framework             |
| `react-dom`             | ^18.3.1  | framework             |

### `devDependencies` (15)

| Dep                        | Versão  | Categoria       |
| -------------------------- | ------- | --------------- |
| `@eslint/js`               | ^10.0.1 | lint            |
| `@playwright/test`         | ^1.59.1 | test (e2e)      |
| `@vitejs/plugin-react`     | ^4.7.0  | build           |
| `@vitest/coverage-v8`      | ^2.1.8  | test (coverage) |
| `autoprefixer`             | ^10.5.0 | build (CSS)     |
| `axe-core`                 | ~4.10.0 | test (a11y)     |
| `eslint`                   | ^10.2.1 | lint            |
| `eslint-config-prettier`   | ^10.1.8 | lint/format     |
| `globals`                  | ^17.4.0 | lint            |
| `jsdom`                    | ^25.0.1 | test            |
| `postcss`                  | ^8.5.12 | build (CSS)     |
| `prettier`                 | ^3.8.1  | format          |
| `rollup-plugin-visualizer` | ^7.0.1  | build/analyzer  |
| `supabase`                 | ^2.89.1 | database (CLI)  |
| `tailwindcss`              | ^3.4.19 | build (CSS)     |
| `vite`                     | ^5.4.21 | build           |
| `vitest`                   | ^2.1.8  | test            |

### `optionalDependencies` (5)

- 4 binários `@rollup/rollup-*` para Linux/Darwin/Windows
- `@sentry/browser ^8.55.1` — observabilidade carregada via `import('@sentry/browser')` lazy em `src/core/observability.js`

### Lockfile

- `package-lock.json` (npm v3+ format). 156 entradas com `resolved`. Sem
  `yarn.lock` ou `pnpm-lock.yaml`.

### Tamanho

- `node_modules`: **327 MB** (428 packages instalados em disco)
- 22 deps top-level → ratio ~19 deps transitivas/declarada (saudável pra um
  projeto Vite + React + Supabase + jsPDF + Chart.js).

### Observações

- **Sem TypeScript.** Sem `typescript`, `tsconfig.json`, `*.ts*` em `src/`.
  Migração TS é projeto à parte (zero regressão, mas zero ganho enquanto não
  começa).
- **Sem Stylelint.** Há scripts artesanais em `scripts/css-proof.mjs` e
  `dead-css-report.mjs`. Considerar Stylelint quando o CSS legado (§4) for
  consolidado.
- Sentry é optionalDep — gera vendor chunk de 333 KB (114 KB gz). Se o DSN
  não estiver setado, o módulo é importado mas não inicializa.

---

## 2. Estrutura de arquivos

### LOC por extensão (em `src/`)

| Extensão  | Arquivos | LOC         |
| --------- | -------- | ----------- |
| `.js`     | 381      | 88.693      |
| `.jsx`    | 88       | 17.709      |
| `.ts`     | 0        | 0           |
| `.tsx`    | 0        | 0           |
| `.css`    | 23       | 34.704      |
| `.html`   | 0        | 0           |
| **TOTAL** | **492**  | **141.106** |

LOC por subdiretório (excluindo testes):

| Diretório        | LOC    | Comentário                              |
| ---------------- | ------ | --------------------------------------- |
| `src/ui/`        | 37.794 | Vanilla JS — controllers/views/modais   |
| `src/react/`     | 11.532 | React islands + landing                 |
| `src/core/`      | 9.345  | State, storage, auth, plans, telemetria |
| `src/domain/`    | 8.394  | PMOC, PDF, maintenance, nameplate AI    |
| `src/__tests__/` | 38.671 | 185 arquivos de teste                   |

### Top 30 arquivos por LOC

| LOC    | Arquivo                                               |
| ------ | ----------------------------------------------------- |
| 22.830 | `src/assets/styles/components.css`                    |
| 2.746  | `src/ui/views/equipamentos.js`                        |
| 2.021  | `src/assets/styles/redesign.css`                      |
| 1.997  | `src/ui/views/registro.js`                            |
| 1.652  | `src/ui/views/historico.js`                           |
| 1.294  | `src/ui/views/dashboard.js`                           |
| 1.240  | `src/ui/components/authscreen.js`                     |
| 1.222  | `src/ui/components/nameplateCapture.js`               |
| 1.165  | `src/ui/shell/templates/modals.js`                    |
| 1.138  | `src/assets/styles/layout.css`                        |
| 1.122  | `src/assets/styles/components/_pricing.css`           |
| 1.115  | `src/domain/pmoc/checklistTemplates.js`               |
| 1.069  | `src/assets/styles/theme-premium.css`                 |
| 1.032  | `src/react/pages/ClientesPage.jsx`                    |
| 990    | `src/ui/shell/templates/views.js`                     |
| 848    | `src/assets/styles/components/_pmoc.css`              |
| 846    | `src/assets/styles/components/_setor-modal.css`       |
| 838    | `src/ui/views/relatorio.js`                           |
| 823    | `src/ui/views/conta.js`                               |
| 821    | `src/assets/styles/components/_setor-card.css`        |
| 790    | `src/react/pages/landing/icons/landingIcons.jsx`      |
| 786    | `src/domain/maintenance.js`                           |
| 714    | `src/ui/controller/handlers/reportExportHandlers.js`  |
| 677    | `src/domain/pdf/sections/cover.js`                    |
| 666    | `src/assets/styles/desktop-fonts.css`                 |
| 664    | `src/__tests__/equipamentosView.hero.test.js`         |
| 622    | `src/ui/views/pricing.js`                             |
| 620    | `src/ui/components/orcamentoSignaturePage.js`         |
| 602    | `src/__tests__/registroPostSaveLegacyFlow.test.js`    |
| 600    | `src/__tests__/registroLegacyChecklistRender.test.js` |

### Arquivos > 1.000 linhas (candidatos a quebrar)

```
22.830  src/assets/styles/components.css           ← gigante absoluto, CSS legado
 2.746  src/ui/views/equipamentos.js               ← view god-object
 2.021  src/assets/styles/redesign.css
 1.997  src/ui/views/registro.js                   ← view god-object
 1.652  src/ui/views/historico.js                  ← view god-object
 1.294  src/ui/views/dashboard.js                  ← view god-object
 1.240  src/ui/components/authscreen.js
 1.222  src/ui/components/nameplateCapture.js
 1.165  src/ui/shell/templates/modals.js
 1.138  src/assets/styles/layout.css
 1.122  src/assets/styles/components/_pricing.css
 1.115  src/domain/pmoc/checklistTemplates.js      ← dado, talvez ok
 1.069  src/assets/styles/theme-premium.css
 1.032  src/react/pages/ClientesPage.jsx           ← maior componente React
```

### Tree de pastas (2-3 níveis em `src/`)

```
src/
├── __tests__/
│   ├── contracts/           (3 arquivos — selectors/routes/storage-shape)
│   ├── core/                (2)
│   ├── exploratory/         (2)
│   ├── helpers/             (mocks)
│   └── regressions/         (3)
├── assets/
│   └── styles/
│       └── components/      (CSS modular)
├── core/                    (state, storage, auth, plans, observability…)
│   ├── plans/               (5 — monetization, planCache, subscriptionPlans…)
│   └── storage/             (9 — remote, normalizers, syncState, migrations)
├── domain/                  (lógica de negócio pura — testável)
│   ├── constants/
│   ├── pdf/
│   │   └── pmoc/
│   ├── pmoc/
│   └── (~16 arquivos top-level)
├── features/                (profile, userData)
├── react/
│   ├── components/
│   │   └── ui/
│   ├── entrypoints/         (23 islands — bridge React ↔ shell vanilla)
│   ├── pages/
│   │   └── landing/         (data, components, icons)
│   ├── shared/              (vazio)
│   └── styles/              (tailwind.css)
├── ui/                      (vanilla — shell + views legacy)
│   ├── components/
│   │   ├── onboarding/
│   │   └── signature/
│   ├── composables/         (header, registroContext)
│   ├── controller/
│   │   ├── handlers/        (handlers de eventos por view)
│   │   └── helpers/
│   ├── helpers/
│   ├── shell/
│   │   └── templates/       (modals.js + views.js — HTML renderado)
│   ├── viewModels/          (bridge entre core+domain e a view)
│   └── views/               (clientes, dashboard, equipamentos, registro…)
└── app.js                   (entry — bootstrap)
```

**Padrão arquitetural identificado:** vanilla legacy (`src/ui/`) +
React islands (`src/react/entrypoints/`) montados sobre os mesmos
viewModels (`src/ui/viewModels/`). Migração incremental React em
andamento (vide `docs/migration/*-react-prep.md`).

---

## 3. Dependency graph

### Top 15 god-objects por out-degree (mais imports estáticos)

| imports | arquivo                                              |
| ------- | ---------------------------------------------------- |
| 40      | `src/ui/views/equipamentos.js`                       |
| 29      | `src/app.js`                                         |
| 27      | `src/ui/views/registro.js`                           |
| 26      | `src/ui/views/dashboard.js`                          |
| 16      | `src/ui/views/historico.js`                          |
| 16      | `src/ui/controller/handlers/reportExportHandlers.js` |
| 15      | `src/ui/controller/routes.js`                        |
| 15      | `src/ui/controller/handlers/navigationHandlers.js`   |
| 13      | `src/ui/views/clientes.js`                           |
| 13      | `src/ui/controller.js`                               |
| 12      | `src/ui/views/conta.js`                              |
| 12      | `src/domain/pdf.js`                                  |
| 12      | `src/core/storage.js`                                |
| 11      | `src/ui/views/relatorio.js`                          |
| 11      | `src/ui/controller/handlers/orcamentoHandlers.js`    |

### Top 15 hubs por in-degree (mais importados — por basename)

> Aproximação por basename de arquivo importado em paths relativos.
> Caveat: `constants.js` e `primitives.js` aparecem múltiplas vezes
> com a mesma contagem porque o casamento por basename não distingue
> qual `constants.js` específico está sendo importado.

| importadores | arquivo                                   | tipo                  |
| ------------ | ----------------------------------------- | --------------------- |
| 56           | `src/core/utils.js`                       | helpers gerais        |
| 37           | `src/ui/viewModels/dashboardContracts.js` | contrato VM           |
| 36           | `src/core/state.js`                       | state global          |
| 34           | `src/core/toast.js`                       | toast                 |
| 31           | `src/core/modal.js`                       | modal                 |
| 30           | `src/core/router.js`                      | router                |
| 28\*         | `src/ui/views/equipamentos/constants.js`  | (basename)            |
| 28\*         | `src/domain/pdf/constants.js`             | (basename)            |
| 22           | `src/core/supabase.js`                    | client Supabase       |
| 22           | `src/core/plans/subscriptionPlans.js`     | catálogo de planos    |
| 21           | `src/core/errors.js`                      | errors + handleError  |
| 20           | `src/ui/shell/templates/views.js`         | templates HTML        |
| 20           | `src/core/telemetry.js`                   | telemetria            |
| 17           | `src/ui/views/registro.js`                | (registro também é    |
|              |                                           | importado em vários   |
|              |                                           | controllers/handlers) |
| 17           | `src/domain/maintenance.js`               | regras de manutenção  |
| 15           | `src/features/profile.js`                 | profile (técnico)     |

### Dependência circular

`madge` **não está disponível** (`devDep` não declarada; `npx madge` falha
no sandbox). **Detecção circular ficou pendente** — recomenda-se rodar
manualmente:

```
npx -y madge --circular src/
# ou
npx -y dependency-cruiser --output-type err src/
```

### Avisos do build sobre import dinâmico vs estático

```
src/ui/views/orcamentos.js
  é importado dinamicamente por src/ui/controller/routes.js
  e estaticamente por src/ui/components/orcamentoModal.js + handlers/orcamentoHandlers.js
  → Vite não consegue mover para chunk separado.

src/ui/controller/handlers/orcamentoHandlers.js
  é importado dinamicamente por src/ui/components/orcamentoModal.js
  e estaticamente por src/ui/controller.js
  → Mesmo problema.
```

→ Limpar essa duplicidade libera 2 chunks "órfãos" no entry principal.

---

## 4. Bundle analysis

`npm run build` (Vite 5.4.21, esbuild minify, manualChunks ativo)
✅ sucesso em **10,36 s**.

### Tamanhos de saída

| Métrica                             | Valor                              |
| ----------------------------------- | ---------------------------------- |
| `dist/` total                       | **7,1 MB**                         |
| `dist/assets/` total                | 5,4 MB                             |
| Total JS em `dist/assets/`          | 3,0 MB raw (43 chunks)             |
| Total CSS                           | 568 KB raw (2 arquivos)            |
| `cooling-tech.png` (asset estático) | 1,9 MB ⚠️ **maior asset do build** |

### Top 15 arquivos do `dist/assets/` por tamanho

| Tamanho raw | gzip   | Arquivo                           |
| ----------- | ------ | --------------------------------- |
| 906 KB      | 248 KB | `index.*.js` (entry app)          |
| 758 KB      | 238 KB | `vendor-pdf.*.js` (jspdf+canvg+…) |
| 532 KB      | 86 KB  | `index.*.css`                     |
| 333 KB      | 114 KB | `vendor-sentry.*.js`              |
| 203 KB      | 71 KB  | `vendor-charts.*.js` (chart.js)   |
| 193 KB      | 52 KB  | `vendor-supabase.*.js`            |
| 139 KB      | 45 KB  | `client.*.js`                     |
| 80 KB       | 20 KB  | `landingIsland.*.js`              |
| 33 KB       | 6 KB   | `tailwind.*.css`                  |
| 25 KB       | 9 KB   | `pdf.*.js`                        |
| 24 KB       | 9 KB   | `pmocReport.*.js`                 |
| 23 KB       | 9 KB   | `purify.es.*.js` (DOMPurify)      |
| 22 KB       | 6 KB   | `clientesIsland.*.js`             |
| 16 KB       | 4 KB   | `orcamentoSignaturePage.*.js`     |
| 14 KB       | 4 KB   | `relatorioCardsIsland.*.js`       |

### Chunks lazy (islands)

23 entrypoints em `src/react/entrypoints/` produziram 23 chunks lazy:
`alertasIsland`, `clientesIsland`, `dashboardHeroIsland`, …,
`registroSignatureIsland`, `relatorioCardsIsland`,
`relatorioControlsIsland`, etc. Todos < 22 KB raw.

### Status do bundle vs monolítico

- ✅ **vendors separados** (jspdf, sentry, charts, supabase) — bom para cache.
- ✅ **23 islands lazy** — bom para TTI quando o usuário não visita a view.
- ⚠️ **`index.*.js` com 906 KB raw / 248 KB gzip** continua sendo o gargalo:
  carrega imediato, contém o shell vanilla (`src/ui/`) inteiro.
- ⚠️ **`vendor-pdf.*.js` 238 KB gzip** está no entry chunk graph porque
  algum import estático do PDF está vindo do shell. Idealmente jspdf só
  carrega quando o usuário abre o relatório.

### Visualizer

`rollup-plugin-visualizer` está em `devDependencies` mas só roda quando
`ANALYZE=true npm run build` (vide `vite.config.js:5,23-43`). **`dist/bundle-stats.html` não foi gerado** neste build.

### Recomendações de bundle

1. Mover imports estáticos de `jspdf` para dynamic `import()` nos handlers de export (PDF abre só quando o usuário clica).
2. Quebrar o entry: `src/ui/views/{equipamentos,registro,historico,dashboard}.js` representam ~7.700 LOC que poderiam virar chunks lazy de rota.
3. Resolver o aviso de "static + dynamic import" em `orcamentos.js` e `orcamentoHandlers.js` — chunks órfãos somam ~10 KB no entry hoje.
4. Imagem `cooling-tech.png` (1,9 MB): converter para WebP/AVIF + responsive `<picture>` (potencial: 1,9 MB → 200-300 KB).

---

## 5. JS hotspots

### Top 15 arquivos por # de declarações de função/const top-level

> Proxy de "god-object" — mais declarações = mais responsabilidade num arquivo.

| #decls | arquivo                                   |
| ------ | ----------------------------------------- |
| 105    | `src/ui/views/registro.js`                |
| 94     | `src/ui/components/nameplateCapture.js`   |
| 87     | `src/ui/views/dashboard.js`               |
| 68     | `src/ui/views/equipamentos.js`            |
| 65     | `src/ui/views/historico.js`               |
| 47     | `src/ui/views/conta.js`                   |
| 44     | `src/domain/maintenance.js`               |
| 41     | `src/ui/views/relatorio.js`               |
| 40     | `src/react/pages/ClientesPage.jsx`        |
| 38     | `src/core/photoStorage.js`                |
| 37     | `src/ui/shell.js`                         |
| 35     | `src/domain/pdf/sections/services.js`     |
| 35     | `src/core/router.js`                      |
| 33     | `src/ui/viewModels/dashboardViewModel.js` |
| 33     | `src/core/plans/subscriptionPlans.js`     |

### Profundidade de nesting (>= 24 espaços / ~6 níveis)

Apenas **2 arquivos** atingem nesting de 6+ níveis — sinal saudável:

```
26  src/react/pages/DashboardReadOnlyBlocks.jsx
24  src/ui/shell/templates/views.js
```

Não foram encontrados arquivos com nesting absurdo (≥10 níveis).

### TODOs / FIXMEs / HACKs

Praticamente **inexistentes**:

```
src/domain/pdf/pmoc/sections/plano.js   // futuro via profile.plano_manutencao_custom (TODO Fase 5+).
```

Nenhum `FIXME`, `XXX`, `HACK`, `WIP`, `BUG`, `@deprecated` real foi encontrado em `src/`.
A maioria dos hits para "TODO" são a palavra **TODOS** (português) em comentários
ou strings de UI ("vai remover TODOS os equipamentos"). Os patterns "BUG-CT-001/002/003"
estão documentados em `BUGS-FOUND.md`, não no código.

→ Disciplinado. Ou todas as dívidas foram extraídas para docs (README, `docs/audits/`,
`BUGS-FOUND.md`), ou marcadores foram removidos como política. Vide §12.

---

## 6. Schema Supabase + RLS

### Estrutura encontrada

- 35 migrations SQL em `supabase/migrations/` (timestamps 2026-04-11 → 2026-04-26)
- 8 testes pgTAP em `supabase/tests/` (`01_user_has_plus_plan` … `08_stripe_webhook_stuck_recovery`)
- 7 Edge Functions em `supabase/functions/`:
  `analyze-nameplate`, `create-checkout-session`, `create-portal-session`,
  `delete-user-account`, `export-user-data`, `send-push-alerts`, `stripe-webhook`
- 1 dashboard `supabase/dashboard-queries.sql` (queries operacionais ad-hoc)

### Tabelas detectadas (14)

| Tabela                    | RLS   | Coluna ownership               | Migration que criou                          |
| ------------------------- | ----- | ------------------------------ | -------------------------------------------- |
| `equipamentos`            | ✅    | `user_id` (FK auth.users)      | `20260411000000_baseline_core_tables.sql`    |
| `registros`               | ✅    | `user_id` (FK auth.users)      | `20260411000000_baseline_core_tables.sql`    |
| `tecnicos`                | ✅    | `user_id` (FK auth.users)      | `20260411000000_baseline_core_tables.sql`    |
| `profiles`                | ✅    | `user_id` PK (FK auth.users)   | `20260411000001_security_subscription_usage` |
| `usage_monthly`           | ✅    | `user_id` (FK auth.users)      | `20260411000001_security_subscription_usage` |
| `feedback`                | ✅    | `user_id` (nullable, set null) | `20260414000000_feedback.sql`                |
| `push_subscriptions`      | ✅    | `user_id` PK (FK auth.users)   | `20260415000000_push_subscriptions.sql`      |
| `setores`                 | ✅    | `user_id` (FK auth.users)      | `20260418140000_setores.sql`                 |
| `analytics_events`        | ✅    | `user_id` (nullable, set null) | `20260419120000_analytics_events.sql`        |
| `stripe_webhook_events`   | ✅    | `user_id` (nullable)           | `20260420160000_stripe_webhook_idempotency`  |
| `ai_usage_cost`           | ✅    | `user_id` (FK auth.users)      | `20260421140000_ai_usage_cost.sql`           |
| `clientes` (PMOC)         | ✅    | `user_id` (FK auth.users)      | `20260425120000_pmoc_clientes_empresa.sql`   |
| `orcamentos`              | ✅    | `user_id` (FK auth.users)      | `20260426160000_orcamentos.sql`              |
| `equipamentos.componente` | (col) | (não é tabela; coluna nova)    | `20260426120000_equipamentos_componente.sql` |

Plus storage bucket `registro-fotos` com policies próprias em
`20260424120000_relatorios_bucket.sql` e
`20260420130000_enforce_photo_plan_gate.sql`.

### RLS e policies

- **`alter table … enable row level security`** em todas as 14 tabelas
  (incluindo loop dinâmico em `20260425140000_baseline_core_rls.sql` que
  garante RLS para `equipamentos`/`registros`/`tecnicos` se as policies
  foram pré-existentes).
- **34 `create policy`** explícitos (4 por tabela base — select/insert/update/delete `_own` — via `auth.uid() = user_id`).
- Modelo de policy padrão: `using (auth.uid() = user_id) with check (auth.uid() = user_id)`.

### Multi-tenant readiness

> **Não há nenhuma coluna `organization_id`, `tenant_id`, `company_id`
> ou `account_id` em nenhuma migration.**

| Tabela                  | Tem `org_id`/`tenant_id`? |
| ----------------------- | ------------------------- |
| `equipamentos`          | ❌ — só `user_id`         |
| `registros`             | ❌ — só `user_id`         |
| `tecnicos`              | ❌ — só `user_id`         |
| `setores`               | ❌ — só `user_id`         |
| `clientes`              | ❌ — só `user_id`         |
| `orcamentos`            | ❌ — só `user_id`         |
| `profiles`              | ❌ — só `user_id`         |
| `usage_monthly`         | ❌ — só `user_id`         |
| `analytics_events`      | ❌                        |
| `feedback`              | ❌                        |
| `push_subscriptions`    | ❌                        |
| `ai_usage_cost`         | ❌                        |
| `stripe_webhook_events` | ❌                        |

→ Migração para multi-tenant (B2B) requer:

1. Criar `organizations` + `org_members` (bridge) com role.
2. Adicionar coluna `organization_id` em **todas as 13 tabelas operacionais**.
3. Backfill: `organization_id = (select id from organizations where owner_user_id = legacy.user_id)`.
4. Reescrever todas as policies de `auth.uid() = user_id` para `is_member_of(auth.uid(), organization_id)`.
5. Atualizar o JS (`src/core/storage/storageRemoteSync.js`, `src/core/storage/remote.js`, `src/core/orcamentos.js`, `src/core/photoStorage.js`) para enviar `organization_id`.

Esforço estimado: **PR grande mas linear** — pgTAP existente facilita.

### Indexes

27 indexes criados:

- `equipamentos`: `user_id_idx`, `setor_id_idx`, `cliente_id_idx`
- `registros`: `user_id_idx`, `equip_id_idx`, `data_idx (desc)`, `idx_registros_checklist`
- `setores`: `user_id_idx`, `cliente_id_idx`
- `clientes`: `user_id_idx`
- `tecnicos`: `user_id_idx`
- `profiles`: PK
- `usage_monthly`: unique `user_month_resource_uk`
- `feedback`: `created_at_idx`
- `analytics_events`: `name_created_at_idx`, `session_idx`, `user_idx`
- `ai_usage_cost`: `user_id_created_at_idx`, `resource_created_at_idx`
- `stripe_webhook_events`: `received_at_idx`, `customer_id_idx`, `user_id_idx`, `stuck_lookup_idx`
- `orcamentos`: `user_id_idx`, `status_idx`, `created_at_idx (desc)`, `share_token_idx`

→ Todas as FKs comuns têm índice. Quando o `organization_id` for adicionado,
não esquecer de fazer index composto `(organization_id, user_id)` para ainda
suportar listagens "do usuário".

### Triggers (8)

- `enforce_setores_pro_gate_trigger` — bloqueia `setores` em planos sem Pro
- `enforce_photo_plan_gate_trigger` — bloqueia upload de foto no Free
- `protect_profile_fields_trigger` + `protect_profile_insert_trigger`
- `trg_clientes_updated_at`
- `enforce_equipamentos_limit_trigger` — quota por plano
- `enforce_registros_monthly_limit_trigger` — quota mensal
- `on_auth_user_created` — auto-cria `profiles` (boa prática, evita
  inconsistência depois).

### Uso da API JS Supabase em `src/`

Tabelas acessadas via `supabase.from(...)`:

| Tabela               | Onde é usada                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `equipamentos`       | `src/core/storage/{remote,storageRemoteSync}.js`                    |
| `registros`          | `src/core/photoStorage.js`, `storage/{remote,storageRemoteSync}.js` |
| `tecnicos`           | `src/core/storage/{remote,storageRemoteSync}.js`                    |
| `setores`            | `src/core/storage/storageRemoteSync.js`                             |
| `clientes`           | `src/core/storage/storageRemoteSync.js`                             |
| `feedback`           | `src/ui/components/supportFeedbackModal.js`                         |
| `push_subscriptions` | `src/core/pushNotifications.js`                                     |

RPCs chamadas:

| RPC                       | Onde                     |
| ------------------------- | ------------------------ |
| `get_orcamento_by_token`  | `src/core/orcamentos.js` |
| `sign_orcamento_by_token` | `src/core/orcamentos.js` |

Storage (`supabase.storage.from(bucket)`):

- `src/core/photoStorage.js` (upload + signed URL — bucket `registro-fotos`)
- `src/core/signatureStorage.js` (upload — bucket `registro-fotos`/assinaturas)

→ Pontos de migração para multi-tenant: 5 arquivos JS principais (`storage/remote.js`, `storage/storageRemoteSync.js`, `photoStorage.js`, `signatureStorage.js`, `orcamentos.js`).

---

## 7. Persistência local

### `localStorage` keys (constantes declaradas, fora de testes)

Total: **34** chaves distintas declaradas via `const … = '…'`.

| Key (string)                                             | Arquivo onde é declarada                                              | Propósito                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| `cooltrack_v3` (`STORAGE_KEY`)                           | `src/core/utils.js`                                                   | **Snapshot principal do app** (estado completo)     |
| `cooltrack-sync-dirty-v1`                                | `src/core/storage.js`, `src/core/storage/constants.js`                | flag de sync pendente                               |
| `cooltrack-sync-deletions-v1`                            | `src/core/storage.js`, `src/core/storage/constants.js`                | tombstones para sync                                |
| `cooltrack-cache-owner-v1`                               | `src/core/storage.js`, `src/core/storage/constants.js`                | id do user dono do cache atual (evita vazamento)    |
| `cooltrack-migrated-${userId}`                           | `src/core/storage.js` (gerado dinamicamente)                          | flag idempotente da migração legacy → Supabase      |
| `cooltrack-cached-plan`                                  | `src/core/plans/planCache.js`                                         | cache do plano (Free/Pro/Plus) p/ render imediato   |
| `cooltrack-dev-plan-override`                            | `src/core/plans/devPlanOverride.js`                                   | dev tool — força plano                              |
| `cooltrack-dev-mode`                                     | `src/app.js`, `core/plans/{monetization,planCache,subscriptionPlans}` | dev mode flag                                       |
| `cooltrack-error-log`                                    | `src/core/errors.js`                                                  | log de erros local (até 50)                         |
| `cooltrack-oauth-pending-v1`                             | `src/core/auth.js`                                                    | estado pré-OAuth (intent, redirect)                 |
| `cooltrack-photo-pending-upload`                         | `src/core/photoStorage.js`                                            | fila de fotos a enviar quando voltar online         |
| `cooltrack-sig-pending-upload`                           | `src/core/signatureStorage.js`                                        | fila de assinaturas a enviar                        |
| `cooltrack-pmoc-num`\*                                   | `src/domain/pdf/pmoc/pmocReport.js` (PREFIX)                          | numeração PMOC por cliente                          |
| `cooltrack-bundle-recovery-attempted`                    | `src/core/recoverFromStaleBundle.js`                                  | flag p/ evitar loop de recovery                     |
| `cooltrack-profile`                                      | `src/features/profile.js`                                             | perfil do técnico (legacy global; vide userStorage) |
| `cooltrack-last-tecnico`                                 | `src/features/profile.js`                                             | último técnico selecionado                          |
| `cooltrack-equip-view-mode`                              | `src/ui/controller/helpers/themeInitHelpers.js`                       | grid/lista no equipamentos                          |
| `cooltrack_nav_mode`                                     | `src/ui/shell/navigationMode.js`                                      | nav mode (drawer/tabs)                              |
| `cooltrack-sig-cleanup-done`                             | `src/ui/components/signature/signature-storage.js` (sessionStorage)   | flag de limpeza única                               |
| `cooltrack-ftx-done` / `-skipped`                        | `src/ui/components/onboarding/firstTimeExperience.js`                 | first-time experience (FTX) global                  |
| `ct-ftx-done:` / `ct-ftx-skipped:` (PREFIX)              | `src/ui/components/onboarding/firstTimeExperience.js`                 | FTX por usuário                                     |
| `cooltrack-feedback-history`                             | `src/ui/components/supportFeedbackModal.js`                           | histórico local de feedback                         |
| `cooltrack-hist-period` / `-tipo` / `-summary-collapsed` | `src/ui/views/historico.js`                                           | filtros persistidos                                 |
| `cooltrack-post-auth-redirect`                           | `src/app.js`, `src/ui/components/authscreen.js`                       | rota intent pós-login                               |
| `cooltrack-tour-done` + `ct-tour-done:` PREFIX           | `src/ui/components/tour.js`                                           | tour de onboarding                                  |
| `ct:install-prompt-dismissed`                            | `src/ui/components/installAppPrompt.js`                               | dismiss do PWA install                              |
| `cooltrack:overflow-onboarded`                           | `src/ui/components/overflowBanner.js`                                 | overflow onboarding                                 |
| `cooltrack-highlight-id`                                 | `src/ui/components/onboarding/savedHighlight.js`                      | highlight visual                                    |
| `cooltrack-editing-id`                                   | `src/ui/views/registro.js`                                            | id do registro em edição                            |
| `cooltrack-last-client`                                  | `src/ui/views/registro.js`                                            | último cliente selecionado                          |
| `cooltrack-pdf-preview`                                  | `src/ui/controller/handlers/reportExportHandlers.js`                  | preview state                                       |
| `__cooltrackLandingReactRoot`                            | `src/react/entrypoints/landingIsland.jsx`                             | flag interna React                                  |

### Convenção `userStorage` (escopo por usuário)

`src/core/userStorage.js` introduz wrapper `ct:<userId>:<key>` pra **chaves
críticas que vazam entre contas** (FTX, plano cache, último técnico).
Estado: **migração incremental em andamento.** Globais antigos como
`cooltrack-profile` (perfil do técnico!) e `cooltrack-last-tecnico` ainda
NÃO usam o wrapper — risco de vazamento entre logins no mesmo navegador.

→ **Recomendação**: completar a migração para `userStorage` em todas as
chaves de domínio (perfil, último cliente em `registro.js`, filtros do
`historico.js`, etc).

### Estado serializado em `cooltrack_v3`

```js
// src/core/state.js
const INITIAL_STATE = {
  equipamentos: [], // ← coleção principal
  registros: [], // ← coleção principal (com fotos referenciadas)
  tecnicos: [],
  setores: [],
  clientes: [],
  orcamentos: [],
};
```

Persistência: `JSON.stringify(state)` escrito em `localStorage[STORAGE_KEY]`
em cada `Storage.persist()` (`src/core/storage.js`).

### Estimativa de tamanho

`src/core/utils.js` tem helper que itera `Object.keys(localStorage)` e
soma `(value.length * 2)` (UTF-16 bytes). Não foi possível medir dados
reais sem dataset de produção.

**Risco qualitativo de bater no limite (~5-10 MB típico):**

- **Antes**: alto. Fotos vinham embutidas em `registros[i].fotos` como
  base64 (cada foto ≈ 200 KB-2 MB → 5-10 fotos saturam).
- **Hoje**: **mitigado**. Pipeline de fotos foi migrado para upload
  imediato no Supabase Storage + URL no estado (`src/core/photoStorage.js`
  - `src/core/storage/storageMigrations.js`). Há fluxo offline via
    `cooltrack-photo-pending-upload` (queue) + IndexedDB blob queue (vide
    abaixo).
- **Resíduo**: registros legacy migrados via `migrateLegacyPhotosInState()`.
  Há observabilidade em `failedCount`. Para usuários que nunca
  re-sincronizam, ainda há risco.

### IndexedDB

Usado em **2 lugares**:

| Database               | Store           | Arquivo                     | Uso                                                                  |
| ---------------------- | --------------- | --------------------------- | -------------------------------------------------------------------- |
| `cooltrack-blob-queue` | `photo-pending` | `src/core/blobQueue.js`     | **Fotos** Blob nativas pendentes de upload (sem inflação base64).    |
| `cooltrack-telemetry`  | (default)       | `src/core/telemetrySink.js` | **Telemetria** offline para envio em batch quando recuperar conexão. |

**Lib**: nativo `indexedDB.open()`, sem Dexie/idb. Wrapper próprio.
Fallback em memória (`Map`) para jsdom/Safari private mode.

### Migrações de schema (localStorage → Supabase)

`src/core/storage.js#migrateIfNeeded(userId)`:

- Idempotente (flag `cooltrack-migrated-${userId}` evita re-rodar).
- Lê snapshot `cooltrack_v3` local, faz upsert em massa nas tabelas remotas.
- Migração de fotos legacy (base64 → bucket) feita em background async com
  retry e count de falhas.

→ Lógica robusta. **Ponto fraco**: se um cliente tem snapshot grande e
migração quebra no meio, o flag `migrated` pode ficar inconsistente.
Sem teste explícito de "migração quebrou parcial" hoje (vide
`src/__tests__/storage.integration.test.js`).

---

## 8. Testes

### Numéricos

| Métrica                      | Valor                                               |
| ---------------------------- | --------------------------------------------------- |
| Arquivos `.test.*` em `src/` | **185** (159 `.test.js` + 26 `.test.jsx`)           |
| Linhas totais de teste       | 38.625                                              |
| Tamanho médio                | ~209 LOC/teste                                      |
| Maior teste                  | `src/__tests__/equipamentosView.hero.test.js` (664) |
| pgTAP testes (Supabase)      | 8 (`supabase/tests/01..08`)                         |
| E2E (Playwright)             | 12 specs em `e2e/specs/`                            |
| Coverage atual no disco      | ❌ (sem `coverage/` — não rodado neste worktree)    |

### Frameworks

- **Vitest 2.1.8** (`environment: jsdom`, globals on)
- **@vitest/coverage-v8 2.1.8** — coverage limitado a `src/core/**` e
  `src/domain/**` (vide `vite.config.js:88-90`)
- **Playwright 1.59.1** — config em `e2e/playwright.config.js`
- **axe-core 4.10.0** — usado em **1 teste** de a11y:
  `src/__tests__/landingPage.a11y.test.js`

### E2E specs

```
e2e/specs/
├── core-flow-smoke.spec.js
├── equipamentos-legacy-photos-nameplate-paywall.spec.js
├── equipamentos-visual-smoke.spec.js
├── historico-functional-smoke.spec.js
├── navigation-and-modal.spec.js
├── orcamentos-visual-smoke.spec.js
├── react-islands-lifecycle.spec.js
├── registro-post-save.spec.js
├── registro-visual-smoke.spec.js
├── relatorio-export-pmoc.spec.js
├── relatorio-visual-smoke.spec.js
└── unicode-escapes.spec.js
```

### Top 10 maiores testes

| LOC | Arquivo                                                      |
| --- | ------------------------------------------------------------ |
| 664 | `src/__tests__/equipamentosView.hero.test.js`                |
| 602 | `src/__tests__/registroPostSaveLegacyFlow.test.js`           |
| 600 | `src/__tests__/registroLegacyChecklistRender.test.js`        |
| 581 | `src/__tests__/equipamentosLegacyRender.test.js`             |
| 523 | `src/__tests__/router.test.js`                               |
| 511 | `src/__tests__/relatorioExportPmocLegacyHandlers.test.js`    |
| 499 | `src/__tests__/registroPdfWhatsappLegacyContracts.test.js`   |
| 498 | `src/__tests__/registroSaveSignatureHandlers.test.js`        |
| 485 | `src/__tests__/equipPhotosEditor.test.js`                    |
| 471 | `src/__tests__/equipamentosLegacyHeroFiltersContext.test.js` |

### Top 5 candidatos a **mais teste** (cruzando com hotspots §5 + criticidade)

1. **`src/core/storage.js#migrateIfNeeded`** — testes parciais; falta
   "migração quebra no meio + rerun". Crítico p/ UX de upgrade.
2. **`src/domain/maintenance.js`** — 786 LOC, 44 declarações, é o **score
   engine** que decide criticidade da próxima manutenção. Há cobertura
   parcial em `__tests__/maintenance*.test.js`, mas o input space é largo.
3. **`src/domain/pdf/pmoc/`** — gerador PMOC + numeração persistida em
   localStorage. Risco de produzir PDF errado em produção é alto (cliente
   usa pra assinar). Testes existem (`pmocReport*.test.js`) mas focados em
   contrato, não em rendering visual.
4. **`src/domain/whatsapp.js`** — 3.930 bytes, monta link `wa.me`. Hoje
   coberto por `__tests__/registroPdfWhatsappLegacyContracts.test.js`
   indiretamente. Pode quebrar silenciosamente se números mudarem formato.
5. **`src/ui/views/registro.js#post-save flow + signature`** — coberto
   por `registroPostSaveLegacyFlow.test.js` (602 LOC), mas a parte de
   **assinatura digital com fallback offline** ainda é frágil
   (`signature-storage.js` + `cooltrack-sig-pending-upload` queue).

> Nota positiva: o projeto tem **disciplina de teste alta**. 185 testes
>
> - 8 pgTAP + 12 E2E, com convenções claras (`*.test.js` para unit,
>   `*Legacy*` para garantir paridade durante migração React).

---

## 9. CI/CD e tooling

### GitHub Actions

**1 workflow:** `.github/workflows/ci.yml`

- **Triggers**: push em `main`, PRs para `main`, `workflow_dispatch`
- **Concurrency**: agrupado por ref, cancela em progresso
- **Job único** (`test-and-build`, ubuntu-latest):
  1. Checkout
  2. Setup Node 20 + cache npm
  3. `npm ci`
  4. `npm run check` (= lint + format:check + test + build)
  5. `npm run build`
- **Secrets**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` (placeholders nos testes via vite.config)

**Não roda hoje em CI:**

- ❌ `test:e2e` (Playwright) — comando existe (`test:e2e:ci`) mas não está em workflow
- ❌ `test:coverage` — não publicado em PR
- ❌ pgTAP (`supabase/tests/`) — sem job dedicado
- ❌ `lint:css:dead` / `css:proof` — só rodam local

### Husky / pre-commit

`.husky/pre-commit`:

```sh
npm run format
npm run lint
git add -A
```

→ **Atenção**: o `git add -A` depois do format **inclui qualquer arquivo
modificado**, mesmo que não estivesse staged. Pode capturar arquivos
fora do escopo do commit. Considerar `lint-staged` (não está instalado)
para rodar só em arquivos staged.

`.husky/install.mjs` — instalado via `prepare` script.

### Linters / formatters

| Tool       | Config                    | Status                                                                                                                                                |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint     | `eslint.config.js` (flat) | ✅ Múltiplos `rules:` blocks (rules arquiteturais ainda em `warn`, comentário menciona promover para `error` após PRs 3-4 do plano de desacoplamento) |
| Prettier   | `.prettierrc.json`        | ✅ singleQuote, trailingComma all, printWidth 100                                                                                                     |
| Stylelint  | —                         | ❌ Não configurado                                                                                                                                    |
| TypeScript | —                         | ❌ Sem tsconfig                                                                                                                                       |

### Build / deploy

- **Build local**: `vite build` → `dist/` (config em `vite.config.js`)
- **Deploy**: **Cloudflare Pages** conectado direto ao repo (não via
  Actions). `netlify.toml` está presente como compatibilidade alternativa.
- **Preview / Hosting do `dist/`**: `npm run preview` local
- **Edge Functions Supabase**: deploy via `supabase` CLI (devDep) — não há
  workflow CI para isso

### Headers / segurança HTTP

`public/_headers` (formato Netlify/Cloudflare unificado):

- CSP rigoroso (whitelist Stripe, Supabase, Sentry, EmailJS, Google Fonts)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  (rígido — note que se um dia precisar de geo na app, terá que afrouxar)

`public/_redirects`: SPA fallback.

### Service Worker

`src/core/swUpdate.js` — controlador de update. Service worker **existente**
(há referências a `navigator.serviceWorker.controller`); presumivelmente
gerado por plugin Vite ou registrado em runtime. **Não há `vite-plugin-pwa`
no package.json** — o SW deve estar definido manualmente ou em
`public/sw.js` (não verificado em detalhe).

### Gaps de CI

1. **E2E não roda em PR** — risco real de breakages só virem em produção.
2. **Coverage não publicado** — gate apenas binário (passa/falha).
3. **pgTAP sem CI** — migrations podem quebrar policies sem warn.
4. **Sem job de bundle size** — regressão de TTI passa silenciosa.
5. **Sem `npm audit` / Dependabot configurado** (não verifiquei
   `.github/dependabot.yml` — está ausente).

---

## 10. Acessibilidade (proxy)

> Sem rodar Pa11y/axe-core completo no app — apenas grep heurístico.

| Métrica                                                                   | Valor                       |
| ------------------------------------------------------------------------- | --------------------------- |
| Total de tags `<img>` no código (incluindo testes XSS payload)            | 118                         |
| Tags `<img>` aparentemente sem `alt=` (heurística regex, com falsos pos.) | 97                          |
| `aria-*` ocorrências                                                      | 1.291 em 155 arquivos       |
| `role=` ocorrências                                                       | 213                         |
| `.focus()` chamadas                                                       | 57                          |
| `tabindex` ocorrências                                                    | 24                          |
| `axe-core` testes existentes                                              | 1 (`landingPage.a11y.test`) |

> ⚠️ Caveat: a heurística "img sem alt" tem **falsos positivos massivos**
> porque casa também `'<img src=x onerror=alert(1)>'` em payloads de teste
> XSS (`registroPhotosIsland.test.jsx`, `dashboardKpisIsland.test.jsx`,
> etc — 6 dos primeiros 10 hits são strings em testes). O número real de
> `<img>` sem alt em código **renderizado** é provavelmente uma fração.

### Sinais positivos

- 1.291 `aria-*` em 155 arquivos é alto pra um codebase desse tamanho —
  indica preocupação real com a11y.
- 213 `role=` mostra uso consistente de roles (ARIA modal, dialog, listbox).
- 57 chamadas `.focus()` indicam **gerenciamento de foco em modais** existe.
- `axe-core` está em `devDependencies` e roda no teste da landing.

### Gaps recomendados

1. Rodar `pa11y http://localhost:5173/equipamentos` (e demais rotas) no
   CI — gate de regressão.
2. Estender o teste axe-core para todas as rotas (vide
   `landingPage.a11y.test.js` como template).
3. Auditoria manual de teclado (tab order) nas views críticas:
   `registro`, `equipamentos`, `relatorio`.
4. Verificar se o `Permissions-Policy: camera=()` no `_headers` quebra a
   captura de placa via `nameplateCapture.js` (1.222 LOC) — possivelmente
   já testado, mas vale ver se a Permissions-Policy precisa ser afrouxada
   para `camera=(self)` num path específico.

---

## 11. Error handling

### Numéricos

| Métrica                    | Valor                                     |
| -------------------------- | ----------------------------------------- |
| Blocos `try { … }` total   | **331** em `src/`                         |
| `.catch()` em promises     | 26                                        |
| `ErrorBoundary` React      | ❌ não encontrado                         |
| `componentDidCatch`        | ❌ não encontrado                         |
| `getDerivedStateFromError` | ❌ não encontrado                         |
| Sentry                     | ✅ via `optionalDependencies` + lazy init |
| Outros (LogRocket/Bugsnag) | ❌                                        |

### Top 10 arquivos por # try/catch

| #try | arquivo                                              |
| ---- | ---------------------------------------------------- |
| 18   | `src/ui/views/equipamentos.js`                       |
| 12   | `src/ui/views/registro.js`                           |
| 11   | `src/ui/controller/handlers/reportExportHandlers.js` |
| 11   | `src/ui/controller/handlers/equipmentHandlers.js`    |
| 10   | `src/ui/views/equipamentos/fotos.js`                 |
| 10   | `src/core/auth.js`                                   |
| 9    | `src/core/observability.js`                          |
| 8    | `src/ui/components/signature/signature-storage.js`   |
| 8    | `src/core/storage.js`                                |
| 8    | `src/core/photoStorage.js`                           |

### Sistema de erros centralizado

- `src/core/errors.js` exporta:
  - `ErrorCodes` — enum congelado
  - `class AppError extends Error` — códigos padronizados
  - `function handleError(error, options)` — entry point único
- `src/core/observability.js` exporta:
  - `initObservability()` — lazy import de `@sentry/browser`
  - `captureError(error, options)`
  - `captureMessage()`
  - `addBreadcrumb()`
  - `setUser()`

→ Arquitetura **boa**: centralizada, não-bloqueante, defensiva.
`handleError` chama `captureError` (que vira Sentry event se DSN setado).

### Console logging

| Tipo            | #ocorrências em `src/` |
| --------------- | ---------------------- |
| `console.log`   | **2** (limpo)          |
| `console.warn`  | 30                     |
| `console.error` | 14                     |

→ `console.log` quase zerado mostra disciplina. `console.warn`/`error`
em geral acompanham logging defensivo.

### Gaps

1. **Sem React `ErrorBoundary`** — apesar de 23 islands React, não há
   boundary. Uma exceção em `landingIsland.jsx` ou `clientesIsland.jsx`
   pode derrubar o island todo (mas não o resto da página, porque é
   island).
2. **Sentry depende de `VITE_SENTRY_DSN`** — verificar se está setado
   em produção (Cloudflare env vars).
3. Sem alerta para `failedCount > 0` em `migrateIfNeeded` (apenas log).
4. Não há **rate limiting** local de erros — se um erro repetir em loop,
   pode bombardear o Sentry (free tier 5k/mês).

---

## 12. TODOs e dívidas explícitas

### Em código (`src/`)

Apenas **1 TODO real** encontrado:

```
src/domain/pdf/pmoc/sections/plano.js:
  // futuro via profile.plano_manutencao_custom (TODO Fase 5+).
```

**Zero `FIXME`, `HACK`, `XXX`, `WIP`, `BUG`, `@deprecated`** no código.

> Disciplina alta. As dívidas identificadas estão em **documentação**, não
> em comentários:

### Em docs (`BUGS-FOUND.md`)

| ID         | Tipo                           | Resolução                                                                   |
| ---------- | ------------------------------ | --------------------------------------------------------------------------- |
| BUG-CT-001 | limitação de método (estático) | Adicionar suíte runtime de seletores dinâmicos                              |
| BUG-CT-002 | limitação de extração estática | (mesmo arquivo, regex parsing)                                              |
| BUG-CT-003 | gap de cobertura (storage)     | Regressões para save de fotos/assinatura validando payload remoto vs base64 |

### Em docs (`docs/migration/`, 19 arquivos `.md`)

Vários planos de prep para migração React:

- `clientes-react-prep.md`, `dashboard-react-prep.md`, `equipamentos-react-prep.md`,
  `historico-react-prep.md`, `registro-react-prep.md`, `relatorio-react-prep.md`
- 8 docs `css-*` cobrindo cleanup, freeze policy, refactor accelerated plan
- `react-tailwind-cleanup-plan.md`, `react-tailwind-current-state.md`,
  `react-tailwind-final-status.md`
- `stability-final-status.md`

### Categorização rápida das dívidas reais

| Categoria | Item                                                               |
| --------- | ------------------------------------------------------------------ |
| feature   | PMOC plano custom por profile (1 TODO)                             |
| refator   | Migração React Tailwind das views legacy (vide `docs/migration/`)  |
| refator   | Cleanup CSS legado (`components.css` 22.830 LOC ↔ tailwind tokens) |
| refator   | Completar `userStorage` para perfil do técnico                     |
| bug       | BUG-CT-003 (cobertura de storage offline path)                     |
| dúvida    | (nenhuma marcada)                                                  |

---

## 13. Análise de risco

| #   | Área                                       | Risco | Justificativa em 1 linha                                                                                              |
| --- | ------------------------------------------ | :---: | --------------------------------------------------------------------------------------------------------------------- |
| 1   | CSS / Design system                        | **4** | `components.css` com 22.830 LOC + 13 arquivos > 800 LOC; convivência de CSS legado e Tailwind a meio caminho.         |
| 2   | JS architecture (god-objects, acoplamento) | **4** | `equipamentos.js` (2.746 LOC, 40 imports), `registro.js` (1.997 LOC, 27 imports) — 4 views = 7.700 LOC.               |
| 3   | State management                           | **2** | Centralizado em `core/state.js` com listeners + storage. Nenhuma lib pesada. Funciona bem.                            |
| 4   | Persistência local                         | **2** | `cooltrack_v3` snapshot + `userStorage` parcial + IndexedDB blobQueue. Fotos já fora do LS. Migração só falta perfil. |
| 5   | Schema Supabase / multi-tenant             | **4** | RLS sólida e indexes ok, mas **zero coluna `organization_id` em 13 tabelas** — B2B requer migration grande.           |
| 6   | Testes                                     | **2** | 185 unit + 8 pgTAP + 12 E2E + axe-core na landing. Coverage limitado a core/domain.                                   |
| 7   | CI/CD                                      | **3** | CI gate sólido (`npm run check`), mas **E2E, pgTAP e bundle-size não rodam no CI**.                                   |
| 8   | Error handling / observability             | **2** | 331 try/catch + Sentry lazy + handleError centralizado. Falta ErrorBoundary React.                                    |
| 9   | Acessibilidade                             | **3** | 1.291 `aria-*`, 213 `role=`, 57 `focus()` — sinal forte; só 1 teste axe-core; sem CI a11y.                            |
| 10  | Bundle size / performance                  | **3** | Entry 248 KB gz + vendor-pdf 238 KB gz. Lazy islands ok. PNG 1,9 MB raw. PDF carregando no entry.                     |

**Média geral: 2,9 / 5** (ponderada igual; 2,7 se ponderar por
"esforço×impacto", já que CSS, god-objects e multi-tenant pesam mais).

### Recomendação em 1 frase

**Comece pelos god-objects das 4 views legacy** (`equipamentos`, `registro`,
`historico`, `dashboard`) — a quebra dessas em chunks de feature
(feature-sliced) destrava simultaneamente: TS incremental, code-split
do entry, e prep para multi-tenant (porque os pontos onde `user_id`
vira `organization_id` ficam em camadas mais finas e testáveis).

---

## Apêndice — Observações operacionais

- `npm ci` foi executado uma vez para popular `node_modules` (lockfile já
  presente, zero deps novas adicionadas). Levou 14s + 428 packages.
- `npm run build` rodou em **10,36 s**, sem erros, com avisos esperados
  (chunks > 500 KB, dynamic-vs-static `orcamentos`).
- `madge` (detecção de circular) **não está disponível**; recomenda-se
  rodar manualmente.
- `rollup-plugin-visualizer` está instalado mas requer
  `ANALYZE=true npm run build` para gerar `dist/bundle-stats.html`.
- Nenhum arquivo de código (`src/`, configs, `.env`) foi modificado.
  Esse arquivo `mapeamento-completo.md` é o único output.
