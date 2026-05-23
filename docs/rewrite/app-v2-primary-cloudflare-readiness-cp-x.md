# app-v2 - Primary Cloudflare readiness CP-X

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` or `superpowers:executing-plans` to
> implement future runtime tasks from this plan task-by-task. Steps use checkbox
> (`- [ ]`) syntax for tracking.

**Goal:** Definir o caminho seguro para o app-v2 substituir o v1 como entrada
principal do produto e ser publicado no Cloudflare Pages sem regressao dos
fluxos criticos.

**Architecture:** O v1 permanece congelado como baseline ate a troca explicita
do entrypoint principal. O app-v2 continua isolado em `src/app-v2/`, com
promocao feita por uma CP propria que altera somente o bootstrap/entrypoint
principal depois que os gates abaixo estiverem verdes.

**Tech Stack:** Vite, React, TypeScript no app-v2, Tailwind, Supabase,
Cloudflare Pages via build `npm run build` e output `dist`.

---

## 1. Estado atual verificado

Branch auditada:

```text
codex/rewrite-zero-react-parallel
```

HEAD auditado:

```text
1c97c0dcbb5a0ae7c6346594445e5f9a44383785
```

Entrada principal atual de producao:

```html
<script type="module" src="/src/app.js"></script>
```

Arquivo:

```text
index.html
```

Conclusao: a entrada principal ainda monta o v1/legado. O app-v2 ainda nao esta
no lugar do v1.

Entradas app-v2 existentes:

```text
http://localhost:5173/src/app-v2/preview.html
http://localhost:5173/src/app-v2/authenticated-preview.html
```

O build Cloudflare/Vite atual continua usando:

```text
npm run build
dist
```

O workflow `.github/workflows/ci.yml` executa `npm run check` e `npm run build`
antes do deploy real do Cloudflare Pages conectado ao repo.

## 2. O que ja esta pronto no app-v2

- Shell app-v2 isolado do v1.
- Telas principais do app-v2 em React/TypeScript:
  - Hoje;
  - Alertas;
  - Equipamentos;
  - Clientes;
  - Servicos;
  - Relatorios;
  - Orcamentos;
  - Conta.
- Store mockada unica e actions/selectors operacionais.
- `AppV2DataPort` como fronteira de dados.
- Adapters locais/memoria para o shell.
- Mutacoes locais importantes roteadas pelo data port.
- Adapters Supabase progressivos para clientes/equipamentos.
- Harness autenticado opt-in.
- Entrypoint autenticado opt-in separado.
- Auditoria browser local dos dois previews sem erros de console.

## 3. O que ainda bloqueia promover v2 para principal

| Gate                            | Estado atual                   | Bloqueia troca?                      | Evidencia necessaria                                                       |
| ------------------------------- | ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------- |
| Entrypoint principal v2         | `index.html` aponta ao app-v2  | Nao para corte local; sim para cloud | Falta validar Cloudflare Pages preview                                     |
| Sessao Supabase real no browser | fake local validado; real nao  | Sim                                  | Login real ou sessao de teste em `authenticated-preview.html`              |
| Fluxos criticos com dados reais | parcial; cliente/equip fake    | Sim                                  | Criar/editar cliente/equipamento e iniciar servico sob usuario autenticado |
| Paridade dos fluxos de producao | parcialmente documentada       | Sim                                  | Matriz final v1 x v2 por fluxo critico                                     |
| PDF/share/WhatsApp              | fora do app-v2 real            | Sim se forem requisito do lancamento | CP dedicada ou decisao explicita de deixar fora do primeiro corte          |
| Billing/features pagas          | fora do app-v2 real            | Sim se rota principal exigir plano   | CP dedicada ou gate de fallback                                            |
| Router/deep links               | rotas principais implementadas | Subrotas ainda bloqueiam deep links  | CP-AD cobre `/`, `/equipamentos`, `/servicos` e `/conta`                   |
| Cloudflare Pages preview        | smoke local de producao passou | Sim                                  | Falta URL externa de preview Cloudflare Pages                              |
| Rollback                        | documentado em CP-AB           | Nao para corte local; sim para cloud | Falta validar rollback em preview/branch se necessario                     |

## 4. Decisao tecnica recomendada

Nao trocar `index.html` diretamente para `authenticatedPreview.tsx`.

Motivo: `authenticatedPreview.tsx` e um harness de validacao local opt-in. Ele
foi criado para testar a fronteira real sem mudar a entrada default. Promover
esse arquivo diretamente misturaria harness e producao.

Criar uma CP propria para um bootstrap de producao app-v2:

```text
src/app-v2/main.tsx
```

Esse bootstrap deve:

1. montar em um root de producao no `index.html`;
2. usar `createAuthenticatedAppV2BrowserOptions` ou uma factory equivalente de
   producao;
3. preservar fallback controlado quando nao houver sessao;
4. nao importar telas v1;
5. manter auth/Supabase restritos ao entrypoint/factory, nunca ao shell/telas.

## 5. Sequencia recomendada

### CP-Y - Sessao real no authenticated preview

Objetivo:

Validar o harness autenticado com sessao Supabase real ativa antes de qualquer
troca de entrypoint.

Arquivos previstos:

- `docs/rewrite/app-v2-authenticated-real-session-cp-y.md`
- opcionalmente testes novos se surgir lacuna objetiva

Passos:

- [ ] Autenticar uma conta de teste no ambiente local.
- [ ] Abrir
      `http://localhost:5173/src/app-v2/authenticated-preview.html`.
