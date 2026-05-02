# Internal App Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the authenticated CoolTrackPro app to a cohesive dark operational palette without changing business rules, routes, handlers, storage, auth, landing, pricing, or legal pages.

**Architecture:** Treat the refresh as a token-first CSS migration. Start with shared app tokens, then move screen-by-screen through small scoped overrides, preserving all existing DOM contracts such as IDs, `data-action`, `data-id`, `data-mode`, route names, and handler bindings.

**Tech Stack:** Vanilla app shell, React islands for migrated screens, CSS tokens in `src/assets/styles/tokens.css`, app shell CSS in `src/assets/styles/layout.css`, broad visual overrides in `src/assets/styles/redesign.css`, feature CSS in `src/assets/styles/components.css` and scoped companion files.

---

## 1. Objective

Move the internal app from a mixed light/dark and generic admin look to a single operational dark theme:

- dark modern SaaS workspace;
- legible for daily field operation;
- lower visual noise than the current mixed palette;
- consistent cards, controls, filters, pills, and modals;
- clear hierarchy between shell, navigation, content, and actions;
- no functional changes.

The target result should feel like the same product family as the landing, login, pricing, and preview dashboard, but optimized for repeated authenticated use.

## 2. Proposed Palette And Tokens

Primary palette:

| Role           | Token                 | Value                             | Usage                           |
| -------------- | --------------------- | --------------------------------- | ------------------------------- |
| App background | `--ct-app-bg`         | `#26282B`                         | global authenticated background |
| Surface        | `--ct-surface`        | `#353941`                         | cards, sidebar, panels, modals  |
| Surface raised | `--ct-surface-raised` | `#3E434D`                         | hovered cards, active panels    |
| Surface subtle | `--ct-surface-subtle` | `#2D3036`                         | nested panels, table headers    |
| Border         | `--ct-border`         | `rgba(144, 184, 248, 0.16)`       | card/control borders            |
| Border strong  | `--ct-border-strong`  | `rgba(144, 184, 248, 0.28)`       | focus, active, selected         |
| Primary        | `--ct-brand`          | `#5F85DB`                         | primary CTA, active nav, links  |
| Primary hover  | `--ct-brand-hover`    | `#90B8F8`                         | hover, focus ring, highlights   |
| Text           | `--ct-text`           | `#F4F7FB`                         | primary text                    |
| Text muted     | `--ct-text-muted`     | `#C7D0E0`                         | secondary text                  |
| Text faint     | `--ct-text-faint`     | `#98A4B8`                         | metadata, helper text           |
| Shadow         | `--ct-shadow-soft`    | `0 18px 48px rgba(0, 0, 0, 0.28)` | elevated cards                  |

Status palette:

| Status       | Token               | Value                       | Usage                          |
| ------------ | ------------------- | --------------------------- | ------------------------------ |
| Success      | `--ct-success`      | `#4ADE80`                   | ativo, em dia, concluido       |
| Success soft | `--ct-success-soft` | `rgba(74, 222, 128, 0.12)`  | success pill background        |
| Info         | `--ct-info`         | `#90B8F8`                   | enviado, agendado, informativo |
| Info soft    | `--ct-info-soft`    | `rgba(144, 184, 248, 0.14)` | info pill background           |
| Warning      | `--ct-warn`         | `#FBBF24`                   | atencao, pendente, proximo     |
| Warning soft | `--ct-warn-soft`    | `rgba(251, 191, 36, 0.13)`  | warning pill background        |
| Danger       | `--ct-error`        | `#FB7185`                   | critico, vencido, atrasado     |
| Danger soft  | `--ct-error-soft`   | `rgba(251, 113, 133, 0.13)` | danger pill background         |
| Premium      | `--ct-gold`         | `#D9A441`                   | only Pro and premium details   |

Compatibility aliases should keep legacy CSS stable:

