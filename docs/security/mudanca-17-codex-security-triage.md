# Mudanca 17 / CP-A - Codex Security triage

## 1. Resumo executivo

Este CP fez triagem documental dos achados do Codex Security exportados em
`C:\Users\KABUM\Downloads\codex-security-findings-2026-05-09T18-18-24.211Z.csv`.

Foram identificados 75 achados:

| Severidade    | Quantidade |
| ------------- | ---------: |
| high          |          4 |
| medium        |         21 |
| low           |          6 |
| informational |         44 |

Os quatro achados `high` parecem relevantes para a arquitetura atual e devem ser
tratados em CPs separados. Nenhum codigo foi alterado neste CP porque as
correcoes envolvem seguranca, billing, RLS, Storage ou fluxo Stripe, areas que
exigem plano especifico e validacao dedicada.

Status apos CP-B:

- CP-B executado para proteger billing profile e quotas.
- `profiles` ja tinha trigger de protecao para UPDATE de campos monetarios; o
  CP-B completou a protecao de INSERT bloqueando `stripe_customer_id` e
  `stripe_subscription_id` semeados por usuario comum.
- `usage_monthly` deixou de aceitar insert/update direto por usuario
  autenticado; o caminho esperado para incremento de quota e
  `public.increment_monthly_usage()` ou service role.
- Apos falha no teste manual pelo Supabase SQL Editor, o CP-B foi reforcado
  para declarar `ENABLE ROW LEVEL SECURITY`, revogar `INSERT`, `UPDATE` e
  `DELETE` de `anon`/`authenticated`, manter apenas SELECT proprio via RLS e
  preservar grants de escrita para `service_role`.
- Validacao SQL/RLS foi adicionada em `supabase/tests`, mas a execucao local de
  pgTAP depende de Docker/Supabase local.

Status apos CP-H:

- CP-C corrigiu entitlement Stripe: `checkout.session.completed` nao promove
  plano pago ativo sozinho; `invoice.paid` passou a ser o caminho seguro de
  promocao.
- CP-D endureceu o contrato de env Supabase no frontend: `VITE_SUPABASE_KEY`
  ambiguo foi removido do caminho principal e `VITE_SUPABASE_ANON_KEY` rejeita
  JWT com `role: "service_role"`.
- CP-E aplicou gate server-side para assinatura digital em duas camadas:
  trigger em `public.registros.assinatura` e policies RESTRICTIVE no Storage
  para `registro-fotos/{user_id}/registros/{registro_id}/assinatura.png`.
- Fotos normais de registros continuam fora do gate de assinatura; registro sem
  assinatura continua permitido para Free.
- CP-F endureceu dados locais no navegador: logout limpa `sessionStorage`
  sensivel e fila IndexedDB de blobs; cache de plano passou a ser escopado por
  `user_id`; `last-client` com PII passou a usar `userStorage`; fotos pendentes
  agora carregam owner e nao sao drenadas por outro usuario autenticado.
- Troca de usuario autenticado em runtime agora força reload quando a aplicacao
  ja esta inicializada para evitar exposicao temporaria de estado em memoria do
  usuario anterior.
- CP-G endureceu superficies publicas anti-abuso: `analytics_events` e
  `feedback` continuam aceitando INSERT legitimo de anon/authenticated, mas nao
  aceitam `user_id` forjado; `analytics_events.payload` passou a exigir JSON
  object; `feedback.user_email` ganhou formato/tamanho server-side; o bucket
  `registro-fotos` passou a ter limite versionado de 10 MB, privado, e policies
  canonicas de ownership por path.
- Risco remanescente do CP-G: RLS/check constraints nao implementam rate limit
  real por IP/sessao. Se houver abuso volumetrico, o controle deve ir para
  edge/WAF ou endpoint backend especifico.
- CP-H endureceu XSS, tokens e links PDF: a pagina `/conta` passou a escapar
  nome, cargo e email antes de interpolar HTML; o modal de conta foi analisado
  e ja usava `textContent` para dados de perfil, portanto o achado especifico
  do modal foi tratado como falso positivo para aquele componente.
- Observability/Sentry passou a redigir `access_token`, `refresh_token`,
  `token_hash`, `code` e tokens de provider em URLs, contexts e breadcrumbs
  antes de enviar eventos.
- Links de `urlChamados` no PDF PMOC agora so viram area clicavel quando a URL
  absoluta usa `http:` ou `https:`. Protocolos perigosos e URLs invalidas
  continuam visiveis como texto, sem `doc.link`.
- O upsell de PDF Free deixou de promover o dominio placeholder
  `cooltrack.app` e passou a exibir apenas o nome do produto.

## 2. Base analisada

| Item                 | Valor                                      |
| -------------------- | ------------------------------------------ |
| Branch               | `main`                                     |
| HEAD inicial         | `5d07464beb9686cdcea6459752ed1a57c6263cd4` |
| Working tree inicial | limpo                                      |
| Tipo de CP           | documental / read-only                     |
| Guardrails aplicados | `AGENTS.md`                                |

## 3. Origem dos achados

Arquivo CSV externo ao repositorio:

`C:\Users\KABUM\Downloads\codex-security-findings-2026-05-09T18-18-24.211Z.csv`

Repositorio indicado no CSV:

`Willianlsz1/Cool_Track_Pro`

Campos relevantes usados:

- `title`
- `description`
- `severity`
- `detected_at`
- `commit_hash`
- `relevant_paths`

## 4. Tabela de achados por severidade

### High

