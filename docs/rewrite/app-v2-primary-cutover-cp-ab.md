# app-v2 - Primary cutover CP-AB

## Objetivo

Trocar a entrada principal `index.html` do v1 para o bootstrap de producao do
app-v2 criado na CP-AA.

Esta CP faz apenas o corte controlado do entrypoint. Ela nao altera router,
storage real amplo, Supabase/RLS, PDF/share, WhatsApp, billing, upload/storage,
PMOC real, orcamento real ou configs.

## Escopo revisado antes da execucao

Arquivos de runtime/teste alterados:

- `index.html`
- `src/app-v2/primaryCutover.test.ts`
- `src/__tests__/equipamentosCpIAssets.test.js`

Arquivos documentais alterados:

- `docs/rewrite/app-v2-primary-cutover-cp-ab.md`
- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

Contratos envolvidos:

- root principal app-v2: `app-v2-root`;
- bootstrap principal app-v2: `/src/app-v2/main.tsx`;
- rollback simples para v1: root `app` e script `/src/app.js`.

## Implementacao

`index.html` agora:

- monta o root `app-v2-root`;
- carrega `/src/app-v2/main.tsx`;
- nao carrega `/src/app.js`;
- nao carrega CSS global legado do v1.

O app-v2 continua recebendo estilos pelo seu proprio grafo:

- `src/app-v2/index.tsx`;
- `src/react/styles/tailwind.css`;
- `src/app-v2/styles/print.css`.

## Rollback

Rollback minimo em `index.html`:

```html
<div id="app">
  <noscript>
    <p style="padding: 20px; text-align: center">
      CoolTrack Pro requer JavaScript. Por favor, habilite no seu navegador.
    </p>
  </noscript>
</div>
<script type="module" src="/src/app.js"></script>
```

Para rollback completo do visual legado no mesmo arquivo, restaurar tambem os
links CSS legados removidos nesta CP:

```html
<link rel="stylesheet" href="/src/assets/styles/base.css" />
<link rel="stylesheet" href="/src/assets/styles/components.css" />
<link rel="stylesheet" href="/src/assets/styles/layout.css" />
<link rel="stylesheet" href="/src/assets/styles/desktop-fonts.css" />
<link rel="stylesheet" href="/src/assets/styles/theme-premium.css" />
<link rel="stylesheet" href="/src/assets/styles/ux-polish.css" />
<link rel="stylesheet" href="/src/assets/styles/tokens.css" />
<link rel="stylesheet" href="/src/assets/styles/redesign.css" />
<link rel="stylesheet" href="/src/assets/styles/equipment-detail-cp-h.css" />
<link rel="stylesheet" href="/src/assets/styles/equipment-list-cp-i.css" />
```

## TDD executado

RED:

```bash
npm test -- src/app-v2/primaryCutover.test.ts --run
```

Resultado esperado/observado:

- falhou porque `index.html` ainda usava `id="app"` e `/src/app.js`.

GREEN:

```bash
npm test -- src/app-v2/primaryCutover.test.ts --run
```

Resultado:

- 1 arquivo;
- 1 teste passou.

Testes focados adicionais:

```bash
npm test -- src/app-v2/primaryCutover.test.ts src/__tests__/equipamentosCpIAssets.test.js src/app-v2/main.test.tsx src/app-v2/authenticatedHarness.test.tsx --run
```

Resultado:

- 4 arquivos;
- 12 testes passaram.

## Validacao final executada

Comandos executados:

```bash
npm run format
npm test -- src/app-v2/primaryCutover.test.ts src/__tests__/equipamentosCpIAssets.test.js src/app-v2/main.test.tsx src/app-v2/authenticatedHarness.test.tsx --run
npm run build
npm run check
git diff --check
```

Resultado:

- format passou;
- testes focados passaram: 4 arquivos, 12 testes;
- build passou com warning de chunk maior que 500 kB;
- check passou com warning conhecido em `src/domain/pdf/shareReport.js`;
- `git diff --check` passou.

Browser local em `http://localhost:5173/`:

- `/` monta o app-v2;
- a tela mostra o shell app-v2 com `Hoje` e `CoolTrack`;
- nao houve erro de console impeditivo;
- root principal confirmado: `app-v2-root`;
- root legado ausente: `app`;
- script principal confirmado: `/src/app-v2/main.tsx`.

## Resultado

O app-v2 passou a ser a entrada principal local do produto. O v1 segue no
repositorio como baseline congelado e rollback possivel.

## Bloqueios remanescentes para Cloudflare principal

Mesmo com o corte local, ainda faltam:

- validar sessao Supabase real no browser;
- validar escrita real minima com usuario autenticado;
- validar router/deep links/refresh em `/`;
- validar smoke mobile e desktop;
- publicar Cloudflare Pages preview da branch;
- aprovar explicitamente as areas fora do primeiro corte.