- `--bg -> --ct-app-bg`
- `--surface`, `--card`, `--bg-soft -> --ct-surface`
- `--surface-2`, `--card-hover -> --ct-surface-raised`
- `--primary -> --ct-brand`
- `--primary-strong -> --ct-brand-hover`
- `--text -> --ct-text`
- `--text-2`, `--muted -> --ct-text-muted`
- `--text-3`, `--muted-light -> --ct-text-faint`
- legacy neon tokens should map to subdued brand/status tokens, not bright neon.

## 3. Token Mapping By Area

### Shell

- Background: `--ct-app-bg`.
- Main content: subtle radial gradients over `#26282B`, no white workspace.
- Layout separators: `--ct-border`.
- Scrollbar/thumb: `--ct-surface-raised` and `--ct-brand`.

### Sidebar

- Background: `linear-gradient(180deg, #353941, #2D3036)`.
- Brand mark: keep `/brand/favicon.svg` only for product branding.
- Active item: `--ct-brand` background tint, `--ct-brand-hover` border, left indicator.
- Inactive hover: `rgba(144, 184, 248, 0.08)`.
- Plan Pro: muted gold only in badge/card accent.

### Header

- Background: `rgba(53, 57, 65, 0.92)` with blur.
- Bottom border: `--ct-border`.
- Title text: `--ct-text`.
- Metadata/date/status: `--ct-text-faint`.
- Header action focus: `--ct-brand-hover`.

### Cards

- Background: `--ct-surface`.
- Raised state: `--ct-surface-raised`.
- Border: `--ct-border`.
- Shadow: `--ct-shadow-soft`.
- Radius: keep existing app radius, standardize around 14-18px for panels and 10-12px for controls.
- Avoid large white cards.

### Buttons

- Primary: `--ct-brand`, hover `--ct-brand-hover`, text `#FFFFFF`.
- Secondary: transparent or `--ct-surface-subtle`, border `--ct-border`, text `--ct-text`.
- Ghost: transparent, text `--ct-text-muted`, hover tint.
- Dangerous: subdued danger token, not saturated red blocks unless destructive confirmation.
- Gold: only Pro/premium, never main operational CTA.

### Inputs And Filters

- Background: `--ct-surface-subtle`.
- Border: `--ct-border`.
- Text: `--ct-text`.
- Placeholder: `--ct-text-faint`.
- Focus: `0 0 0 3px rgba(144, 184, 248, 0.22)` plus `--ct-brand-hover` border.
- Disabled: lower opacity, no color shift to white.

### Tables And Lists

- Container: `--ct-surface`.
- Header row: `--ct-surface-subtle`, uppercase labels in `--ct-text-faint`.
- Rows: transparent with border separators.
- Row hover: `rgba(144, 184, 248, 0.08)`.
- IDs/codes: monospace and `--ct-brand-hover` when interactive.

### Status Pills

- Base: inline-flex, small dot, 999px radius, 1px border.
- Success: `--ct-success-soft`, `--ct-success`.
- Info: `--ct-info-soft`, `--ct-info`.
- Warning: `--ct-warn-soft`, `--ct-warn`.
- Danger: `--ct-error-soft`, `--ct-error`.
- Muted: `rgba(199, 208, 224, 0.1)`, `--ct-text-muted`.

### Modals

- Overlay: `rgba(10, 12, 16, 0.68)`.
- Dialog: `--ct-surface`, border `--ct-border`, shadow `0 30px 80px rgba(0,0,0,0.38)`.
- Header/footer separators: `--ct-border`.
- Form controls: same as inputs and filters.
- Do not alter modal handlers or submit flows.

## 4. Priority Screens

1. Shell/sidebar/header
   - Files: `src/assets/styles/tokens.css`, `src/assets/styles/layout.css`, `src/assets/styles/redesign.css`, `src/ui/shell/templates/sidebar.js`, `src/ui/shell/templates/header.js` only if branding markup audit finds a visual-only need.
   - Goal: make the frame coherent before changing pages.

2. Dashboard
   - Files: `src/react/pages/Dashboard*.jsx`, `src/ui/views/dashboard.js`, related CSS in `components.css` and scoped dashboard CSS if needed.
   - Goal: operational command center in dark surfaces with clear CTAs.