| Achado                                                 | Classificacao inicial          | Arquivos relevantes                                                                                                          |
| ------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Client-only signature paywall permits free Storage use | provavel real; tratado no CP-E | `src/core/signatureStorage.js`, `src/ui/views/registro.js`, `supabase/migrations/20260420130000_enforce_photo_plan_gate.sql` |
| Users can self-modify billing profile fields           | provavel real                  | `supabase/migrations/20260411000001_security_subscription_usage.sql`, `supabase/functions/stripe-webhook/index.ts`           |
| Stripe webhook grants Pro before payment is confirmed  | provavel real; tratado no CP-C | `supabase/functions/stripe-webhook/index.ts`, `supabase/functions/create-checkout-session/index.ts`                          |
| Frontend build can expose privileged Supabase key      | provavel real; tratado no CP-D | `src/core/supabase.js`, `src/core/supabaseConfig.js`, `.github/workflows/ci.yml`, `.github/workflows/e2e.yml`                |

### Medium

| Tema                                       | Achados                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Billing, quotas e paywall client-side      | Client-only Pro gate for PMOC checklist is bypassable; Empresa paywall trusts mutable local plan cache; Client-only Pro gate for Clientes can be bypassed; PMOC Pro access is enforced only in client-side UI; Client-writable billing state bypasses paid quotas; PDF/WhatsApp limits enforced only with localStorage |
| Dados locais, cache e troca de usuario     | Pending photos persist in a global IndexedDB queue; In-app reauth can expose prior user's cached state; Legacy guest data migrates into the next logged-in account; Guest cache can be migrated into authenticated cloud data; Unscoped last-client cache leaks PII between users                                      |
| Supabase publico, Storage e abuso de quota | Anonymous analytics inserts can be forged and spammed; Unauthenticated feedback inserts enable storage and email abuse; Unbounded client-driven photo uploads to Supabase Storage                                                                                                                                      |
| Stripe/webhook                             | Stuck webhook reclaim can double-process Stripe events                                                                                                                                                                                                                                                                 |
| PDF/share                                  | Free PDFs promote a placeholder domain; Unvalidated PMOC PDF link URL injection                                                                                                                                                                                                                                        |
| XSS / tokens / observabilidade             | Sentry CSP enablement can leak recovery tokens; Stored profile name XSS in account modal                                                                                                                                                                                                                               |
| Build/env                                  | Dynamic Vite env lookup can expose extra env values                                                                                                                                                                                                                                                                    |
| Account lifecycle                          | Account deletion can stop after partial data removal                                                                                                                                                                                                                                                                   |

### Low

| Achado                                               | Classificacao inicial               |
| ---------------------------------------------------- | ----------------------------------- |
| Hidden Pro dashboard data rendered for non-Pro users | precisa de investigacao             |
| PDF signature timestamp uses editable service date   | precisa de investigacao             |
| Per-user tutorial keys survive sign-out              | provavel real, baixo impacto        |
| PR CI exposes Supabase secrets to PR code            | precisa de investigacao de workflow |
| Push notification clicks allow arbitrary navigation  | precisa de investigacao             |
| Stale quote prefill can open modal after navigation  | fora de escopo imediato             |

### Informational

| Achado                                                        |
| ------------------------------------------------------------- |
| Annual checkout can silently use monthly Stripe price         |
| Async post-save share flow is not awaited                     |
| Client sync drops customer detail fields                      |
| Cloud sync drops saved nameplate fields                       |
| Collapsed details save unintended default metadata            |
| Dashboard template changes are overwritten by React islands   |
| Datetime buttons can bind to a stale React-replaced input     |
| Deferred form initialization can preserve stale edit mode     |
| Desktop premium modal override is shadowed                    |
| Document scroll switch leaves router resetting wrong element  |
| Editing records can overwrite saved customer details          |
| End-date filter includes records with missing dates           |
| Equipment edit focus map drops live fields                    |
| Free record limit removed only on client                      |
| Hidden next-preventive field causes edit data loss            |
| High-risk equipment can be downgraded to OK/Monitorar         |
| High-risk equipment priority signals are ignored              |
| History view restores stale scroll after navigation           |
| Legacy mojibake cold-room type no longer normalizes           |
| Maintenance PDF card height is undercounted                   |
| Malformed CSS comment disables registro theme tokens          |
| Next PMOC maintenance date can be shifted twice               |
| No security issue; Free nav FAB alignment regression          |
| Overdue preventive filter only matches today's due items      |
| Password recovery backdrop click hangs app startup            |
| Password recovery modal can hang app bootstrap                |
| Password recovery modal can hang bootstrap                    |
| Password recovery modal can stall app bootstrap               |
| Pending photo cover button cannot set actual cover            |
| Photo refactor introduces mojibake in user messages           |
| Premium modal CSS overrides desktop centering                 |
| Preventive alert counter ignores normal records               |
| Priority refactor drops high-risk escalation                  |
| React onboarding card is removed outside React                |
| Registro priority is not persisted across reloads or sync     |
| Risk signals no longer escalate equipment priority            |
| Route scroll reset broken after viewport scroll change        |
| Save/client fork race can duplicate or hang registro saves    |
| Skeleton overlay leaves stale UI clickable during render      |
| Stale-bundle recovery can reload on transient import failures |
| Static Sentry import breaks optional installs                 |
| Sync race can resurrect deleted cloud records                 |
| Top-level plan cache read can crash app boot                  |
| WhatsApp share can burn quota if popup is blocked             |

## 5. Analise detalhada dos achados high

### H1 - Client-only signature paywall permits free Storage use

