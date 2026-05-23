# app-v2 - Primary cutover matrix CP-Z

## Objetivo

Definir, com base no estado atual do repositório, quais fluxos precisam estar
verdes para o app-v2 substituir o v1 como entrada principal do produto.

Esta CP é documental. Ela não altera runtime, `index.html`, router, storage real,
Supabase/RLS, PDF/share, WhatsApp, billing, upload, PMOC, v1 ou configs.

## Estado verificado

- Branch: `codex/rewrite-zero-react-parallel`
- HEAD inicial da CP: `b940f262bc7fa7b5f2010c2788ef25f7f41af0d0`
- Working tree inicial: limpo
- Entrada principal atual: CP-AB trocou `index.html` para `/src/app-v2/main.tsx`
- App-v2 atual: disponível via `src/app-v2/preview.html` e
  `src/app-v2/authenticated-preview.html`

## Fontes revisadas

- `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`
- `docs/rewrite/auditoria-ux-funcional-v1-v2.md`
- `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`
- `docs/rewrite/matriz-paridade-v1-v2.md`
- `src/app.js`
- `src/app-v2/index.tsx`
- `src/app-v2/preview.html`
- `src/app-v2/authenticated-preview.html`
- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `vite.config.js`

## Critérios de corte

Classificação usada nesta matriz:

- **Obrigatório para trocar:** sem isso, v2 não deve substituir v1.
- **Pode ficar fora do primeiro corte:** aceitável somente se aprovado
  explicitamente como limitação da primeira versão principal.
- **Etapa sensível própria:** não deve ser misturado com a troca de entrada.

## Matriz por fluxo

| Fluxo                    | Estado app-v2 atual                                                       | Decisão para corte                                 | Evidência atual                                                         | Próxima evidência necessária                                  |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| Entrada principal `/`    | CP-AB trocou para `/src/app-v2/main.tsx`                                  | Concluído para corte local                         | `docs/rewrite/app-v2-primary-cutover-cp-ab.md`                          | Cloudflare Pages preview com smoke                            |
| Bootstrap v2 produção    | Criado em `src/app-v2/main.tsx` e usado por `index.html`                  | Concluído para corte local                         | `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`, CP-AB                 | Validar em Cloudflare Pages preview                           |
| Preview local v2         | Funciona em `src/app-v2/preview.html`                                     | Suporte, não corte                                 | CP-W browser audit                                                      | Manter como harness local                                     |
| Preview autenticado      | Funciona em `authenticated-preview.html` sem erros de console             | Suporte, não corte                                 | CP-W browser audit                                                      | CP-Y com sessão real                                          |
| Login/sessão             | Fronteira e harness existem, sessão real não validada no browser          | Obrigatório para trocar                            | CP-T, CP-U, CP-V, CP-W                                                  | CP-Y com conta de teste autenticada                           |
| Fallback sem sessão      | Coberto por testes de harness/data source e browser local no bootstrap v2 | Obrigatório para trocar                            | `authenticatedHarness.test.tsx`, `appV2AuthenticatedDataSource.test.ts` | Cloudflare Pages preview                                      |
| Home Hoje                | Implementada no app-v2                                                    | Obrigatório para trocar                            | QA visual e testes app-v2 existentes                                    | Smoke em `/` após bootstrap v2                                |
| Alertas                  | Implementado como subfluxo app-v2                                         | Obrigatório para trocar                            | CP de alertas e navegação app-v2                                        | Smoke em `/` após bootstrap v2                                |
| Clientes                 | Fluxo local e adapters reais progressivos existem                         | Obrigatório para trocar                            | CP-G/CP-H, fases de clientes e CP-AE com Supabase fake                  | CP-Y criando/editando cliente sob usuário real                |
| Equipamentos             | Fluxo local e adapters reais progressivos existem                         | Obrigatório para trocar                            | CP-I/CP-J/CP-K, fases avançadas locais e CP-AF com Supabase fake        | CP-Y criando/editando equipamento sob usuário real            |
| Registro de serviço      | Fluxo principal mock/local está forte                                     | Obrigatório para trocar                            | Auditoria indica alta cobertura do registro                             | Validar no bootstrap v2 com dados reais mínimos               |
| Registros/histórico      | Filtros locais foram tratados em ciclos posteriores                       | Obrigatório para trocar no recorte operacional     | `servicos-registros-filtros-app-v2.md`                                  | Smoke local de filtro/lista no bootstrap v2                   |
| Relatórios locais        | Relatório local e consolidado local foram tratados                        | Obrigatório se substituir v1 operacionalmente      | `relatorios-consolidados-locais-app-v2.md`                              | Smoke local no bootstrap v2                                   |
| Orçamentos locais        | Ciclo local foi tratado; orçamento real segue fora                        | Obrigatório no recorte local, real pode ficar fora | docs de orçamentos fases 2/3 e CP-R                                     | Decisão explícita sobre orçamento real fora do primeiro corte |
| Conta/configurações      | Conta local fechada visualmente; perfil real fora                         | Obrigatório no recorte local                       | fases Conta 1-6 e QA visual                                             | Decisão explícita sobre perfil real mínimo                    |
| Router/deep links        | Rotas principais implementadas; subrotas fora                             | Subrotas/IDs exigem CP própria                     | `docs/rewrite/app-v2-primary-routes-cp-ad.md`                           | Validar rotas principais no preview externo                   |
| PDF/share                | Fora do app-v2 real                                                       | Etapa sensível própria                             | AGENTS e matriz                                                         | Decidir se fica fora do primeiro corte ou executar CP própria |
| WhatsApp real            | Fora do app-v2 real                                                       | Etapa sensível própria                             | AGENTS e matriz                                                         | Decidir se fica fora do primeiro corte ou executar CP própria |
| Billing/features pagas   | Fora do app-v2 real                                                       | Etapa sensível própria                             | AGENTS e matriz                                                         | Decidir se root v2 exige plano no primeiro corte              |
| Upload/storage fotos     | Placeholder local, sem upload real                                        | Etapa sensível própria                             | fases de anexos/equipamentos                                            | Decidir se fica fora do primeiro corte                        |
| PMOC real                | Fora                                                                      | Etapa sensível própria                             | AGENTS e matriz                                                         | Manter fora ou abrir CP própria                               |
| Cloudflare Pages preview | Smoke local de producao estatica passou; preview externo pendente         | Obrigatório para trocar                            | `docs/rewrite/app-v2-cloudflare-preview-smoke-cp-ac.md`                 | Reexecutar smoke na URL Cloudflare Pages preview              |
| Bundle size              | Medicao local ajustada para chunks emitidos pelo app-v2 principal         | Obrigatorio para PR de corte                       | `docs/rewrite/app-v2-primary-size-limit-cp-ag.md`                       | Confirmar check externo verde no PR                           |
| E2E do PR de corte       | Workflow alinhado para specs app-v2 relevantes                            | Obrigatorio para PR de corte                       | `docs/rewrite/app-v2-primary-e2e-suite-cp-ah.md`                        | Confirmar Playwright verde no PR                              |
| Rollback                 | Documentado em CP-AB                                                      | Obrigatório para trocar                            | `docs/rewrite/app-v2-primary-cutover-cp-ab.md`                          | Validar reversão se necessário                                |