3. Clientes
   - Files: `src/react/pages/ClientesPage.jsx` only if unavoidable; prefer CSS in `src/assets/styles/clientes-premium.css` or successor tokenized file.
   - Goal: migrate the recent Clientes visual pass from light premium to the new dark operational palette.

4. Equipamentos
   - Files: `src/react/pages/Equipamentos*.jsx`, `src/ui/views/equipamentos*.js`, equipment CSS blocks.
   - Goal: equipment cards and filters should match Clientes.

5. Relatorios
   - Files: `src/react/pages/Relatorio*.jsx`, `src/ui/views/relatorio.js`, report CSS blocks.
   - Goal: keep report generation controls readable and operational.

6. Alertas
   - Files: `src/react/pages/AlertasPage.jsx`, `src/ui/views/alertas.js`, alert CSS blocks.
   - Goal: warning/danger hierarchy must be clear without neon.

7. Orcamentos
   - Files: `src/react/pages/OrcamentosPage.jsx`, `src/ui/views/orcamentos.js`, `src/assets/styles/redesign.css` budget blocks.
   - Goal: align existing KPI/pill refinements with the new dark token set.

## 5. Out Of Scope

- No O.S. tab or new order-of-service feature.
- No new product features.
- No business rule changes.
- No auth/login redesign.
- No landing changes.
- No pricing changes.
- No legal page changes.
- No storage/backend/database changes.
- No route, guard, handler, or telemetry changes except tests needed to prove contracts are preserved.

## 6. Small PR Strategy

### PR 1: Token Foundation

- [ ] Update only `src/assets/styles/tokens.css` with the dark operational token set and legacy aliases.
- [ ] Add or update a token-focused test if current visual token tests exist.
- [ ] Run `npm run format`, `npm run check`, `npm run test`, `npm run build`, `git diff --check`.
- [ ] Acceptance: shell still renders, no route/auth/handler diffs.

### PR 2: Shell, Sidebar, Header

- [ ] Refine `layout.css` and `redesign.css` shell/sidebar/header rules.
- [ ] Preserve `/brand/favicon.svg` at brand points only.
- [ ] Keep all nav IDs and route contracts.
- [ ] Run shell/header/sidebar tests such as `globalHeaderContracts`, `shell`, navigation tests, then full validation.
- [ ] Acceptance: app frame is dark, premium, and readable before page work starts.

### PR 3: Shared Controls

- [ ] Standardize buttons, inputs, selects, filter bars, empty states, tables, and pills in CSS.
- [ ] Avoid JSX changes unless a component has an accessibility issue.
- [ ] Add contract tests only if a selector or rendered state changes.
- [ ] Acceptance: controls look consistent across existing screens.

### PR 4: Dashboard

- [ ] Tokenize dashboard hero, KPIs, onboarding, next action, month summary, last service, and read-only blocks.
- [ ] Keep dashboard data and action handlers unchanged.
- [ ] Run dashboard-focused tests plus full validation.
- [ ] Acceptance: dashboard feels like the main operational surface.

### PR 5: Clientes And Equipamentos

- [ ] Move Clientes from light premium CSS to dark operational tokens.
- [ ] Align equipment cards, filters, context selectors, photo/nameplate surfaces, and empty states.
- [ ] Preserve `data-action`, `data-id`, modal triggers, PMOC entry points, and paywall locks.
- [ ] Run Clientes and Equipamentos test groups plus full validation.
- [ ] Acceptance: both asset/customer management screens share the same visual grammar.

### PR 6: Relatorios, Alertas, Orcamentos

- [ ] Migrate report cards/controls, alert cards/lists, and budget cards/KPIs/pills to the same token set.
- [ ] Keep export, WhatsApp, PDF, quota, signature, and pricing/checkout behavior untouched.
- [ ] Run relevant focused tests plus full validation.
- [ ] Acceptance: remaining operational screens no longer look like separate visual systems.

### PR 7: CSS Cleanup