Classificacao: provavel real.

Evidencia no codigo:

- `src/ui/views/registro.js:1790` documenta assinatura digital como recurso
  Plus+.
- `src/ui/views/registro.js:1794` usa
  `PlanCache.isCachedPlanPlusOrHigher()` como gate.
- `src/core/signatureStorage.js:52` exporta `uploadSignatureDataUrl()`.
- `src/core/signatureStorage.js:80` faz upload direto no bucket
  `registro-fotos`.
- `supabase/migrations/20260420130000_enforce_photo_plan_gate.sql:141`
  documenta `registros` como path sem gate de plano.

Risco:

Um usuario autenticado Free pode contornar o UI, escrever no path proprio de
Storage e persistir referencia em `registros.assinatura`, consumindo Storage e
usando feature paga sem autorizacao server-side.

Correcao segura sugerida:

- Criar CP dedicado para assinatura digital.
- Definir se assinatura deve ser Plus+ no banco ou se deve voltar a ser apenas
  feature client-side sem garantia de billing.
- Se for Plus+, aplicar gate server-side no Storage e/ou na escrita de
  `registros.assinatura`.
- Adicionar testes SQL/RLS para usuario Free, Plus e Pro.

Risco da correcao:

Alto. Mexe em Storage, RLS, contratos de `registros.assinatura` e fluxo offline.
Pode quebrar uploads legitimos de fotos/assinaturas se o path policy for amplo
demais.

Validacoes necessarias:

- `npm run format`
- `npm run build`
- `npm run check`
- Testes SQL/RLS de Storage para `registros/*/assinatura.png`.
- Teste focado do fluxo de salvar registro com assinatura em Plus/Pro.
- Teste de regressao para fotos de registro sem assinatura.

### H2 - Users can self-modify billing profile fields

Classificacao: tratado parcialmente antes do CP-B; CP-B concluiu o hardening
local de `profiles` e `usage_monthly`.

Evidencia no codigo:

- `supabase/migrations/20260411000001_security_subscription_usage.sql:8`
  cria `profiles.plan_code`.
- `supabase/migrations/20260411000001_security_subscription_usage.sql:39`
  permite insert proprio.
- `supabase/migrations/20260411000001_security_subscription_usage.sql:51`
  permite update proprio sem restringir colunas.
- `supabase/functions/stripe-webhook/index.ts:451` atualiza billing profile via
  service role no webhook.

Risco:

O mesmo registro `profiles` mistura campos editaveis pelo usuario com campos de
billing. Como RLS nao e column-level, usuario autenticado pode tentar elevar
`plan_code`, `plan`, `subscription_status` ou metadados Stripe por API direta,
burlando feature gates e quotas.

Correcao segura sugerida:

- Criar CP dedicado para hardening de `profiles`.
- Separar conceitualmente campos editaveis de usuario e campos de billing.
- Adicionar trigger `BEFORE INSERT OR UPDATE` para bloquear alteracao de campos
  monetarios quando `auth.role() <> 'service_role'`, ou migrar billing para
  tabela protegida controlada por service role.
- Revisar compatibilidade com onboarding/profile name.

Mitigacao aplicada no CP-B:

- Criada migration
  `supabase/migrations/20260509190000_harden_billing_profile_usage.sql`.
- `public.protect_profile_insert()` passou a bloquear INSERT autenticado com
  `stripe_customer_id` ou `stripe_subscription_id`.
- As policies `usage_monthly_insert_own`, `usage_monthly_update_own` e eventual
  `usage_monthly_delete_own` sao removidas.
- A migration tambem remove defensivamente qualquer policy nao-SELECT de
  `usage_monthly`, cobrindo ambientes com policies criadas fora das migrations
  versionadas ou com nomes diferentes.
- Alem de RLS, a migration revoga `INSERT`, `UPDATE` e `DELETE` de
  `usage_monthly` para `anon` e `authenticated`, mantendo `SELECT` e permissao
  de execucao da RPC segura `public.increment_monthly_usage()`.
- Correcao apos teste manual: a migration agora tambem reexecuta
  `alter table public.usage_monthly enable row level security`, concede escrita
  direta somente a `service_role` e o teste SQL cobre bloqueio explicito de
  `INSERT`, `UPDATE` e `DELETE` diretos por `authenticated`.
- `usage_monthly_select_own` permanece para leitura propria.
- `public.increment_monthly_usage()` permanece como caminho de escrita por RPC
  `SECURITY DEFINER`, preservando validacao `auth.uid() = p_user_id`.
- Adicionado teste SQL
  `supabase/tests/09_billing_profile_usage_hardening.test.sql`.

Risco da correcao:

Alto. Pode quebrar onboarding, leitura de perfil, webhook Stripe e caches de
plano se alterar nomes/contratos sem migracao controlada.

Risco remanescente apos CP-B:

- O estado de entitlement Stripe promovido cedo demais em
  `checkout.session.completed` foi tratado no CP-C.
- O modelo ainda mistura campos comuns e monetarios em `profiles`; o CP-B
  protege a escrita direta sem reestruturar a tabela.
- Validacao pgTAP local nao foi executada nesta maquina por ausencia de Docker
  local.

Validacoes necessarias:

- Testes SQL/RLS para usuario normal tentando alterar `plan_code`,
  `subscription_status`, `stripe_customer_id` e `stripe_subscription_id`.
- Teste do webhook atualizando os mesmos campos com service role.
- `npm run format`, `npm run build`, `npm run check`.

### H3 - Stripe webhook grants Pro before payment is confirmed

