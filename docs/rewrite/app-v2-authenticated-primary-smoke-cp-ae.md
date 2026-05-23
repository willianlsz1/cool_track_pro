# app-v2 - Authenticated primary smoke CP-AE

## Objetivo

Validar o entrypoint principal `/` do app-v2 com sessao Supabase simulada no
browser, cobrindo leitura remota de clientes e escrita minima de cliente sem
depender de credenciais reais ou URL externa do Cloudflare Pages.

Esta CP aumenta a cobertura antes da promocao final, mas nao substitui a
validacao obrigatoria com sessao Supabase real.

## Escopo revisado antes da execucao

Arquivos de teste:

- `e2e/specs/app-v2-authenticated-primary.spec.js`
- `e2e/fixtures/authedSession.js`

Arquivos documentais:

- `docs/rewrite/app-v2-authenticated-primary-smoke-cp-ae.md`
- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

## Contrato validado

O smoke E2E abre `/equipamentos` pelo entrypoint principal do produto, injeta
uma sessao Supabase fake e intercepta REST Supabase localmente.

O teste confirma:

- `index.html` monta o app-v2 principal, nao o shell legado;
- a sessao fake permite ativar o data source autenticado;
- a lista de Clientes usa dados remotos interceptados da tabela `clientes`;
- o fluxo "Novo cliente" envia `POST /rest/v1/clientes`;
- o payload de escrita inclui `user_id` do usuario autenticado;
- o cliente salvo retorna para a lista do app-v2;
- nao ha erro bloqueante de console ou `pageerror`.

## Ajuste na fixture E2E

`e2e/fixtures/authedSession.js` ja simulava POST/PATCH/PUT retornando array,
comportamento compativel com `.select()` simples.

O writer real do app-v2 usa `.select(...).single()`. Para esse contrato, o
Supabase/PostgREST responde um objeto unico quando o request pede
`application/vnd.pgrst.object+json`.

A fixture agora detecta esse header e retorna um objeto unico somente nesses
casos. Isso deixa o E2E mais proximo do contrato real sem alterar runtime do
app-v2.

## Validacao executada

Teste focado:

```bash
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-authenticated-primary.spec.js
```

Resultado:

- 1 teste passou em Chromium.

## Fora de escopo

Nao foram alterados:

- runtime do app-v2;
- `index.html`;
- router;
- storage real;
- Supabase/RLS;
- Cloudflare Pages;
- PDF/share;
- WhatsApp;
- billing;
- upload/storage;
- PMOC;
- v1/legado.

## Riscos remanescentes

- a validacao ainda usa Supabase fake interceptado pelo Playwright;
- sessao real no browser continua pendente;
- escrita real de cliente/equipamento em Supabase real continua pendente;
- Cloudflare Pages preview externo continua pendente;
- o smoke cobre cliente, mas nao equipamento, registro de servico, relatorio ou
  orcamento com dados reais.

## Proximo passo recomendado

Se houver URL de preview do Cloudflare Pages, executar o smoke externo da
branch.

Se houver conta Supabase de teste, executar CP-Y com sessao real e escrita real
minima de cliente/equipamento.