- [ ] Audit dead visual overrides after migration.
- [ ] Remove obsolete colors, duplicated selectors, and temporary scoped overrides that tokens now cover.
- [ ] Keep historical docs unless inaccurate.
- [ ] Run `npm run format`, `npm run check`, `npm run test`, `npm run build`, `git diff --check`.
- [ ] Acceptance: no known old light/dark conflicting layer remains in runtime CSS.

## 7. Visual Acceptance Criteria

- Internal app uses `#26282B` as the dominant authenticated background.
- Sidebar, cards, modals, and panels use `#353941` family surfaces.
- Primary operational actions use `#5F85DB`, with `#90B8F8` for hover/focus.
- Main content no longer depends on large white/off-white cards.
- All text remains readable on dark surfaces.
- Pills use consistent status mapping with dot indicators.
- Dourado/gold appears only in Pro/premium elements.
- No neon, gamer, betting-dashboard, or generic admin-template feel.
- No "Ver demonstracao" button returns.
- No O.S. tab is introduced.
- Existing data and actions behave exactly as before.

## 8. Tests Needed

Always run:

```bash
npm run format
npm run check
npm run test
npm run build
git diff --check
```

Focused suites by PR:

- Shell/sidebar/header: `npm run test -- shell globalHeaderContracts navigationMode router`
- Dashboard: `npm run test -- dashboard`
- Clientes: `npm run test -- clientesReactIsland clientesViewModel clientesView.security clientesView.pmoc clientesCardRenderer clientesSummaryRenderer`
- Equipamentos: `npm run test -- equipamentos`
- Relatorios: `npm run test -- relatorio reportExportHandlers shareReport`
- Alertas: `npm run test -- alertas`
- Orcamentos: `npm run test -- orcamentos`
- Landing/auth/pricing safety check after full migration: `npm run test -- landingPageReact landingPage.a11y authscreen.redesign pricing`

Manual/visual checks:

- desktop, tablet, mobile widths;
- active sidebar item;
- primary and secondary button hierarchy;
- empty states;
- modal overlays and focus state;
- filters and selects;
- cards with long names and status pills;
- Pro badge/card treatment.

## 9. Risks

- CSS cascade risk: `components.css`, `tokens.css`, `redesign.css`, and scoped files can fight each other.
- Contrast risk: dark palette can reduce legibility in dense cards and tables.
- Selector contract risk: old tests may rely on classes that should stay stable.
- White-space risk: dark surfaces can make excessive spacing more obvious.
- Feature bleed risk: visual work can accidentally touch route/handler files.
- File-size risk: avoid adding large override blocks to files already near or over 1000 lines.
- Branding risk: `/brand/favicon.svg` must remain branding-only, not a functional icon.

Mitigations:

- token-first changes;
- one screen family per PR;
- no JSX changes unless clearly necessary;
- focused tests before full validation;
- `git diff --check` on every PR;
- visual review on at least one desktop and one mobile viewport.

## 10. CSS And Old Visual Cleanup Plan

After PRs 1-6:

- [ ] Search runtime CSS for old visual tokens and hardcoded colors:

```bash
rg "#e8b94a|yellow|gold|amber|#f5f7fb|#eef2f9|#ffffff|Ver demonstra|demo|guest" src index.html
```

- [ ] Classify each hit as valid, obsolete, or historical.
- [ ] Keep valid hits for status warning, Pro premium, docs, and legal/landing scopes.
- [ ] Remove obsolete runtime hits only when selectors are proven unused or superseded.
- [ ] Prefer deleting temporary scoped overrides once global tokens cover the same component safely.
- [ ] Do not remove IDs, `data-action`, `data-id`, `data-mode`, route names, auth hooks, storage hooks, or event listeners.
- [ ] Document remaining intentional exceptions in `docs/migration/css-legacy-inventory.md` or a successor cleanup note.

## Implementation Notes

- Branch: use `main` unless a future instruction changes this.
- Do not create a branch for the planning-only task.
- Do not implement the visual migration while creating this plan.
- Existing dirty files from another task must not be reverted or reformatted except by explicit scope.
- If a future implementation needs a new CSS file, keep it scoped and below 1000 lines.