## Primeiro corte recomendado

O primeiro corte v2 como versão principal deve ser **operacional mínimo**, não
paridade total com todas as integrações sensíveis do v1.

Incluído no primeiro corte:

- login/sessão real;
- fallback sem sessão;
- Hoje;
- Alertas;
- Clientes;
- Equipamentos;
- Registro de serviço;
- Registros/histórico local;
- Relatórios locais;
- Orçamentos locais;
- Conta local;
- mobile e desktop;
- smoke Cloudflare Pages preview;
- rollback explícito.

Fora do primeiro corte, se aprovado explicitamente:

- PDF/share real;
- WhatsApp real;
- billing/features pagas;
- upload/storage real de fotos;
- PMOC real;
- assinatura digital real;
- orçamento real com aceite/envio externo.

## Bloqueadores após a troca local do `index.html`

1. Validar sessão Supabase real no browser.
2. Validar escrita real mínima de cliente e equipamento sob usuário autenticado.
3. Validar rotas principais app-v2 no preview externo.
4. Validar fluxo operacional mínimo em mobile e desktop.
5. Publicar Cloudflare Pages preview da branch com v2 como root e reexecutar
   smoke E2E.
6. Confirmar Bundle Size verde no PR.
7. Confirmar Playwright/E2E verde no PR.
8. Aprovar explicitamente as áreas fora do primeiro corte.

## Próxima CP recomendada

Se houver sessão de teste disponível: executar CP-Y, validação real do
`authenticated-preview.html`.

CP-AB executou a troca local do `index.html` e validou `/` no browser local.
CP-AC validou `dist` via preview local de producao. CP-AD adicionou rotas
principais para `/`, `/equipamentos`, `/servicos` e `/conta`. CP-AE validou
leitura/escrita de cliente no root principal com sessao Supabase fake
interceptada por Playwright. CP-AF validou escrita de equipamento vinculado a
cliente no mesmo root principal fake-autenticado. CP-AG ajustou o contrato de
bundle-size para o bundle real do app-v2 principal, sem tocar em PDF/share ou
`manualChunks`. CP-AH alinhou o workflow E2E do PR de corte para as specs app-v2
relevantes.

