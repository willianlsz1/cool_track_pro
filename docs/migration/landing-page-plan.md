# Plano da nova Landing Page CoolTrackPro

> Documento de planejamento. Nao implementa codigo. Implementacao futura segue
> o protocolo descrito em `docs/migration/stability-final-status.md` secoes 9
> e 10 (PR proprio, escopo curto, lista de testes, criterio de aceite,
> aprovacao explicita antes de iniciar codigo).

## 1. Objetivo

- Implementar uma nova landing page para o CoolTrackPro dentro da SPA.
- Foco exclusivo em climatizacao e refrigeracao: ar-condicionado split,
  ar-condicionado comercial, camaras frias, geladeiras/freezers comerciais,
  refrigeracao industrial e PMOC/manutencao preventiva.
- Usar `cooltrackpro.html` (gerado em Claude Design) como referencia visual
  aprovada — nao como codigo final para copiar literalmente.
- Implementar com React + Tailwind, seguindo o padrao de ilhas React ja
  existente nas demais areas migradas.

Contexto: hoje existe uma landing legacy vanilla em
`src/ui/components/landingPage.js` + `landingPage/template.js` + CSS proprio
(`src/ui/components/landingPage/styles.css` e `src/assets/styles/landing.css`),
carregada via dynamic import em `src/app.js:276` quando o usuario nao esta
autenticado. A nova landing devera substituir esse caminho (ou coexistir
atras de feature-flag durante migracao). Ver secao 10 para estrategia.

## 2. Fora de escopo

- Nao implementar a landing neste PR (este documento).
- Nao alterar autenticacao (`src/core/auth.js`, `AuthScreen.show()`).
- Nao alterar regras de negocio.
- Nao mexer em CSS legado existente (`components.css`, `landing.css`,
  `landingPage/styles.css`). Toda estilizacao da nova landing deve sair de
  Tailwind utility classes.
- Nao criar redesign grande fora do escopo da landing (Painel, Equipamentos,
  Registro, Relatorio, Historico ficam como estao).
- Nao alterar dashboard real.
- Nao conectar dados reais (Supabase, telemetria de producao, billing).
- Nao criar integracao externa (Stripe, WhatsApp Business, etc).
- Nao alterar rotas existentes (inicio, equipamentos, registro, relatorio,
  historico, etc).

## 3. Escopo proposto para futuro PR

- Criar view de landing como ilha React montavel.
- Criar componentes React separados (estrutura na secao 4).
- Usar Tailwind para layout, responsividade, cards, cores, hover states e
  espacamento de secoes.
- Criar dashboard preview com dados estaticos mockados (sem fetch, sem state
  global, sem auth).
- Criar interatividade leve:
  - navegacao suave (scroll-into-view) para ancoras das secoes;
  - hover lift nos cards (transform + shadow via Tailwind);
  - dashboard preview com abas trocaveis via `useState` local;
  - timeline/fluxo com etapa ativa opcional (estado local);
  - CTA "Comecar agora" direcionando para o fluxo `AuthScreen.show()`
    existente, sem reimplementar auth;
  - CTA "Ver demonstracao" com scroll-into-view para o dashboard preview ou
    abertura de modal simples ja existente (`Modal` em `src/core/modal.js`).

## 4. Estrutura sugerida de arquivos

```
src/ui/views/landing/
├── LandingPage.jsx
├── components/
│   ├── LandingHeader.jsx
│   ├── LandingHero.jsx
│   ├── DashboardPreviewInteractive.jsx
│   ├── SegmentSection.jsx
│   ├── ProblemsSection.jsx
│   ├── FeaturesSection.jsx
│   ├── WorkflowSection.jsx
│   ├── FinalCTA.jsx
│   └── LandingFooter.jsx
└── data/
    └── landingMockData.js
```

Entrypoint (a definir no PR de implementacao): seguindo o padrao do projeto,
provavelmente
`src/react/entrypoints/landingIsland.jsx` que monta `LandingPage.jsx` em um
root DOM dedicado quando o usuario nao esta autenticado. O `app.js`
substitui o dynamic import de `landingPage.js` legacy por este entrypoint.

Testes correspondentes (padrao atual `src/__tests__/*.test.{js,jsx}`):

- `landingPage.test.jsx` (renderizacao + presenca de secoes)
- `landingDashboardPreview.test.jsx` (abas + state local)
- `landingWorkflow.test.jsx` (timeline com etapa ativa)
- `landingCta.test.jsx` (CTAs disparam handlers esperados)
- E2E leve em `e2e/specs/landing-smoke.spec.js` se viavel (rota inicial sem
  auth + scroll de ancoras + click em "Comecar agora").

## 5. Referencia visual

Paleta baseada no mockup (`cooltrackpro.html`):

