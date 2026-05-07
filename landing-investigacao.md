# Investigação: landing vs tema light

## 1. Build

- Tipo: **single-page**
- HTMLs encontrados: `index.html` (raiz). `deploy-checklist.html` na raiz é um arquivo independente, não é um entry do Vite. Nenhum HTML em `src/`.
- vite.config: sem `rollupOptions.input` customizado — Vite usa o `index.html` da raiz como único entry. Confirma single-page.

A landing é montada no mesmo `index.html` via React island:

- `src/app.js:280` faz `import('./react/entrypoints/landingIsland.jsx')` e chama `mountLandingPageReact(appEl, ...)`.
- `src/react/entrypoints/landingIsland.jsx:34` adiciona a classe `landing-active` no shell `#app` antes de renderizar.

Por compartilharem o mesmo HTML, **todos os CSS centrais carregados em `index.html` são aplicados também enquanto a landing está visível**. O isolamento é feito por convenção via classe `landing-active` (vários estilos de app são escopados em `body:not(.landing-active)`).

## 2. Imports da landing

- Arquivos em `src/react/pages/landing/`: `LandingPage.jsx` + `components/` + `data/` + `assets/` + `icons/`.
- A landing importa CSS central? **NÃO** — `grep` por `tokens|base\.css|theme-premium|components\.css|redesign\.css` em `src/react/pages/landing/` retornou zero hits.
- A landing usa `data-theme`? **NÃO** — `grep` por `data-theme` em `src/react/pages/landing/` retornou zero hits.
- A landing usa `var(--bg|--text|--surface|--primary|--border|--ct-*)`? **NÃO** — zero hits. É 100% Tailwind/inline.

## 3. Toggle de tema

- Existe toggle no app? **SIM**
  - Função: `toggleTheme()` em `src/ui/controller/helpers/themeInitHelpers.js:340`
  - `applyThemeMode(theme)` em `src/ui/controller/helpers/themeInitHelpers.js:328` — seta/remove `data-theme='light'` em `document.documentElement` (`<html>`, não `<body>`).
  - Action ID: `HEADER_ACTIONS.toggleTheme = 'toggle-theme'` em `src/ui/shell/headerContracts.js:81`
  - Handler: `src/ui/controller/handlers/navigationHandlers.js:279` invoca `toggleTheme()` quando o action é disparado.
- UI: item de menu da engrenagem do header (label dinâmico em `#header-theme-label` — "🌙 Tema escuro" / "☀️ Tema claro").
- A landing **não** tem botão de toggle próprio.

## 4. Persistência de tema

- localStorage keys: `cooltrack-theme` (set em `themeInitHelpers.js:337`, get em `:347`).
- `prefers-color-scheme` detectado em código JS: **SIM** — `themeInitHelpers.js:348` usa `matchMedia('(prefers-color-scheme: light)')` como fallback se não houver valor salvo.

## 5. Regras [data-theme='light'] em CSS

| Arquivo                                     | Ocorrências |
| ------------------------------------------- | ----------: |
| `src/assets/styles/base.css`                |           1 |
| `src/assets/styles/components.css`          |          21 |
| `src/assets/styles/layout.css`              |           2 |
| `src/assets/styles/redesign.css`            |          66 |
| `src/assets/styles/theme-premium.css`       |          22 |
| `src/assets/styles/tokens.css`              |           2 |
| `src/assets/styles/components/_pricing.css` |           8 |
| **TOTAL**                                   |     **122** |

## 6. Veredicto

- [ ] **A** — Landing é isolada (não depende de tokens.css/base.css/theme-premium.css/components.css/redesign.css). Pode-se remover [data-theme='light'] de todos esses arquivos sem afetar a landing.
- [ ] **B** — Landing depende de CSS centrais e usa [data-theme='light'] dela mesma. Remover light theme afetaria a landing — não fazer agora.
- [x] **C** — Landing depende de CSS centrais MAS NÃO usa [data-theme='light'] (nunca está em modo light). Pode remover blocos [data-theme='light'] dos CSS centrais sem afetar landing.
- [ ] **D** — Situação mista, requer análise caso a caso. Detalhar abaixo.

Detalhe: o app é single-page e a landing compartilha `index.html` com o app interno, então os CSS centrais são aplicados ao DOM enquanto a landing está visível. Porém, a landing não importa CSS central, não referencia `data-theme`, não consome `var(--bg|--text|--surface|--primary|--border|--ct-*)`, e usa Tailwind para todo o styling. O toggle de tema vive no header do app (engrenagem) — a landing não tem como ativá-lo. Mesmo que `data-theme='light'` esteja persistido no `localStorage` de uma sessão anterior, ele não tem efeito visível na landing porque ela ignora os tokens. Conclusão: remover blocos `[data-theme='light']` dos CSS centrais é seguro do ponto de vista da landing — afetaria só a feature de tema light do app interno.