Classificacao: provavel real; tratado no CP-C.

Evidencia antes do CP-C:

- `supabase/functions/create-checkout-session/index.ts` cria Checkout em modo
  `subscription` e grava metadata de usuario/plano.
- `supabase/functions/stripe-webhook/index.ts` processava
  `checkout.session.completed` e gravava `plan_code`, `plan` e
  `subscription_status: 'active'`.
- `invoice.paid` existia, mas apenas reafirmava `subscription_status: 'active'`
  por `stripe_subscription_id`.

Risco antes:

Para metodos de pagamento assincronos ou falhos, `checkout.session.completed`
pode ocorrer antes de pagamento confirmado. O app podia liberar plano pago antes
do primeiro pagamento efetivo.

Mitigacao aplicada no CP-C:

- `checkout.session.completed` passou a vincular `stripe_customer_id` e
  `stripe_subscription_id` em estado `pending`, sem gravar `plan` ou `plan_code`.
- `checkout.session.completed` nao rebaixa um perfil que ja esteja `active`,
  evitando sobrescrita por evento atrasado.
- `invoice.paid` passou a buscar a subscription, resolver o usuario por metadata
  ou por `stripe_subscription_id`, validar metadata/price_id conhecido e so entao
  promover `plan`, `plan_code` e `subscription_status: 'active'`.
- Price desconhecido ou metadata insuficiente falha fechado e nao promove
  entitlement pago.
- `invoice.payment_failed` marca `past_due` e tambem tenta resolver usuario pela
  metadata da subscription quando possivel.
- `customer.subscription.updated` continua usando refetch da subscription live;
  `active` pode refletir entitlement confirmado com plano conhecido e `trialing`
  passou a ficar `pending`.
- Idempotencia existente em `stripe_webhook_events` foi preservada.

Risco remanescente:

- Nao foi criado teste de integracao Deno com assinatura real do Stripe; a regra
  de entitlement foi coberta por testes unitarios focados e a validacao de
  idempotencia permanece em testes SQL existentes.
- `customer.subscription.updated` com status live `active` ainda e aceito como
  sinal Stripe valido para refletir plano conhecido; o caminho primario de
  promocao apos pagamento agora e `invoice.paid`.

Validacoes do CP-C:

- Teste focado `src/__tests__/stripeWebhookEntitlement.test.js`.
- Testes focados existentes de monetizacao/plans/webhook.
- `npm run format`, `npm run build`, `npm run check`.

### H4 - Frontend build can expose privileged Supabase key

Classificacao: provavel real; tratado no CP-D.

Evidencia no codigo:

- Antes do CP-D, `src/core/supabase.js` usava acesso dinamico
  `import.meta.env[name]` e lia `VITE_SUPABASE_KEY` no bundle frontend.
- Antes do CP-D, `.github/workflows/ci.yml` e `.github/workflows/e2e.yml`
  injetavam `VITE_SUPABASE_KEY` a partir de GitHub Secrets.
- O nome antigo era ambiguo para uma variavel `VITE_*`, que sempre entra no
  bundle publico.

Risco:

Toda variavel `VITE_*` vai para bundle publico. Se o secret armazenado em
`VITE_SUPABASE_KEY` for service-role ou outro JWT privilegiado, visitantes podem
extrair a chave do JS publicado e burlar RLS.

Mitigacao aplicada no CP-D:

