# Validacao geral pos-Mudanca 16/17

Data: 2026-05-09

## Objetivo

Checagem geral do app apos o encerramento da Mudanca 16 como base estavel
operacional e da Mudanca 17 como hardening de seguranca operacional, antes de
iniciar a Mudanca 18.

Este CP foi tratado como validacao/read-only por padrao. Nenhuma correcao de
codigo, fluxo, design, teste, migration, Edge Function, CSS, pacote ou
dependencia foi iniciada.

## Base

| Item                            | Resultado                                                                   |
| ------------------------------- | --------------------------------------------------------------------------- |
| Branch                          | `main`                                                                      |
| HEAD inicial                    | `1b61ce6b5b6c19a77ad5ece3a1d89a787f0566d1`                                  |
| HEAD final                      | `1b61ce6b5b6c19a77ad5ece3a1d89a787f0566d1` antes deste relatorio documental |
| Remoto                          | `origin` (`https://github.com/Willianlsz1/Cool_Track_Pro.git`)              |
| Sincronia                       | `git rev-list --left-right --count HEAD...origin/main` retornou `0 0`       |
| Working tree inicial            | limpo                                                                       |
| Working tree antes do relatorio | limpo                                                                       |

## Documentacao lida

- `AGENTS.md`
- `docs/security/mudanca-17-final-report.md`
- `docs/security/mudanca-17-codex-security-triage.md`
- `docs/migration/mudanca-16-stability-e2e-cache-inventario.md`
- `docs/rewrite/checkpoints-recentes-resumo.md`

Conclusao documental:

- Mudanca 16 esta encerrada como base estavel operacional.
- Mudanca 17 esta encerrada como hardening de seguranca operacional.
- A proxima fase recomendada segue sendo Mudanca 18 / CP-A - Planejamento das
  mudancas de fluxo, inicialmente read-only.

## Ambiente e variaveis

Mapeamento por nome de variavel, sem ler ou imprimir valores sensiveis:

- Frontend usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `src/core/supabaseConfig.js` centraliza o contrato frontend e nao usa
  `VITE_SUPABASE_KEY` como fallback.
- `VITE_SUPABASE_KEY` aparece apenas em documentacao historica da Mudanca 17 e
  em teste que confirma a rejeicao do nome legado.
- Workflows GitHub usam `secrets['VITE_SUPABASE_ANON_KEY']`.
- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` e segredos equivalentes
  aparecem em Edge Functions, documentacao ou scripts backend, nao como
  variaveis `VITE_*`.
- `git ls-files` encontrou apenas `.env.example` como arquivo de ambiente
  versionado.
- Existe `.env.local` local no workspace, mas esta fora do controle de versao e
  nao teve conteudo lido.

Resultado:

- Nao foi encontrado segredo real versionado durante esta checagem por nome de
  arquivo ou referencia textual.
- Nao foi encontrado uso frontend ativo de `VITE_SUPABASE_KEY` como fallback.
- Nao foi encontrado `service_role` exposto como variavel `VITE_*`.

## Scripts disponiveis avaliados

Scripts relevantes em `package.json`:

- `format`
- `build`
- `check`
- `test`
- `test:e2e`
- `test:e2e:ci`
- `size`
- `lint`
- `format:check`

Decisao:

- `npm run test` foi coberto por `npm run check`.
- `npm run test:e2e -- --reporter=list` foi executado por ser smoke headless
  ja configurado.
- `npm run size` nao foi executado nesta checagem porque Mudanca 16 ja registrou
  esse script como pendencia de ambiente/backlog e este CP nao deve mexer em
  bundle/package.

## Comandos executados

| Comando                                                | Resultado                                  |
| ------------------------------------------------------ | ------------------------------------------ |
| `git branch --show-current`                            | `main`                                     |
| `git rev-parse HEAD`                                   | `1b61ce6b5b6c19a77ad5ece3a1d89a787f0566d1` |
| `git fetch origin main --prune`                        | passou                                     |
| `git status -sb`                                       | `## main...origin/main`                    |
| `git rev-list --left-right --count HEAD...origin/main` | `0 0`                                      |
| `git diff --check`                                     | passou                                     |
| `npm run format`                                       | passou                                     |
| `npm run build`                                        | passou, com warnings Vite conhecidos       |
| `npm run check`                                        | passou                                     |
| bateria focada Vitest pos-seguranca                    | passou: 20 arquivos / 178 testes           |
| `npm run test:e2e -- --reporter=list`                  | passou: 15 passed / 9 skipped              |

## Resultado do `npm run check`

`npm run check` executou:

- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run build`

Resultado:

- Exit code 0.
- Lint: 0 erros, 1 warning conhecido.
- Format check: passou.
- Testes Vitest gerais: passaram.
- Build: passou, com warnings Vite conhecidos.

## Testes focados pos-seguranca

Comando executado:

```bash
npm run test -- src/__tests__/supabaseConfig.test.js src/__tests__/auth.integration.test.js src/__tests__/userData.test.js src/__tests__/clientesAccess.test.js src/__tests__/monetization.test.js src/__tests__/usageLimits.test.js src/__tests__/stripeWebhookEntitlement.test.js src/__tests__/stripeWebhookStuckClaim.test.js src/__tests__/signatureStorage.test.js src/__tests__/signatureResolver.test.js src/__tests__/signatureFlush.test.js src/features/registro/__tests__/save/signature.test.js src/__tests__/photoStorage.test.js src/__tests__/storageCacheOffline.contract.test.js src/__tests__/observability.test.js src/__tests__/pmocPdfLinks.security.test.js src/__tests__/contaView.test.js src/__tests__/deleteUserAccountLifecycle.test.js src/__tests__/telemetrySink.test.js src/__tests__/shareReport.test.js --reporter=dot
```

Resultado:

- 20 arquivos passaram.
- 178 testes passaram.

Areas cobertas:

- Supabase config/env.
- Auth/logout.
- `userData`.
- Clientes/plano/cache.
- Billing/monetization/usage.
- Stripe webhook entitlement e idempotencia/stuck recovery.
- Assinatura digital.
- `photoStorage` e storage/cache/offline.
- Observability/tokens.
- PDF safe links/PMOC.
- Account deletion lifecycle.
- Telemetry/analytics client-side.
- Share report.

Observacoes:

- Os stderrs de testes focados exercitam caminhos esperados de erro/mock:
  IndexedDB indisponivel, JSDOM navigation/reload, Sentry SDK ausente,
  falhas simuladas de auth/storage e warnings GoTrue em ambiente de teste.
- Esses stderrs nao causaram falha; a bateria terminou com exit code 0.

## E2E

Comando executado:

```bash
npm run test:e2e -- --reporter=list
```

Resultado:

- 24 testes coletados.
- 15 passed.
- 9 skipped.
- Exit code 0.

Observacao:

- O padrao de skips permanece consistente com a suite de smoke ja documentada
  na Mudanca 16.

## Supabase SQL/RLS

Verificacao de ambiente:

- Supabase CLI disponivel: `2.90.0`.
- Docker nao disponivel no PATH (`docker` nao reconhecido).

Decisao:

- `supabase test db` nao foi executado nesta maquina porque a CLI local depende
  de Docker/Supabase local para subir ou acessar o ambiente de teste.
- Isso nao foi tratado como falha bloqueadora do app.
- Os testes oficiais SQL/RLS permanecem versionados e devem rodar em CI ou em
  ambiente local com Docker/Supabase disponivel.

## Warnings conhecidos

Warnings confirmados como ja documentados:

- Warning ESLint conhecido em `src/domain/pdf/shareReport.js`:
  `no-restricted-imports` por import de UI em dominio.
- Warnings Vite static+dynamic import.
- Warnings de chunk size acima de 500 kB, incluindo `vendor-pdf`, `index.js` e
  CSS global.

Warnings novos:

- Nenhum warning novo critico foi identificado nesta checagem.

## Smoke check estatico por area critica

| Area                       | Evidencia                                                                 |
| -------------------------- | ------------------------------------------------------------------------- |
| App bootstrap              | `npm run build`, `npm run check`, E2E smoke                               |
| Auth/logout                | `auth.integration.test.js`, bateria focada                                |
| Supabase config            | `supabaseConfig.test.js`, env mapping                                     |
| Billing/plano/usage        | `clientesAccess`, `monetization`, `usageLimits`                           |
| Stripe webhook             | `stripeWebhookEntitlement`, `stripeWebhookStuckClaim`                     |
| Assinatura digital         | `signatureStorage`, `signatureResolver`, `signatureFlush`, save signature |
| Local storage/logout/cache | `storageCacheOffline.contract`, `auth.integration`, `userData`            |
| Feedback/analytics/storage | `telemetrySink`, `photoStorage`, validacoes CP-G documentadas             |
| Observability/tokens       | `observability.test.js`                                                   |
| PDF safe links/share       | `pmocPdfLinks.security`, `shareReport`                                    |
| Account deletion           | `deleteUserAccountLifecycle.test.js`                                      |

## Riscos remanescentes ja aceitos

Sem correcao neste CP:

- Warnings Vite static+dynamic/chunk size continuam backlog tecnico controlado.
- Warning ESLint conhecido em `src/domain/pdf/shareReport.js` continua para CP
  futuro dedicado.
- SQL/RLS oficial depende de Docker/Supabase local ou CI.
- RLS/check constraints nao fazem rate limit real por IP/sessao.
- PDF/WhatsApp limits ainda usam `localStorage`.
- URL do browser no recovery nao foi limpa; mitigacao atual fica em
  observability/logs.
- Account deletion nao tem atomicidade distribuida entre Storage, SQL e Auth.
- `registros.assinatura` mantem contrato legado ambiguo.
- Ambientes de deploy/GitHub Secrets precisam manter
  `VITE_SUPABASE_ANON_KEY`.

## Conclusao

Resultado geral: passou.

Nao houve falha critica nova, warning novo critico ou alteracao fora de escopo.
O app esta apto para iniciar a Mudanca 18 / CP-A - Planejamento das mudancas de
fluxo.

Condicoes para a proxima fase:

- Comecar com CP-A read-only/planejamento.
- Nao iniciar design/redesign.
- Nao iniciar correcao de warnings Vite ou PDF/share junto com fluxo.
- Manter riscos remanescentes como backlog controlado ate CP dedicado.