- [ ] Confirmar que a tela `Hoje` carrega sem erro de console.
- [ ] Confirmar que leitura de clientes/equipamentos usa usuario autenticado.
- [ ] Criar ou editar um cliente via fluxo app-v2.
- [ ] Criar ou editar um equipamento via fluxo app-v2.
- [ ] Confirmar que dados de outro usuario nao aparecem.
- [ ] Registrar evidencia e limites da validacao.

Validacao:

```bash
npm run format:check
git diff --check
```

Se houver mudanca de codigo:

```bash
npm run format
npm run build
npm run check
```

### CP-Z - Matriz final de corte v1 -> v2

Objetivo:

Fechar quais fluxos do v1 sao obrigatorios para a primeira versao principal do
v2 e quais ficam explicitamente fora do primeiro corte.

Arquivos previstos:

- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`

Fluxos minimos para decisao:

- login/sessao;
- Hoje;
- Alertas;
- Clientes;
- Equipamentos;
- Registro de servico;
- Relatorios;
- Orcamentos;
- Conta;
- fallback sem sessao;
- erro de rede/Supabase;
- mobile;
- desktop.

Validacao:

```bash
npm run format:check
git diff --check
```

### CP-AA - Bootstrap principal app-v2 atras de gate

Objetivo:

Criar um bootstrap de producao app-v2 sem trocar ainda o `index.html` de
producao.

Arquivos previstos:

- `src/app-v2/main.tsx`
- `src/app-v2/main.test.tsx`
- `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`

Regras:

- `main.tsx` pode importar Supabase/factory de producao;
- `AppV2Shell` e telas continuam sem Supabase/auth/storage direto;
- `preview.tsx` continua local/mockado;
- `authenticatedPreview.tsx` continua harness.

Status:

- concluido em `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`;
- `src/app-v2/main.tsx` foi criado;
- `index.html` ainda nao foi alterado.

Validacao:

```bash
npm test -- src/app-v2/main.test.tsx src/app-v2/index.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```

### CP-AB - Troca controlada do entrypoint principal

Objetivo:

Trocar `index.html` para montar o app-v2 principal, com rollback simples.

Arquivos previstos:

- `index.html`
- possivel backup documental em `docs/rewrite/app-v2-primary-cutover-cp-ab.md`

Mudanca esperada:

```html
<script type="module" src="/src/app-v2/main.tsx"></script>
```

Rollback:

```html
<script type="module" src="/src/app.js"></script>
```

Validacao local obrigatoria:

```bash
npm run format
npm run build
npm run check
npm run test:e2e
git diff --check
```

Status:

- concluido em `docs/rewrite/app-v2-primary-cutover-cp-ab.md`;
- `index.html` agora monta `app-v2-root`;
- `index.html` agora carrega `/src/app-v2/main.tsx`;
- `index.html` nao carrega `/src/app.js`;
- CSS global legado do v1 nao e carregado no entrypoint principal app-v2.

Validacao browser obrigatoria:

- abrir `http://localhost:5173/`;
- validar login/fallback;
- validar Hoje;
- validar Clientes;
- validar Equipamentos;
- validar Registro de servico;
- validar Relatorios/Orcamentos conforme matriz de corte;
- validar mobile e desktop.