- Contrato frontend migrado para `VITE_SUPABASE_ANON_KEY`.
- Acesso dinamico removido do cliente Supabase; o codigo usa referencias
  estaticas a `import.meta.env.VITE_SUPABASE_URL` e
  `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- `src/core/supabaseConfig.js` rejeita JWT cujo payload tenha
  `role: "service_role"` antes de inicializar chamadas frontend.
- Workflows, `.env.example`, README, CONTRIBUTING e checklist de pre-deploy
  foram atualizados para o novo nome.
- `VITE_SUPABASE_KEY` nao e mais fallback aceito pelo frontend.

Risco da correcao:

Baixo/medio. CI/deploy e ambientes hospedados precisam migrar o secret antigo
`VITE_SUPABASE_KEY` para `VITE_SUPABASE_ANON_KEY`. Sem essa migracao, o app
falha fechado por configuracao ausente.

Validacoes do CP-D:

- Teste focado `src/__tests__/supabaseConfig.test.js` para anon/mock key,
  ausencia de fallback antigo e rejeicao de `service_role`.
- Testes focados existentes de Supabase/env/bootstrap/billing/nameplate.
- Busca no codigo por `VITE_SUPABASE_KEY` fora da documentacao historica do
  proprio CP-D.
- Revisao manual de GitHub Secrets pelo mantenedor.
- `npm run format`, `npm run build`, `npm run check`.

## 6. Agrupamento dos achados medium

### Medium que envolvem feature paga, RLS, Storage, permissoes ou dados sensiveis

Prioridade alta dentro dos `medium`:

- Client-only Pro gate for Clientes can be bypassed.
- Empresa paywall trusts mutable local plan cache.
- Client-only Pro gate for PMOC checklist is bypassable.
- PMOC Pro access is enforced only in client-side UI.
- Client-writable billing state bypasses paid quotas.
- PDF/WhatsApp limits enforced only with localStorage.
- Pending photos persist in a global IndexedDB queue.
- In-app reauth can expose prior user's cached state.
- Legacy guest data migrates into the next logged-in account.
- Guest cache can be migrated into authenticated cloud data.
- Unscoped last-client cache leaks PII between users.
- Anonymous analytics inserts can be forged and spammed.
- Unauthenticated feedback inserts enable storage and email abuse.
- Unbounded client-driven photo uploads to Supabase Storage.
- Sentry CSP enablement can leak recovery tokens.
- Stored profile name XSS in account modal.
- Stuck webhook reclaim can double-process Stripe events.

### Medium que devem ficar para CP proprio por area sensivel

- PDF/share: Free PDFs promote a placeholder domain; Unvalidated PMOC PDF link
  URL injection; PDF/WhatsApp limits enforced only with localStorage.
- Stripe: Stuck webhook reclaim can double-process Stripe events.
- Storage: Pending photos persist in a global IndexedDB queue; Unbounded
  client-driven photo uploads to Supabase Storage.
- Auth/cache: In-app reauth can expose prior user's cached state; Legacy guest
  data migrates into the next logged-in account; Guest cache can be migrated into
  authenticated cloud data.
- Observabilidade/tokens: Sentry CSP enablement can leak recovery tokens.

## 7. Possiveis falsos positivos

Nenhum high deve ser descartado sem investigacao adicional.

Possiveis falsos positivos ou achados dependentes de configuracao:

- Frontend build can expose privileged Supabase key: risco real se o secret for
  service-role; se for anon key correta, o problema vira hardening preventivo.
- Free PDFs promote a placeholder domain: depende de quem controla
  `cooltrack.app`.
- PR CI exposes Supabase secrets to PR code: depende de gatilhos do workflow para
  forks/PRs e configuracao do GitHub.
- PMOC Pro access is enforced only in client-side UI: pode ser aceito como
  limite de produto se PMOC PDF nao consumir recurso backend sensivel, mas ainda
  e bypass de feature paga.
- PDF/WhatsApp limits enforced only with localStorage: nao e isolamento de
  tenant, mas e bypass de quota comercial.

## 8. Riscos reais confirmados

Confirmados por leitura de codigo neste CP:

- Billing profile e `usage_monthly` possuem politicas RLS que permitem escrita
  pelo proprio usuario sem protecao suficiente de campos monetarios.
- Assinatura digital usa gate client-side e path de Storage em `registros`, que
  a migration atual documenta como sem gate de plano.
- Webhook Stripe promove plano em `checkout.session.completed` antes de exigir
  confirmacao inequivoca de pagamento.
- Antes do CP-D, frontend consumia `VITE_SUPABASE_KEY` no bundle publico; isso e
  esperado para anon key, mas perigoso se o secret operacional estivesse
  incorreto. O contrato agora e `VITE_SUPABASE_ANON_KEY` e rejeita
  `service_role`.

## 9. Plano recomendado de CPs

### CP-B - Proteger billing profile e quotas

Status: executado.

Escopo:

- Proteger campos monetarios de `profiles`.
- Proteger `usage_monthly` contra insert/update direto do usuario.
- Preservar leitura necessaria do app e escrita service-role do webhook.

Arquivos provaveis:

- `supabase/migrations/*`
- `supabase/tests/*`
- `src/core/plans/*`
- `src/core/subscriptionPlans.js` ou caminho atual equivalente, se existir.

Validacoes:

- Testes SQL/RLS para Free/Pro/service-role.
- `npm run format`
- `npm run build`
- `npm run check`

Resultado:

- Migration adicionada para completar o hardening.
- Teste SQL/RLS adicionado.
- Escrita direta em `usage_monthly` removida por policies e privilegios de
  tabela para clientes.
- Proximo CP recomendado passa a ser CP-C.

### CP-C - Corrigir entitlement Stripe apos pagamento confirmado

Status: executado neste CP.

Escopo:

- Webhook ajustado para nao liberar plano pago em
  `checkout.session.completed`.
- Promocao paga movida para `invoice.paid` com subscription refetch, usuario
  resolvido e plano validado por metadata/price_id conhecido.
- `invoice.payment_failed`, `customer.subscription.updated` e
  `customer.subscription.deleted` revisados para manter estado seguro.
- Idempotencia existente preservada.

Arquivos alterados:

- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/stripe-webhook/entitlement.ts`
- `src/__tests__/stripeWebhookEntitlement.test.js`
- `supabase/functions/STRIPE_SETUP.md`
- `docs/security/mudanca-17-codex-security-triage.md`

Validacoes:

- Testes focados do webhook.
- `npm run format`
- `npm run build`
- `npm run check`

Resultado:

- `checkout.session.completed` sozinho nao libera plano pago ativo.
- `invoice.paid` e o caminho principal de promocao segura.
- Price_id desconhecido falha fechado.
- Eventos duplicados continuam protegidos pela camada de idempotencia existente.
- Proximo CP recomendado passa a ser CP-D.

### CP-D - Hardening da chave Supabase no frontend

Escopo:

- Executado: contrato migrado de `VITE_SUPABASE_KEY` para
  `VITE_SUPABASE_ANON_KEY`.
- Executado: acesso dinamico a `import.meta.env` removido da inicializacao
  Supabase frontend.
- Executado: validacao defensiva contra JWT `service_role` no cliente.
- Executado: workflows, `.env.example`, README, CONTRIBUTING e checklist de
  pre-deploy atualizados, sem tocar em secrets reais.

Arquivos alterados:

- `src/core/supabase.js`
- `src/core/supabaseConfig.js`
- `src/features/userData.js`
- `src/core/plans/monetization.js`
- `src/domain/nameplateAnalysis.js`
- `src/__tests__/supabaseConfig.test.js`
- `src/__tests__/userData.test.js`
- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `e2e/playwright.config.js`
- `vite.config.js`
- `.env.example`
- `README.md`
- `CONTRIBUTING.md`
- `docs/audits/pre-deploy.md`
- `docs/security/mudanca-17-codex-security-triage.md`

Validacoes:

- Teste defensivo com anon/mock key e chave service-role simulada.
- Testes focados de Supabase/env/bootstrap/billing/nameplate.
- `npm run format`
- `npm run build`
- `npm run check`

Resultado:

- `checkout`/portal/nameplate/export/delete continuam usando a anon key
  explicita no header `apikey`.
- JWT com `role: "service_role"` em `VITE_SUPABASE_ANON_KEY` e rejeitado antes
  da inicializacao do cliente.
- `VITE_SUPABASE_KEY` antigo nao e mais fallback aceito.
- Proximo CP recomendado passa a ser CP-E.

### CP-E - Gate server-side para assinatura digital

Status: executado no CP-E.

Achado tratado:

- `Client-only signature paywall permits free Storage use`.

Risco antes:

- A assinatura digital era habilitada no frontend por
  `PlanCache.isCachedPlanPlusOrHigher()`.
- O upload usava Storage direto em `registro-fotos`, path
  `{user_id}/registros/{registro_id}/assinatura.png`.
- `public.registros` tinha policy de ownership por `user_id`; sem gate
  server-side especifico, usuario Free podia tentar persistir assinatura por API
  direta.

Regra server-side aplicada:

- Assinatura digital em registro exige Plus+ (`plan_code in ('plus', 'pro')`
  com `subscription_status in ('active', 'trialing')`) ou `is_dev`.
- `service_role` continua com bypass para operacoes backend confiaveis.
- Registro sem assinatura e update que nao altera assinatura continuam
  permitidos conforme RLS existente.
- Fotos normais em `registro-fotos/{user_id}/registros/{registro_id}/...`
  continuam fora do gate de assinatura.

Arquivos alterados:

- `supabase/migrations/20260509210000_enforce_signature_plan_gate.sql`
- `supabase/tests/10_signature_plan_gate.test.sql`
- `docs/security/mudanca-17-cp-e-manual-sql-editor.sql`
- `supabase/tests/README.md`
- `docs/security/mudanca-17-codex-security-triage.md`

Mitigacao aplicada:

- Criada funcao `public.registro_signature_payload_requires_plan(jsonb)` para
  detectar payload de assinatura boolean/json/text sem depender do frontend.
- Criada trigger `public.enforce_registro_signature_plan_gate()` em
  `public.registros` para bloquear INSERT/UPDATE de assinatura por usuario sem
  Plus+.
- Criados helpers de Storage para identificar path de assinatura e validar
  ownership + Plus+.
- Criadas policies `AS RESTRICTIVE` em `storage.objects` para INSERT/UPDATE no
  path de assinatura. Por serem restritivas, elas adicionam o gate mesmo quando
  existem policies permissivas de upload para fotos normais.

Validacoes planejadas/adicionadas:

- Teste oficial TAP/pg_prove
  `supabase/tests/10_signature_plan_gate.test.sql`.
- Script manual SQL Editor
  `docs/security/mudanca-17-cp-e-manual-sql-editor.sql`.
- O teste cobre Free bloqueado, Plus/Pro permitido, service_role preservado,
  registro Free sem assinatura permitido, foto normal de registro preservada e
  policies restritivas de Storage presentes.

Riscos remanescentes:

- `public.registros.assinatura` aparece nas migrations baseline como `boolean`,
  enquanto o frontend tambem aceita referencia de Storage em objeto/string
  legado. A trigger usa `to_jsonb(new.assinatura)` para cobrir o tipo real do
  banco sem alterar schema neste CP.
- A execucao local de `supabase test db` depende de Postgres/Supabase local em
  `127.0.0.1:54322`. Se o ambiente local nao estiver ativo, validar o script
  manual no SQL Editor apos aplicar a migration.

Resultado:

- Usuario Free nao deve conseguir persistir assinatura em
  `public.registros.assinatura`.
- Usuario Free nao deve conseguir escrever o objeto de assinatura no path
  padrao de Storage.
- Usuarios Plus/Pro e `service_role` continuam com caminho permitido.
- Proximo CP recomendado passa a ser CP-F.

Escopo original:

- Definir gate Plus+ para assinatura em Storage e/ou coluna
  `registros.assinatura`.
- Preservar fotos de registro e fluxo offline.
- Adicionar testes SQL/RLS para paths de assinatura.

Arquivos provaveis:

- `src/core/signatureStorage.js`
- `src/ui/views/registro.js`
- `supabase/migrations/*`
- `supabase/tests/*`

Validacoes:

- Testes SQL/RLS de Storage.
- Teste de salvar registro com assinatura em Plus/Pro.
- Teste de regressao para fotos de registros.
- `npm run format`
- `npm run build`
- `npm run check`

### CP-F - Dados locais, logout e troca de usuario

Status: executado no CP-F.

Achados tratados:

- `Pending photos persist in a global IndexedDB queue`.
- `In-app reauth can expose prior user's cached state`.
- `Unscoped last-client cache leaks PII between users`.
- Mitigacao parcial/guardada para `Legacy guest data migrates into the next
logged-in account` e `Guest cache can be migrated into authenticated cloud
data`: o cache principal ja possui owner guard em `cooltrack-cache-owner-v1` e
  o CP-F nao reintroduziu migracao automatica ampla de guest.

Risco antes:

- `cooltrack-photo-pending-upload` e IndexedDB `cooltrack-blob-queue` eram
  globais; fotos pendentes podiam ser drenadas para o usuario autenticado atual.
- `cooltrack-cached-plan` era global e podia influenciar gates client-side antes
  da nova hidratacao.
- `cooltrack-last-client` continha PII de cliente em chave global.
- Logout limpava parte do `localStorage`, mas nao limpava `sessionStorage`
  sensivel nem a fila de blobs.
- Troca de usuario com app ja inicializado podia manter estado em memoria ate o
  reload manual.

Arquivos alterados:

- `src/core/auth.js`
- `src/core/blobQueue.js`
- `src/core/photoStorage.js`
- `src/core/plans/planCache.js`
- `src/ui/views/registro.js`
- `src/app.js`
- `src/__tests__/auth.integration.test.js`
- `src/__tests__/photoStorage.test.js`
- `src/__tests__/storageCacheOffline.contract.test.js`
- `src/__tests__/clientesAccess.test.js`
- `src/__tests__/funnelTelemetry.test.js`
- `src/__tests__/shell.test.js`
- `docs/security/mudanca-17-codex-security-triage.md`

Mitigacao aplicada:

- `Auth.signOut()` agora limpa caches `cooltrack-*`/`cooltrack_*` de sessao
  exceto preferencia segura allowlisted e chama `clearBlobQueue()`.
- `blobQueue` ganhou limpeza central para IndexedDB e fallback em memoria.
- Fotos pendentes passaram a gravar `userId` e `queueKey` com owner; `flush`
  falha fechado para entradas sem owner ou de outro usuario.
- `planCache` grava/le por `userStorage` (`ct:<userId>:cooltrack-cached-plan`)
  e remove o legado global ao hidratar.
- `last-client` migra uma vez para `userStorage` e deixa de gravar PII em chave
  global.
- `app.js` detecta troca de usuario autenticado com app inicializado e força
  reload para limpar estado em memoria.

Validacoes:

- Testes focados:
  `npm run test -- src/__tests__/clientesAccess.test.js src/__tests__/funnelTelemetry.test.js src/__tests__/shell.test.js src/__tests__/storageCacheOffline.contract.test.js src/__tests__/photoStorage.test.js src/__tests__/auth.integration.test.js`.
- `npm run format`
- `npm run build`
- `npm run check`

Riscos remanescentes:

- Fila antiga de fotos pendentes sem `userId` nao e drenada por outro usuario;
  pode exigir suporte/manual cleanup se houver usuarios com pendencia legacy
  pre-CP-F.
- O cache principal `cooltrack_v3` continua existindo para modo offline, mas
  segue protegido por `cooltrack-cache-owner-v1`; um CP futuro pode revisar UX
  de migracao guest com consentimento explicito.
- Chaves globais de UI sem PII, como tema, modo de navegacao e prompts, foram
  preservadas quando fora do caminho sensivel deste CP.

Escopo:

- Limpar/escopar queues IndexedDB e caches com PII por usuario.
- Corrigir migracao de guest cache para conta autenticada.
- Validar reauth sem vazamento de estado anterior.

Arquivos provaveis:

- `src/core/blobQueue.js`
- `src/core/photoStorage.js`
- `src/core/auth.js`
- `src/core/storage.js`
- `src/app.js`
- `src/ui/components/authscreen.js`

Validacoes:

- Testes focados de logout/login com usuarios diferentes.
- Testes de migracao guest/auth.
- `npm run format`
- `npm run build`
- `npm run check`

### CP-G - Superficies publicas anti-abuso

Status: executado no CP-G.

Achados tratados:

- `Anonymous analytics inserts can be forged and spammed`.
- `Unauthenticated feedback inserts enable storage and email abuse`.
- `Unbounded client-driven photo uploads to Supabase Storage`.

Risco antes:

- `analytics_events_insert_any` usava `with check (true)`; anon/authenticated
  podiam inserir `user_id` arbitrario se conhecessem um UUID existente.
- `feedback_insert_any` tambem usava `with check (true)`; feedback publico
  podia forjar ownership e dependia apenas de limites parciais.
- `registro-fotos` nao tinha bucket/policies canonicas versionadas para
  ownership geral e limite de tamanho; parte do estado dependia de configuracao
  historica do projeto Supabase.

Regra nova:

- INSERT publico em `analytics_events` e `feedback` aceita `user_id = null` ou
  `user_id = auth.uid()`; anon nao consegue associar evento/feedback a outro
  usuario.
- `analytics_events.payload` precisa ser JSON object e continua limitado a 4
  KB pela constraint existente.
- `feedback.user_email` precisa respeitar tamanho maximo e formato basico de
  email quando informado.
- `registro-fotos` e privado, tem `file_size_limit <= 10 MB`, e writes passam
  pelo helper `public.can_write_registro_fotos_storage_object()`.
- Fotos normais de registros continuam permitidas para o dono; fotos de
  equipamentos continuam exigindo Plus+; assinatura digital continua usando o
  gate do CP-E.

Arquivos alterados:

- `supabase/migrations/20260509230000_harden_public_abuse_surfaces.sql`
- `supabase/tests/11_public_abuse_surfaces.test.sql`
- `docs/security/mudanca-17-cp-g-manual-sql-editor.sql`
- `supabase/tests/README.md`
- `docs/security/mudanca-17-codex-security-triage.md`

Validacoes:

- Teste oficial TAP/pg_prove
  `supabase/tests/11_public_abuse_surfaces.test.sql`.
- Script manual SQL Editor
  `docs/security/mudanca-17-cp-g-manual-sql-editor.sql`.
- Testes focados JS de telemetry/photo upload.
- `npm run format`
- `npm run build`
- `npm run check`

Riscos remanescentes:

- Nao ha rate limit real por IP/session em RLS. O CP-G limita payload,
  ownership e paths, mas abuso volumetrico ainda deve ser tratado por edge/WAF
  ou endpoint backend se necessario.
- `supabase test db` depende de Docker/Supabase local ativo.

### CP-H - XSS, tokens e links PDF

Status: executado no CP-H.

Achados tratados:

- `Stored profile name XSS in account modal`: o componente
  `accountModal.js` ja renderizava nome/email com `textContent`, mas a pagina
  `/conta` tinha interpolacao HTML equivalente em nome, cargo e email.
  O CP-H corrigiu essa superficie com escaping defensivo.
- `Sentry CSP enablement can leak recovery tokens`: contexts, breadcrumbs e
  URLs em eventos Sentry agora passam por redaction de tokens sensiveis.
- `Unvalidated PMOC PDF link URL injection`: `doc.link` no PMOC agora recebe
  apenas URLs `http:`/`https:` validas.
- `Free PDFs promote a placeholder domain`: o bloco de upsell Free nao exibe
  mais `cooltrack.app`.

Arquivos alterados:

- `src/ui/views/conta.js`
- `src/core/observability.js`
- `src/domain/pdf/safeLinks.js`
- `src/domain/pdf/pmoc/sections/cover.js`
- `src/domain/pdf/sections/upsell.js`
- `src/__tests__/contaView.test.js`
- `src/__tests__/observability.test.js`
- `src/__tests__/pmocPdfLinks.security.test.js`
- `docs/security/mudanca-17-codex-security-triage.md`

Validacoes:

- Testes focados de escaping/sanitizacao e URL allowlist:
  `src/__tests__/contaView.test.js`,
  `src/__tests__/observability.test.js` e
  `src/__tests__/pmocPdfLinks.security.test.js`.
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

Riscos remanescentes:

- CP-H nao reescreveu PDF/share nem alterou quotas comerciais de
  PDF/WhatsApp. O achado `PDF/WhatsApp limits enforced only with localStorage`
  permanece como risco de produto/billing para CP futuro especifico.
- A sanitizacao de observability reduz vazamento em eventos enviados pelo
  wrapper local; nao altera o fluxo de auth/recovery nem limpa a URL do browser,
  para evitar regressao no callback Supabase.

### CP-I - Lifecycle de exclusao de conta

Escopo:

- Garantir que falha de limpeza Storage nao deixe conta parcialmente deletada.
- Definir ordem transacional/compensatoria segura para delete-user-account.

Arquivos provaveis:

- `supabase/functions/delete-user-account/index.ts`

Validacoes:

- Testes com falha simulada de Storage list/remove.
- Teste de delete auth executado ou erro documentado sem estado parcial
  silencioso.
- `npm run format`
- `npm run build`
- `npm run check`

## 10. Validacoes recomendadas para cada CP

Base minima para todos os CPs com codigo:

```bash
npm run format
npm run build
npm run check
```

Validacoes adicionais por area:

- RLS/Storage: testes SQL ou pgTAP com usuarios Free, Plus, Pro e service-role.
- Stripe: testes focados de webhook com eventos assinados/simulados e ordem
  fora do comum.
- Auth/cache: testes de troca de usuario no mesmo browser e limpeza de
  localStorage/IndexedDB.
- PDF/share: testes unitarios de URL allowlist e regressao visual apenas se
  alterar renderizacao.
- XSS: testes que garantam uso de `textContent`/escaping e ausencia de
  interpolacao insegura.

## 11. O que NAO deve ser misturado na Mudanca 17

- React Doctor.
- Redesign.
- Warnings Vite static+dynamic que nao sejam diretamente o hardening de env do
  CP-D.
- CP dedicado de PDF/share alem do escopo de seguranca.
- `manualChunks`, `vendor-pdf` e otimizacao de bundle.
- Refatoracao ampla.
- Alteracao de `package.json` ou `package-lock.json` sem autorizacao explicita.
- Mudanca de schema/RLS/storage sem CP especifico, testes e plano de rollback.
- Remocao de codigo supostamente morto sem confirmar uso indireto.

## 12. Proximo CP recomendado

Proximo CP recomendado apos CP-H: CP-I - Lifecycle de exclusao de conta.

Justificativa:

- CP-B reduziu a manipulacao direta de billing/quota.
- CP-C corrigiu a promocao indevida de plano pago antes de pagamento
  confirmado.
- CP-D corrigiu o contrato ambiguo da chave Supabase no frontend e adicionou
  rejeicao defensiva de `service_role`.
- CP-E adicionou gate server-side para assinatura digital em banco e Storage.
- CP-F reduziu vazamento local entre usuarios no mesmo navegador, escopando
  caches e filas sensiveis.
- CP-G reduziu abuso direto em superficies publicas (`analytics`, `feedback` e
  upload de fotos) sem misturar PDF/share amplo, Vite warnings genericos,
  React Doctor, billing/Stripe, env Supabase, assinatura digital ou
  cache/logout.
- CP-H reduziu XSS em dados de perfil, vazamento de tokens para observability e
  injecao de URL em links PDF sem refatorar PDF/share amplo.
- O proximo grupo relevante e CP-I porque o ciclo de exclusao de conta ainda
  envolve risco de limpeza parcial de Storage/Auth se uma etapa falhar.
