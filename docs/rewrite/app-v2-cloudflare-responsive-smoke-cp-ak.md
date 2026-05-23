# app-v2 - CP-AK - smoke responsivo no Cloudflare Pages

## Objetivo

Validar o app-v2 publicado no Cloudflare Pages em rotas principais e viewports
representativas antes de promover a branch como versao principal.

Esta CP e de validacao/documentacao. Ela nao altera runtime, router, storage
real, Supabase/RLS, PDF/share, WhatsApp, billing, upload/storage, PMOC ou v1.

## Ambiente validado

- Branch: `codex/rewrite-zero-react-parallel`
- HEAD validado: `0c3c630351ca29e0217896e3ac690514b85ce629`
- Preview Cloudflare:
  `https://8e3f035a.cool-track-pro.pages.dev`
- PR: `https://github.com/Willianlsz1/Cool_Track_Pro/pull/287`

## Checks externos do PR

No momento da validacao, o PR estava com `mergeStateStatus: CLEAN` e estes
checks externos estavam verdes:

- `test-and-build`
- `Playwright`
- `pgTAP`
- `size-limit`
- `Cloudflare Pages`
- `Supabase Preview`
- `netlify/cooltrackpro/deploy-preview`

## Smoke executado

Rotas:

- `/`
- `/equipamentos`
- `/servicos`
- `/conta`

Viewports:

- `mobile-390`: 390 x 844
- `desktop-1366`: 1366 x 900
- `desktop-1920`: 1920 x 1080

Assertivas por combinacao:

- status HTTP 200;
- `#app-v2-root` presente exatamente uma vez;
- `#app` legado ausente;
- sem overflow horizontal acima de 2 px;
- exatamente uma navegacao principal visivel.

## Resultado

Todas as 12 combinacoes passaram.

Resumo:

```json
{
  "baseUrl": "https://8e3f035a.cool-track-pro.pages.dev",
  "routes": ["/", "/equipamentos", "/servicos", "/conta"],
  "viewports": ["mobile-390", "desktop-1366", "desktop-1920"],
  "failures": []
}
```

## Limites

Esta CP nao substitui CP-Y. Ainda falta validar:

- sessao Supabase real no browser;
- leitura real sob usuario autenticado;
- escrita real minima de cliente e equipamento;
- isolamento de dados entre usuarios reais;
- decisao explicita sobre areas fora do primeiro corte.

## Proximo passo recomendado

Executar CP-Y com uma conta Supabase real de teste. Se a conta/env real nao
estiver disponivel, registrar o bloqueio e separar a preparacao documental da
execucao autenticada.
