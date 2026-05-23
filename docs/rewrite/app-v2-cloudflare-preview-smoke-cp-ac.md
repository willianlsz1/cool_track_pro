# app-v2 - Cloudflare preview smoke CP-AC

## Objetivo

Validar o app-v2 como entrada principal em um ambiente equivalente a producao
estatica, usando `npm run build` + `npm run preview`, antes de depender do
preview externo do Cloudflare Pages.

Esta CP nao altera runtime do produto. Ela adiciona um smoke E2E reutilizavel
para o preview Cloudflare futuro.

## Escopo revisado antes da execucao

Arquivos de teste alterados:

- `e2e/specs/app-v2-primary-entrypoint.spec.js`

Arquivos documentais alterados:

- `docs/rewrite/app-v2-cloudflare-preview-smoke-cp-ac.md`
- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

Contratos envolvidos:

- `index.html` como entrada principal;
- root `app-v2-root`;
- ausencia do root legado `app`;
- ausencia de `/src/app.js`;
- fallback SPA por `_redirects`;
- headers de plataforma por `_headers`.

## Implementacao

Foi criado o smoke:

```text
e2e/specs/app-v2-primary-entrypoint.spec.js
```

Cobertura:

- `/` renderiza o app-v2;
- root `app-v2-root` existe;
- root legado `app` nao existe;
- tela inicial mostra `Hoje` e `CoolTrack Pro`;
- `index.html` nao carrega `/src/app.js`;
- `index.html` nao carrega CSS global legado `redesign.css`;
- rota nao-arquivo `/equipamentos` cai no fallback SPA e renderiza app-v2;
- erros de console/pageerror bloqueantes falham o teste.

## Validacao executada

Servidor de preview de producao local:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Smoke E2E:

```bash
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:4173'
$env:PLAYWRIGHT_PORT='4173'
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-primary-entrypoint.spec.js
```

Resultado:

- 2 testes passaram;
- `/` validado;
- `/equipamentos` validado como fallback SPA;
- sem erros de console/pageerror bloqueantes.

Arquivos de plataforma copiados para `dist` pelo build:

- `dist/_redirects`;
- `dist/_headers`.

Atualizacao CP-AJ:

- o preview externo Cloudflare revelou que `/equipamentos` retornava 404;
- a regra antiga de `_redirects` continha rewrite `404`, nao suportado pelo
  Cloudflare Pages;
- `public/_redirects` passou a manter apenas o fallback SPA `/* /index.html
200`.

## Resultado

O app-v2 passou no smoke local de producao estatica. O teste criado deve ser
reexecutado contra a URL de preview do Cloudflare Pages assim que a plataforma
gerar o preview da branch.

## Atualizacao CP-AK

O smoke externo foi repetido contra
`https://8e3f035a.cool-track-pro.pages.dev` no HEAD
`0c3c630351ca29e0217896e3ac690514b85ce629`.

Resultado:

- `/`, `/equipamentos`, `/servicos` e `/conta` retornaram 200;
- `#app-v2-root` foi renderizado;
- `#app` legado nao apareceu;
- mobile 390, desktop 1366 e desktop 1920 nao apresentaram overflow horizontal;
- uma navegacao principal ficou visivel em cada viewport.

Documento de evidencia: `docs/rewrite/app-v2-cloudflare-responsive-smoke-cp-ak.md`.

## Bloqueios remanescentes

- sessao Supabase real no browser continua pendente;
- escrita real minima com usuario autenticado continua pendente;
- router/deep links de produto ainda precisam decisao propria;
- aprovacao explicita das areas fora do primeiro corte continua pendente.
