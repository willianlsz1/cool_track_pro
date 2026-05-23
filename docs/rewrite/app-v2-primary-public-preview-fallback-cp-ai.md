# app-v2 - CP-AI - fallback do preview publico sem env Supabase

## Objetivo

Evitar que o app-v2 principal fique em tela vazia em previews publicos quando as
variaveis `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` nao estiverem
configuradas no ambiente publicado.

## Diagnostico

O smoke externo executado contra o preview publico Netlify do PR renderizou
`#app-v2-root`, mas o root ficou vazio. A pagina abortou no bootstrap com:

```text
[Supabase] Missing required environment variable: VITE_SUPABASE_ANON_KEY.
```

O problema vinha de `src/app-v2/main.tsx`: o arquivo importava
`../core/supabase.js` no topo do modulo. Quando a env faltava, o erro era
lancado antes que o app-v2 pudesse montar o fallback local.

O erro de CSP do Netlify Drawer tambem apareceu no console, mas nao foi tratado
nesta CP porque e ruido do provedor de preview e nao a causa do root vazio.

## Mudanca

- `src/app-v2/main.tsx` passou a carregar Supabase, browser options e harness
  autenticado via import dinamico dentro do bootstrap de producao.
- Se o bootstrap autenticado falhar por ausencia de env ou outro erro de
  inicializacao, o app-v2 monta `mountAppV2(root)` como fallback local.
- `src/app-v2/main.test.tsx` cobre os dois caminhos:
  - env/auth disponivel: monta o harness autenticado;
  - env/auth indisponivel: monta fallback local sem derrubar a pagina.

## Fora de escopo

- Configurar variaveis reais no Netlify ou Cloudflare.
- Validar Supabase/RLS real.
- Alterar storage real, migrations, billing, WhatsApp, PDF/share, upload, PMOC,
  v1/legado ou dependencias.
- Tratar CSP do Netlify Drawer.

## Validacao esperada

```bash
npm run test -- src/app-v2/main.test.tsx
npm run format
npm run build
npm run check
npm run size
git diff --check
```

Depois do deploy do PR, reexecutar:

```bash
$env:PLAYWRIGHT_BASE_URL='<preview-publico>'
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-primary-entrypoint.spec.js --reporter=list
```

## Risco remanescente

Este fallback garante renderizacao do app-v2 em preview sem env, mas nao
substitui a validacao obrigatoria com env real, sessao real, leitura/escrita
real minima e Cloudflare Pages preview antes de promover o v2 como versao
principal.
