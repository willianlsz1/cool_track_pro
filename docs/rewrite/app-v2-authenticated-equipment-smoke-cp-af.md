# app-v2 - Authenticated equipment smoke CP-AF

## Objetivo

Ampliar o smoke autenticado do entrypoint principal para cobrir escrita minima
de equipamento vinculado a cliente autenticado, ainda com Supabase interceptado
localmente por Playwright.

Esta CP nao substitui a validacao com Supabase real. Ela reduz risco local antes
do Cloudflare Pages preview e da CP-Y.

## Escopo revisado antes da execucao

Arquivos de teste:

- `e2e/specs/app-v2-authenticated-primary.spec.js`

Arquivos documentais:

- `docs/rewrite/app-v2-authenticated-equipment-smoke-cp-af.md`
- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

## Contrato validado

O smoke E2E abre `/equipamentos` pelo entrypoint principal, injeta sessao
Supabase fake e usa um cliente remoto interceptado.

O teste confirma:

- o botao "Novo equipamento" abre o formulario no root principal;
- o formulario salva nome, local, cliente, tag e tipo;
- o fluxo envia `POST /rest/v1/equipamentos`;
- o payload inclui `user_id` do usuario autenticado;
- o payload inclui `cliente_id` do cliente remoto selecionado;
- o equipamento salvo volta para a lista do app-v2;
- nao ha erro bloqueante de console ou `pageerror`.

## Evidencia de schema revisada

Antes de adicionar o teste, foi revisado
`supabase/migrations/20260411000000_baseline_core_tables.sql`.

Conclusao:

- `public.equipamentos.id` e `text primary key`;
- o ID local gerado pelo app-v2 (`eq-shell-*`) nao conflita com o tipo atual do
  schema;
- `public.equipamentos.user_id` e `cliente_id` continuam sensiveis e exigem
  validacao real em CP-Y.

## Validacao executada

Teste focado:

```bash
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-authenticated-primary.spec.js
```

Resultado:

- 2 testes passaram em Chromium.

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
- RLS real, triggers reais e quotas reais nao foram exercitados;
- sessao real no browser continua pendente;
- Cloudflare Pages preview externo continua pendente;
- registro de servico, relatorio e orcamento com dados reais continuam fora
  deste smoke.

## Proximo passo recomendado

Executar CP-Y com conta Supabase real ou validar a URL externa do Cloudflare
Pages preview da branch, conforme o ambiente disponivel.