- navy profundo: `#020B2D`
- azul escuro: `#031B4E` / `#06245F`
- azul principal: `#006DFF`
- azul vivo: `#159BFF`
- ciano: `#40C4FF`
- branco: `#FFFFFF` / off-white `#F5F8FC`
- ink (texto): `#0B1B33` / `#5B6B82`
- estados: green `#18B884`, orange `#F59E0B`, red `#EF4444`

Estes valores devem virar `theme.extend.colors` em `tailwind.config.js`
(aditivo, nao mexer em cores ja existentes do projeto), nomeados sob um
namespace `landing.*` para nao conflitar.

Estrutura visual:

- Hero com fundo azul escuro + radial gradients + waves decorativas.
- Cards brancos com bordas suaves, shadow soft e hover lift.
- Dashboard preview a direita do hero (desktop), com sidebar + KPI grid +
  alertas + chart de barras + lista de OS + strip de equipamentos.
- Secoes alternando fundo claro (off-white) e fundo azul escuro.
- CTA final em gradiente azul com ilustracao de equipamentos
  (split + condensadora) em SVG inline.
- Aparencia SaaS premium: tipografia Inter + JetBrains Mono para mono
  (numeros de OS), espacamento generoso, transicoes suaves (.15s-.2s ease).

Foco visual em equipamentos especificos do dominio:
ar-condicionado split, ar-condicionado comercial, camaras frias,
geladeiras/freezers comerciais, refrigeracao industrial, PMOC e
manutencao preventiva.

## 6. Requisitos de responsividade

- **Desktop (>=1280px)**: estrutura parecida com o mockup — hero em duas
  colunas (texto a esquerda, dashboard preview a direita), grids 3 colunas
  para Segmentos/Problemas/Features, timeline horizontal de 7 passos.
- **Tablet (768px-1279px)**: hero em coluna unica (texto em cima, dashboard
  preview embaixo reduzido) ou hero em duas colunas com dashboard com
  altura menor; grids passam para 2 colunas; timeline horizontal pode
  comprimir ou virar grid 2x4.
- **Mobile (<768px)**:
  - header compacto (hamburger menu opcional ou link unico para "Comecar agora");
  - hero em coluna unica, dashboard preview com altura reduzida ou
    substituido por screenshot estatico para nao pesar;
  - todos os grids em uma coluna;
  - timeline vertical com numeros a esquerda e textos a direita;
  - CTA final em coluna (botoes empilhados);
  - footer em coluna unica com colunas empilhadas.

Sem viewport fixo (`<meta name="viewport" content="width=1440">` do mockup
NAO deve ser portado). Usar viewport responsivo padrao do `index.html`.

## 7. Criterios de aceite

- Landing acessivel via rota/condicao definida (nao-autenticado abre
  landing; autenticado abre app).
- Visual fiel ao mockup aprovado, mas implementado com React + Tailwind
  (utility classes), sem reaproveitar `components.css`/`landing.css`
  legados.
- Nenhum CSS legado novo. `src/assets/styles/landing.css` e
  `src/ui/components/landingPage/styles.css` ficam congelados ate o PR
  de retirada da landing legacy.
- Nenhuma alteracao de regra de negocio.
- Nenhuma quebra nas rotas existentes (`inicio`, `equipamentos`,
  `registro`, `relatorio`, `historico`, etc — todos os specs E2E
  preexistentes continuam passando).
- Responsiva em desktop, tablet e mobile (validar em pelo menos 3
  breakpoints durante review).
- Dados do dashboard preview mockados (sem fetch, sem `getState`).
- Botoes principais conectados ao fluxo existente:
  - "Comecar agora" → chama `AuthScreen.show()` ou navega para a tela
    de cadastro existente (decidir no PR de implementacao);
  - "Ver demonstracao" → scroll-into-view para `#dashboard-preview` ou
    modal simples.
- Testes de renderizacao + check + build + e2e passando.
- Formatacao prettier passando.

## 8. Testes sugeridos

Padrao atual do projeto (vitest + Testing Library para unit; Playwright
para E2E):

- **Unit**:
  - Teste de renderizacao da landing (todas as secoes principais montam
    sem erro, com fixture de mock data).
  - Teste dos links/CTAs principais (clicks disparam handlers
    esperados via `vi.fn()`).
  - Teste das abas do dashboard preview (state local muda, conteudo
    visivel troca).
  - Teste do fluxo/timeline interativo (etapa ativa muda quando handler
    e chamado, se feature for incluida).
  - Teste basico de acessibilidade quando houver padrao no projeto
    (atributos `aria-*`, `alt` em SVGs decorativos com
    `aria-hidden="true"`).
