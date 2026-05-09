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

| Achado                                                 | Classificacao inicial               | Arquivos relevantes                                                                                                          |
| ------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Client-only signature paywall permits free Storage use | provavel real                       | `src/core/signatureStorage.js`, `src/ui/views/registro.js`, `supabase/migrations/20260420130000_enforce_photo_plan_gate.sql` |
| Users can self-modify billing profile fields           | provavel real                       | `supabase/migrations/20260411000001_security_subscription_usage.sql`, `supabase/functions/stripe-webhook/index.ts`           |
| Stripe webhook grants Pro before payment is confirmed  | provavel real; tratado no CP-C      | `supabase/functions/stripe-webhook/index.ts`, `supabase/functions/create-checkout-session/index.ts`                          |
| Frontend build can expose privileged Supabase key      | precisa de investigacao operacional | `src/core/supabase.js`, `.github/workflows/ci.yml`, `.github/workflows/e2e.yml`                                              |

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

Classificacao: precisa de investigacao operacional.

Evidencia no codigo:

- `src/core/supabase.js:3` usa acesso dinamico `import.meta.env[name]`.
- `src/core/supabase.js:30` le `VITE_SUPABASE_KEY` no bundle frontend.
- `.github/workflows/ci.yml:41` e `.github/workflows/ci.yml:47` injetam
  `VITE_SUPABASE_KEY` a partir de GitHub Secrets.
- O comentario em `src/core/supabase.js:29` afirma que a chave deve ser apenas
  anon/publica.

Risco:

Toda variavel `VITE_*` vai para bundle publico. Se o secret armazenado em
`VITE_SUPABASE_KEY` for service-role ou outro JWT privilegiado, visitantes podem
extrair a chave do JS publicado e burlar RLS.

Correcao segura sugerida:

- CP dedicado para env/frontend build.
- Renomear para `VITE_SUPABASE_ANON_KEY` para explicitar contrato.
- Adicionar validacao defensiva que rejeite chaves JWT com role `service_role`
  no cliente.
- Trocar acesso dinamico por referencias estaticas para reduzir exposicao de
  outras variaveis `VITE_*`.
- Auditar GitHub Secrets fora do codigo antes do deploy.

Risco da correcao:

Medio. Pode quebrar CI/deploy se nomes de secrets nao forem migrados em todos os
workflows/ambientes.

Validacoes necessarias:

- Build local com env anon.
- Build falhando com chave service-role simulada.
- Busca no bundle por valores inesperados de `VITE_*`.
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
- Frontend consome `VITE_SUPABASE_KEY` no bundle publico; isso e esperado para
  anon key, mas perigoso se o secret operacional estiver incorreto.

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

- Migrar contrato de `VITE_SUPABASE_KEY` para `VITE_SUPABASE_ANON_KEY`.
- Remover acesso dinamico a `import.meta.env`.
- Adicionar validacao defensiva contra service role no cliente.
- Atualizar workflows e `env.example` se aplicavel, sem tocar em secrets reais.

Arquivos provaveis:

- `src/core/supabase.js`
- `.github/workflows/*.yml`
- `env.example`
- docs de setup, se existirem.

Validacoes:

- Build com env anon.
- Build/teste defensivo com chave service-role simulada.
- `npm run format`
- `npm run build`
- `npm run check`

### CP-E - Gate server-side para assinatura digital

Escopo:

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

Escopo:

- Analytics anonimo.
- Feedback publico.
- Uploads de fotos sem limite server-side.

Arquivos provaveis:

- `supabase/migrations/20260419120000_analytics_events.sql`
- `supabase/migrations/20260414_feedback.sql`
- `src/core/telemetrySink.js`
- `src/ui/components/supportFeedbackModal.js`
- `src/core/photoStorage.js`

Validacoes:

- Testes SQL/RLS de insert anon/auth.
- Testes de limites de payload.
- `npm run format`
- `npm run build`
- `npm run check`

### CP-H - XSS, tokens e links PDF

Escopo:

- Corrigir XSS em nome de perfil no modal de conta.
- Redigir hashes/tokens em Sentry.
- Validar URL antes de `doc.link` no PMOC PDF.
- Tratar dominio placeholder de PDF sem redesenhar PDF/share.

Arquivos provaveis:

- `src/ui/controller.js`
- `src/features/profile.js`
- `src/core/observability.js`
- `src/app.js`
- `src/domain/pdf/pmoc/sections/cover.js`
- `src/domain/pdf/sections/upsell.js`

Validacoes:

- Testes de escaping/sanitizacao.
- Teste de URL allowlist para PDF.
- `npm run format`
- `npm run build`
- `npm run check`

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

Proximo CP recomendado apos CP-C: CP-D - Hardening da chave Supabase no
frontend.

Justificativa:

- CP-B reduziu a manipulacao direta de billing/quota.
- CP-C corrigiu a promocao antecipada de entitlement Stripe.
- O proximo risco high documentado e a possibilidade de exposicao/uso incorreto
  de chave Supabase privilegiada no bundle frontend.
- CP-D deve tratar apenas contrato de env Supabase frontend, sem misturar
  PDF/share, Vite warnings genericos, assinatura digital ou React Doctor.