### CP-AC - Cloudflare Pages preview e smoke de producao

Objetivo:

Validar o app-v2 como entrada principal em ambiente publicado antes de tratar
como versao principal.

Requisitos:

- branch publicada em Cloudflare Pages preview;
- env vars `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas;
- build Cloudflare verde;
- smoke manual em URL de preview;
- rollback definido.

Validacao:

```bash
npm run build
npm run check
```

Status local:

- smoke local de producao documentado em
  `docs/rewrite/app-v2-cloudflare-preview-smoke-cp-ac.md`;
- `npm run preview -- --host 127.0.0.1 --port 4173` serviu `dist`;
- `e2e/specs/app-v2-primary-entrypoint.spec.js` passou contra `http://127.0.0.1:4173`;
- `/` e `/equipamentos` renderizaram app-v2 sem root legado;
- `dist/_redirects` e `dist/_headers` existem.

Pendente:

- reexecutar o mesmo smoke contra a URL externa do Cloudflare Pages preview da
  branch.

### CP-AD - Rotas principais app-v2

Objetivo:

Garantir que o app-v2 como root principal abra as quatro areas principais por
URL, sem promover subrotas, IDs ou fluxo de registro para contratos publicos.

Status:

- concluido em `docs/rewrite/app-v2-primary-routes-cp-ad.md`;
- `src/app-v2/navigation/appV2Routes.ts` define o contrato minimo:
  - `/`;
  - `/equipamentos`;
  - `/servicos`;
  - `/conta`;
- `AppV2Shell` inicializa a area ativa a partir de `window.location.pathname`;
- troca de area atualiza `history.pushState`;
- `popstate` sincroniza a area principal;
- `e2e/specs/app-v2-primary-entrypoint.spec.js` agora valida `/equipamentos`,
  `/servicos` e `/conta` em preview de producao.

Fora de escopo:

- subrotas como `/servicos/orcamentos`;
- URLs com IDs;
- recuperacao de `serviceDraft` apos refresh;
- router legado;
- storage, Supabase/RLS, PDF/share, WhatsApp, billing, upload ou PMOC.

Smoke Cloudflare:

- abrir URL de preview;
- confirmar assets carregados;
- confirmar login/sessao;
- confirmar fluxo minimo autenticado;
- confirmar que erros de console nao bloqueiam uso;
- confirmar comportamento mobile.

### CP-AE - Smoke autenticado no entrypoint principal

Objetivo:

Validar que o root principal do app-v2 consegue usar a fronteira autenticada em
browser com Supabase interceptado localmente, antes de depender de credenciais
reais.

Status:

- concluido em `docs/rewrite/app-v2-authenticated-primary-smoke-cp-ae.md`;
- `e2e/specs/app-v2-authenticated-primary.spec.js` abre `/equipamentos`;
- a fixture injeta sessao fake e dados remotos de `clientes`;
- o teste confirma leitura remota de clientes;
- o teste confirma escrita de cliente com `user_id` autenticado;
- `e2e/fixtures/authedSession.js` agora simula resposta objeto para chamadas
  `.single()`.

Validacao:

```bash
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-authenticated-primary.spec.js
```

Limite:

- nao substitui CP-Y, porque ainda nao valida Supabase real, RLS real,
  Cloudflare Pages externo ou dados reais persistidos.

### CP-AF - Smoke autenticado de equipamento no entrypoint principal

Objetivo:

Validar escrita minima de equipamento no root principal com sessao Supabase fake
e cliente remoto interceptado.

Status:

- concluido em `docs/rewrite/app-v2-authenticated-equipment-smoke-cp-af.md`;
- `e2e/specs/app-v2-authenticated-primary.spec.js` agora tambem cobre
  equipamento;
- o teste confirma `POST /rest/v1/equipamentos`;
- o payload inclui `user_id`, `cliente_id`, nome, local, tag e tipo;
- o equipamento salvo aparece na lista app-v2.

Validacao:

```bash
npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-authenticated-primary.spec.js
```

Limite:

- nao substitui validacao com Supabase real, RLS real, triggers reais, quotas
  reais ou Cloudflare Pages externo.

### CP-AG - Bundle-size do entrypoint principal

Objetivo:

Corrigir o contrato de medicao de bundle para o app-v2 como entrada principal,
sem alterar runtime, PDF/share, `manualChunks`, storage, router, Supabase/RLS,
billing ou legado/v1.

Status:

- concluido em `docs/rewrite/app-v2-primary-size-limit-cp-ag.md`;
- `.size-limit.json` deixou de exigir o chunk legado `vendor-pdf.*.js`;
- a medicao agora cobre `index.*.js`, `vendor-supabase.*.js` e CSS;
- `npm run size` passou localmente.

Limite:

- nao valida PDF/share real e nao altera a estrategia de chunks do Vite;
- PDF/share permanece etapa sensivel propria se entrar no primeiro corte.

### CP-AH - E2E do PR de corte principal

Objetivo:

Alinhar o workflow E2E do PR de corte ao app-v2 como root principal.

Status:

- concluido em `docs/rewrite/app-v2-primary-e2e-suite-cp-ah.md`;
- `.github/workflows/e2e.yml` roda as specs app-v2 relevantes para o PR de
  corte;
- `app-v2-service-layout.spec.js` foi ajustado para selecionar o card
  `Limpeza preventiva`, que e o accessible name atual.

Limite:

- specs legadas continuam no repositorio como referencia do v1;
- migracao ou arquivamento formal das specs legadas fica para etapa propria de
  harness E2E.

### CP-AI - Fallback do preview publico sem env Supabase

Objetivo:

Evitar tela vazia no root principal quando o preview publico nao possui
`VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` configuradas.

Status:

- concluido em
  `docs/rewrite/app-v2-primary-public-preview-fallback-cp-ai.md`;
- `src/app-v2/main.tsx` carrega Supabase e harness autenticado por import
  dinamico;
- se o bootstrap autenticado falhar na inicializacao, o root principal monta
  `mountAppV2(root)` como fallback local;
- `src/app-v2/main.test.tsx` cobre o caminho autenticado e o fallback sem env.

Limite:

- nao configura env real no provedor;
- nao valida Supabase/RLS real, sessao real ou escrita real;
- smoke externo deve ser reexecutado apos o deploy do PR atualizado.

### CP-AJ - Fallback SPA no Cloudflare Pages

Objetivo:

Garantir que as rotas principais do app-v2 funcionem por acesso direto no
Cloudflare Pages preview.

Status:

- concluido em `docs/rewrite/app-v2-cloudflare-spa-fallback-cp-aj.md`;
- `public/_redirects` foi reduzido para a regra Cloudflare-compatible
  `/* /index.html 200`;
- `e2e/specs/app-v2-primary-entrypoint.spec.js` ignora somente o erro conhecido
  de CSP do Netlify Drawer no smoke externo.

Limite:

- validacao final depende de novo deploy do PR e smoke externo no Cloudflare
  Pages;
- Supabase/RLS real, sessao real e escrita real continuam gates separados.

## 6. Criterio para declarar "v2 pode substituir v1"

O app-v2 so deve substituir o v1 quando todos estes itens tiverem evidencia:

- `index.html` usa bootstrap principal app-v2, nao harness;
- build local passa;
- `npm run check` passa;
- bundle-size passa no PR;
- E2E relevante passa ou existe justificativa documentada para lacuna;
- browser local confirma root `/` usando v2;
- sessao real Supabase confirmada;
- leitura/escrita minima real confirmada;
- matriz final v1 x v2 aprovada;
- Cloudflare Pages preview validado;
- rollback documentado em um commit simples;
- areas fora do primeiro corte estao explicitamente aprovadas.

## 7. Resumo executivo

O app-v2 ja e a entrada principal local desta branch apos a CP-AB. CP-AD cobriu
rotas principais; CP-AE/CP-AF cobriram leitura/escrita autenticada de cliente e
equipamento com Supabase fake no root principal. CP-AG corrigiu a medicao de
bundle-size para o bundle emitido pelo app-v2 principal. CP-AH alinhou o E2E do
PR de corte as specs app-v2 relevantes. CP-AI adicionou fallback local quando o
preview publico nao possui env Supabase, evitando root vazio. Ele ainda nao deve
virar principal no Cloudflare ate passar por sessao real, leitura/escrita minima
real, smoke mobile/desktop e Cloudflare Pages preview.

O proximo passo recomendado depende do ambiente disponivel: validar URL externa
do Cloudflare Pages preview ou executar CP-Y com sessao Supabase real.