- **E2E** em `e2e/specs/landing-smoke.spec.js`:
  - Abrir `/` sem auth → ver landing.
  - Click em "Comecar agora" → vai para tela de auth (validar
    `data-route` ou DOM da AuthScreen).
  - `console.error` e `pageerror` capturados como regressao
    (padrao dos demais smokes).

## 9. Riscos

- **Escopo grande demais se misturado com hardening/refactor**. PR unico
  com 30-50 arquivos novos + roteamento + responsividade real e dificil de
  revisar. Mitigacao: dividir em 4 sub-PRs (secao 10).
- **Conflito direto com handoff §11** que bloqueia "landing nova dentro do
  app". Requer aprovacao explicita do owner do projeto antes do primeiro
  PR de implementacao.
- **Conflito com `stability-final-status.md` §9**: feature freeze pos-100%.
  Mesma aprovacao explicita resolve.
- **Risco de regressao visual** se reaproveitar CSS legado por engano.
  Mitigacao: lint/grep automatizado no PR proibindo import de
  `components.css` e `landing.css` em arquivos novos da pasta
  `src/ui/views/landing/`.
- **Risco de mobile ruim** se copiar o HTML fixo de 1440px do mockup.
  Mitigacao: mobile-first no Tailwind, validacao em 360px/375px/768px/
  1024px/1280px durante review.
- **Risco de transformar mockup em codigo estatico** em vez de
  componentes reutilizaveis. Mitigacao: revisao por componente, props
  tipadas (mesmo sem TypeScript, JSDoc), dados separados em
  `data/landingMockData.js`.
- **Risco de regressao na landing legacy** durante migracao. Mitigacao:
  feature flag (env ou localStorage) que permite rollback rapido para
  `landingPage.js` legacy; landing legacy so e removida no PR final.
- **Dependencia de telemetria `lp_view`**: a landing legacy emite
  telemetria via `trackEvent('lp_view', {})`. A nova landing deve
  manter o mesmo evento para nao quebrar funil analytics.
- **Bundle size**: a landing legacy ja pesa ~48KB (JS + CSS). A nova
  landing com React + Tailwind tende a pesar similar ou menos
  (Tailwind purge + tree-shaking React), mas validar via
  `npm run build` no PR.

## 10. Plano de implementacao futura em PR proprio

Pre-requisitos antes de iniciar PR 1:

- Aprovacao explicita do owner reconhecendo override de handoff §11 e
  `stability-final-status.md` §9.
- Working tree limpa.
- Decisao sobre rota: nova landing substitui a legacy diretamente ou
  coexiste atras de feature-flag?

Sub-PRs sugeridos (cada um e um PR proprio, mergeavel independentemente):

- **PR 1 — Estrutura + componentes estaticos**:
  - Criar `src/ui/views/landing/LandingPage.jsx` e os 9 componentes da
    secao 4 com markup estatico (sem interacao).
  - Criar `data/landingMockData.js` com fixtures.
  - Adicionar `theme.extend.colors.landing.*` em `tailwind.config.js`
    (aditivo).
  - Wirar entrypoint em `src/react/entrypoints/landingIsland.jsx` mas
    manter atras de feature-flag (env `VITE_LANDING_NEW=1` ou similar);
    landing legacy continua default.
  - Testes de renderizacao basicos.
  - Sem mexer em mobile/tablet ainda — desktop puro.
- **PR 2 — Dashboard preview interativo + timeline**:
  - Implementar abas do dashboard preview com `useState`.
  - Implementar timeline com etapa ativa.
  - Testes de interacao.
- **PR 3 — Responsividade e acessibilidade**:
  - Breakpoints mobile/tablet com Tailwind.
  - Validacao a11y (atributos aria, contraste, foco visivel, ordem de
    tab).
  - Testes a11y se houver padrao.
- **PR 4 — Polimento visual + cleanup da landing legacy**:
  - Remover feature-flag, ativar nova landing por padrao.
  - Remover `src/ui/components/landingPage.js`,
    `landingPage/template.js`, `landingPage/styles.css` apos provar
    via `npm run css:proof` que o CSS legado de landing (`landing.css`
    - bloco em `components.css`) nao tem mais consumidores.
  - Retirar testes legacy `landingPage.test.js` e
    `landingPage.a11y.test.js` (substituidos pelos novos).
  - E2E smoke `landing-smoke.spec.js`.
  - Validacoes finais: format, check, test, build, test:e2e.

Cada PR segue o padrao do projeto:

- Working tree limpa antes de iniciar.
- "Uma coisa por PR".
- Validacoes obrigatorias: `git status --short`, conflict markers,
  `npm run format`, `npm run check`, `npm run test`, `npm run build`,
  `npm run test:e2e`, `git diff --check`.
- Relatorio final com arquivos alterados, contratos protegidos, riscos
  observados e proximos passos.
