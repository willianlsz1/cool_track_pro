# app-v2 - CP-AJ - fallback SPA no Cloudflare Pages

## Objetivo

Garantir que as rotas publicas principais do app-v2 sejam servidas pelo
`index.html` no Cloudflare Pages preview:

- `/`
- `/equipamentos`
- `/servicos`
- `/conta`

## Diagnostico

O preview Cloudflare do PR publicou o app-v2 no root `/`, mas `/equipamentos`
retornou `public/404.html` com status 404. Isso significa que o app React estava
correto, mas o fallback SPA da plataforma nao estava ativo para rotas diretas.

Fonte oficial consultada:

- Cloudflare Pages declara `_redirects` como arquivo de regras no diretorio
  estatico.
- O formato por linha e `[source] [destination] [code?]`.
- Comentarios iniciados por `#` sao permitidos.
- Rewrites/proxy `200` sao suportados.
- Rewrites com outros status, como `404`, nao sao suportados.
- Quando existe `404.html`, o comportamento SPA default deixa de ser automatico
  e a rota nao encontrada pode receber a pagina 404.

## Mudanca

- `public/_redirects` foi reduzido para uma regra Cloudflare-compatible:

```text
/*    /index.html    200
```

- `e2e/specs/app-v2-primary-entrypoint.spec.js` passou a ignorar somente o erro
  conhecido de CSP do Netlify Drawer, que e injetado pelo provedor de preview e
  nao representa erro do app.

## Fora de escopo

- Remover `public/404.html`.
- Alterar `_headers`, CSP, service worker, Vite, `manualChunks`, package files
  ou dependencias.
- Validar Supabase/RLS real, billing, PDF/share, WhatsApp, upload/storage,
  PMOC, orcamento real ou v1/legado.

## Validacao esperada

```bash
npm run build
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:4173'
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-primary-entrypoint.spec.js --reporter=list
npm run format
npm run check
git diff --check
```

Depois do deploy:

```bash
$env:PLAYWRIGHT_BASE_URL='https://<cloudflare-preview>'
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-primary-entrypoint.spec.js --reporter=list
```

## Risco remanescente

Sem a regra antiga de `/assets/* -> 404`, um asset hash inexistente pode cair no
fallback SPA dependendo do comportamento da plataforma. Esse risco deve ser
tratado em etapa propria de cache/service worker se reaparecer. Para o corte
principal, o bloqueio atual e mais direto: rotas publicas do app-v2 precisam
abrir no Cloudflare Pages.