O próximo checkpoint recomendado é publicar/validar a URL externa do Cloudflare
Pages preview da branch antes da promoção final.

## Validação desta CP

Validação documental esperada:

```bash
npm run format:check
git diff --check
```

Como não há mudança de runtime, `npm run build` e `npm run check` não são
obrigatórios para esta CP, mas continuam obrigatórios quando CP-AA ou CP-AB
alterarem código.

## Atualizacao CP-AI

O preview publico Netlify do PR expos um root vazio quando a env
`VITE_SUPABASE_ANON_KEY` nao estava configurada. O bootstrap principal agora usa
import dinamico para Supabase/harness autenticado e cai para `mountAppV2` quando
a inicializacao autenticada falha.

Essa protecao evita tela vazia em preview sem env, mas nao substitui a validacao
obrigatoria com env real, sessao real, escrita real minima e Cloudflare Pages
preview.

## Atualizacao CP-AJ

O preview Cloudflare do PR publicou o root `/`, mas `/equipamentos` retornou
`404.html`, indicando que o fallback SPA nao estava ativo para rotas diretas.

`public/_redirects` foi reduzido para uma unica regra compativel com Cloudflare
Pages:

```text
/*    /index.html    200
```

A validacao local confirmou que `dist/_redirects` carrega essa regra e que o
smoke de rotas principais passa em `vite preview`. A troca para versao principal
ainda depende de novo deploy do PR e smoke externo no Cloudflare Pages preview.

Na primeira validacao externa apos `_redirects`, `/equipamentos` ainda retornou
`404.html`. Como o app-v2 agora e SPA principal, `public/404.html` foi removido
para permitir o fallback SPA padrao do Cloudflare Pages em rotas diretas. A
validacao final continua dependendo de novo deploy e smoke externo.

## Atualizacao CP-AK

O preview Cloudflare `https://8e3f035a.cool-track-pro.pages.dev` foi validado no
HEAD `0c3c630351ca29e0217896e3ac690514b85ce629` em 12 combinacoes:

- rotas: `/`, `/equipamentos`, `/servicos`, `/conta`;
- viewports: `mobile-390`, `desktop-1366`, `desktop-1920`.

Todas passaram com status 200, `#app-v2-root`, ausencia do root legado `#app`,
sem overflow horizontal e com exatamente uma navegacao principal visivel. No
mesmo HEAD, PR #287 estava `CLEAN` e os checks externos principais estavam
verdes.

Com isso, os bloqueadores 3, 4, 5, 6 e 7 desta matriz estao cobertos para o
preview externo atual. Restam CP-Y com sessao/escrita real e decisao explicita
sobre areas fora do primeiro corte.

## Atualizacao CP-Y preflight

Foi criado `docs/rewrite/app-v2-authenticated-real-session-cp-y.md` com o
procedimento de validacao real. A pre-checagem confirmou que `.env.local` possui
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, mas o ambiente atual nao possui
credenciais de conta de teste (`APP_V2_TEST_EMAIL`/`APP_V2_TEST_PASSWORD` ou
equivalentes).

Portanto, os bloqueadores 1 e 2 permanecem abertos ate haver conta real de
teste para provar sessao, leitura e escrita minima sob usuario autenticado.

## Atualizacao CP-AL

Foi criado `docs/rewrite/app-v2-primary-go-no-go-cp-al.md` para consolidar o
estado go/no-go do primeiro corte.

Resumo:

- gates tecnicos de build, E2E, bundle, Cloudflare, rotas principais,
  mobile/desktop e fallback publico estao verdes no PR #287;
- o PR segue em draft;
- sessao Supabase real, escrita real minima e isolamento real entre usuarios
  seguem abertos;
- a aprovacao explicita das areas fora do primeiro corte foi transformada em
  checklist auditavel.

O corte final nao deve prosseguir enquanto CP-Y e as aprovacoes explicitas das
areas fora do primeiro corte nao estiverem concluidas.

## Atualizacao CP-AM

Foi criado
`docs/rewrite/app-v2-primary-cloudflare-cutover-runbook-cp-am.md` para
consolidar o procedimento operacional de promocao e rollback no Cloudflare
Pages.

Resumo:

- o runbook nao executa corte e nao altera runtime;
- define pre-condicoes para remover o PR #287 de draft;
- padroniza a execucao da CP-Y com
  `scripts/app-v2-real-session-smoke.mjs`;
- descreve o smoke pos-promocao na URL principal;
- documenta rollback minimo para voltar ao root legado `#app` e
  `/src/app.js`.

O proximo gate continua sendo CP-Y com conta Supabase real e aprovacao explicita
das areas fora do primeiro corte.
