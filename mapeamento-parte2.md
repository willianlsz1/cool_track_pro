# Mapeamento completo — parte 2

> Continuação das seções intermediárias faltantes do mapeamento profundo do CoolTrack Pro. Este arquivo foi gerado em modo inventário: apenas leitura de código, build sem watch e criação deste Markdown na raiz.

## Seção 4 (final). Bundle analysis

### Comandos-base executados

```bash
ls -lah dist/assets/ | sort -k5 -hr | head -20
ls -lah dist/ | head -10
du -sh dist/
```

- Tamanho total de `dist/`: `7.1M`.
- Source maps: `0` arquivo(s); peso total `0 B`. O build está com `sourcemap: false`.

### Top 20 arquivos em `dist/assets/` por tamanho

|   # | Arquivo                                           | Tipo   |  Tamanho |
| --: | ------------------------------------------------- | ------ | -------: |
|   1 | `dist/assets/cooling-tech.Cw8VWBGU.png`           | `.png` |   1.9 MB |
|   2 | `dist/assets/index.DvDXcuul.js`                   | `.js`  | 905.6 KB |
|   3 | `dist/assets/vendor-pdf.BULMqd7w.js`              | `.js`  | 757.8 KB |
|   4 | `dist/assets/index.BmUqti21.css`                  | `.css` | 531.3 KB |
|   5 | `dist/assets/vendor-sentry.DmKQbHIp.js`           | `.js`  | 332.8 KB |
|   6 | `dist/assets/vendor-charts.CFNrZGOd.js`           | `.js`  | 202.6 KB |
|   7 | `dist/assets/vendor-supabase.D3Pb_Qvf.js`         | `.js`  | 192.3 KB |
|   8 | `dist/assets/client.BLLOfGUd.js`                  | `.js`  | 138.4 KB |
|   9 | `dist/assets/landingIsland.D5ujICqS.js`           | `.js`  |  79.7 KB |
|  10 | `dist/assets/tailwind.CzoHfK92.css`               | `.css` |  32.1 KB |
|  11 | `dist/assets/pdf.B9RjzC6l.js`                     | `.js`  |  24.2 KB |
|  12 | `dist/assets/pmocReport.CMp88haT.js`              | `.js`  |  23.8 KB |
|  13 | `dist/assets/purify.es.B5CD4DQe.js`               | `.js`  |  22.4 KB |
|  14 | `dist/assets/clientesIsland.Dvd37KS8.js`          | `.js`  |  21.4 KB |
|  15 | `dist/assets/orcamentoSignaturePage.DzTXNoMC.js`  | `.js`  |  15.4 KB |
|  16 | `dist/assets/relatorioCardsIsland.DfiOG3Ef.js`    | `.js`  |  13.5 KB |
|  17 | `dist/assets/relatorioControlsIsland.DIrNfsVe.js` | `.js`  |  11.9 KB |
|  18 | `dist/assets/registroHeaderIsland.Cuz1EmrT.js`    | `.js`  |  11.8 KB |
|  19 | `dist/assets/historicoTimelineIsland.COX2K2T6.js` | `.js`  |  11.0 KB |
|  20 | `dist/assets/equipamentosListIsland.BrLVd9dB.js`  | `.js`  |  10.6 KB |

### JS: chunks lazy vs entry monolítico

| Grupo                   | Arquivos | Peso total | Observação                                          |
| ----------------------- | -------: | ---------: | --------------------------------------------------- |
| Entry principal         |        1 |   905.6 KB | `index.*.js` ainda é o maior JS da aplicação.       |
| Vendors separados       |        4 |     1.5 MB | Chunks manuais para PDF, Sentry, Charts e Supabase. |
| Islands/lazy app        |       24 |   370.7 KB | Chunks pequenos de React islands/rotas.             |
| Outros lazy/utilitários |       14 |   142.3 KB | PDF, purify, primitives e auxiliares.               |

> Ressalva: o build avisou que alguns módulos são importados tanto dinamicamente quanto estaticamente; nesses casos, o Rollup não consegue mover o módulo para chunk lazy separado.

### CSS bundles

| Arquivo                             |  Tamanho |
| ----------------------------------- | -------: |
| `dist/assets/index.BmUqti21.css`    | 531.3 KB |
| `dist/assets/tailwind.CzoHfK92.css` |  32.1 KB |

### Imagens grandes (> 100 KB)

| Arquivo                                 | Tamanho |
| --------------------------------------- | ------: |
| `dist/assets/cooling-tech.Cw8VWBGU.png` |  1.9 MB |

## Seção 5. JS hotspots

### Top 10 arquivos JS/JSX por LOC (excluindo testes)

|   # | Arquivo                                 |  LOC |
| --: | --------------------------------------- | ---: |
|   1 | `src/ui/views/equipamentos.js`          | 2746 |
|   2 | `src/ui/views/registro.js`              | 1997 |
|   3 | `src/ui/views/historico.js`             | 1652 |
|   4 | `src/ui/views/dashboard.js`             | 1294 |
|   5 | `src/ui/components/authscreen.js`       | 1240 |
|   6 | `src/ui/components/nameplateCapture.js` | 1222 |
|   7 | `src/ui/shell/templates/modals.js`      | 1165 |
|   8 | `src/domain/pmoc/checklistTemplates.js` | 1115 |
|   9 | `src/react/pages/ClientesPage.jsx`      | 1032 |
|  10 | `src/ui/shell/templates/views.js`       |  990 |

### 5 arquivos com mais funções declaradas

|   # | Arquivo                                 | Funções declaradas |
| --: | --------------------------------------- | -----------------: |
|   1 | `src/ui/views/registro.js`              |                 91 |
|   2 | `src/ui/components/nameplateCapture.js` |                 90 |
|   3 | `src/ui/views/dashboard.js`             |                 71 |
|   4 | `src/ui/views/historico.js`             |                 55 |
|   5 | `src/ui/views/equipamentos.js`          |                 55 |

### Arquivos com nesting profundo (≥ 6 níveis / ≥ 24 espaços)

|   # | Arquivo                                       | Indent máximo | Níveis aprox. |
| --: | --------------------------------------------- | ------------: | ------------: |
|   1 | `src/react/pages/DashboardReadOnlyBlocks.jsx` |            26 |             6 |
|   2 | `src/ui/shell/templates/views.js`             |            24 |             6 |

> Proxy usado: LOC, declarações no início de linha e indentação máxima. Não substitui análise AST/ciclomática.

## Seção 6. Schema Supabase + RLS

### Migrations SQL encontradas

- `supabase/migrations/20260411000000_baseline_core_tables.sql`
- `supabase/migrations/20260411000001_security_subscription_usage.sql`
- `supabase/migrations/20260414000000_feedback.sql`
- `supabase/migrations/20260415000000_push_subscriptions.sql`
- `supabase/migrations/20260417000000_equipamentos_manutencao_fields.sql`
- `supabase/migrations/20260418120000_auto_create_profile.sql`
- `supabase/migrations/20260418130000_add_plus_to_plan_checks.sql`
- `supabase/migrations/20260418140000_setores.sql`
- `supabase/migrations/20260418150000_equipamentos_fotos.sql`
- `supabase/migrations/20260419120000_analytics_events.sql`
- `supabase/migrations/20260419130000_protect_profile_fields.sql`
- `supabase/migrations/20260419140000_harden_feedback_analytics.sql`
- `supabase/migrations/20260420120000_setores_descricao_responsavel.sql`
- `supabase/migrations/20260420130000_enforce_photo_plan_gate.sql`
- `supabase/migrations/20260420140000_enforce_setores_pro_gate.sql`
- `supabase/migrations/20260420150000_enforce_plan_quotas.sql`
- `supabase/migrations/20260420160000_stripe_webhook_idempotency.sql`
- `supabase/migrations/20260421120000_equipamentos_dados_placa.sql`
- `supabase/migrations/20260421130000_nameplate_analysis_quota.sql`
- `supabase/migrations/20260421140000_ai_usage_cost.sql`
- `supabase/migrations/20260424120000_relatorios_bucket.sql`
- `supabase/migrations/20260424150000_harden_photo_plan_gate_ownership.sql`
- `supabase/migrations/20260425120000_pmoc_clientes_empresa.sql`
- `supabase/migrations/20260425130000_pmoc_checklist_registros.sql`
- `supabase/migrations/20260425140000_baseline_core_rls.sql`
- `supabase/migrations/20260425150000_stripe_webhook_claimed_at.sql`
- `supabase/migrations/20260426120000_equipamentos_componente.sql`
- `supabase/migrations/20260426130000_setores_cliente_id.sql`
- `supabase/migrations/20260426140000_profiles_pmoc_fields.sql`
- `supabase/migrations/20260426150000_clientes_finalidade.sql`
- `supabase/migrations/20260426160000_orcamentos.sql`
- `supabase/migrations/20260426170000_orcamentos_assinatura_digital.sql`
- `supabase/migrations/20260426170100_fix_get_orcamento_by_token.sql`
- `supabase/migrations/20260426170200_fix_get_orcamento_profiles_id.sql`

### Extração por migration

| Migration                                                                 | CREATE TABLE                                               | ADD COLUMN                                                                                                                         | CREATE POLICY                                                                                                                                                                                                                                                                                                                          | CREATE INDEX                                                                                                                                                                                                               | CREATE TRIGGER                                                                                                         | FOREIGN KEY explícita             |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `supabase/migrations/20260411000000_baseline_core_tables.sql`             | public.equipamentos<br>public.registros<br>public.tecnicos | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | equipamentos_user_id_idx / public.equipamentos<br>registros_user_id_idx / public.registros<br>registros_equip_id_idx / public.registros<br>registros_data_idx / public.registros<br>tecnicos_user_id_idx / public.tecnicos | —                                                                                                                      | —                                 |
| `supabase/migrations/20260411000001_security_subscription_usage.sql`      | public.profiles<br>public.usage_monthly                    | public.profiles.plan_code                                                                                                          | profiles_select_own / public.profiles / SELECT<br>profiles_insert_own / public.profiles / INSERT<br>profiles_update_own / public.profiles / UPDATE<br>usage_monthly_select_own / public.usage_monthly / SELECT<br>usage_monthly_insert_own / public.usage_monthly / INSERT<br>usage_monthly_update_own / public.usage_monthly / UPDATE | usage_monthly_user_month_resource_uk / public.usage_monthly                                                                                                                                                                | —                                                                                                                      | —                                 |
| `supabase/migrations/20260414000000_feedback.sql`                         | public.feedback                                            | —                                                                                                                                  | feedback_insert_any / public.feedback / INSERT<br>feedback_select_own / public.feedback / SELECT                                                                                                                                                                                                                                       | feedback_created_at_idx / public.feedback                                                                                                                                                                                  | —                                                                                                                      | —                                 |
| `supabase/migrations/20260415000000_push_subscriptions.sql`               | public.push_subscriptions                                  | —                                                                                                                                  | push_sub_own / public.push_subscriptions / ALL                                                                                                                                                                                                                                                                                         | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260417000000_equipamentos_manutencao_fields.sql`   | —                                                          | public.equipamentos.criticidade<br>public.equipamentos.prioridade_operacional<br>public.equipamentos.periodicidade_preventiva_dias | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260418120000_auto_create_profile.sql`              | —                                                          | public.profiles.plan<br>public.profiles.subscription_status<br>public.profiles.is_dev                                              | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | on_auth_user_created / auth.users                                                                                      | —                                 |
| `supabase/migrations/20260418130000_add_plus_to_plan_checks.sql`          | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260418140000_setores.sql`                          | public.setores                                             | public.equipamentos.setor_id                                                                                                       | setores_select_own / public.setores / SELECT<br>setores_insert_own / public.setores / INSERT<br>setores_update_own / public.setores / UPDATE<br>setores_delete_own / public.setores / DELETE                                                                                                                                           | setores_user_id_idx / public.setores<br>equipamentos_setor_id_idx / public.equipamentos                                                                                                                                    | —                                                                                                                      | setor_id -> public.setores(id)    |
| `supabase/migrations/20260418150000_equipamentos_fotos.sql`               | —                                                          | public.equipamentos.fotos                                                                                                          | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260419120000_analytics_events.sql`                 | public.analytics_events                                    | —                                                                                                                                  | analytics_events_insert_any / public.analytics_events / INSERT                                                                                                                                                                                                                                                                         | analytics_events_name_created_at_idx / public.analytics_events<br>analytics_events_session_idx / public.analytics_events<br>analytics_events_user_idx / public.analytics_events                                            | —                                                                                                                      | —                                 |
| `supabase/migrations/20260419130000_protect_profile_fields.sql`           | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | protect_profile_fields_trigger / public.profiles<br>protect_profile_insert_trigger / public.profiles                   | —                                 |
| `supabase/migrations/20260419140000_harden_feedback_analytics.sql`        | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260420120000_setores_descricao_responsavel.sql`    | —                                                          | ....IF<br>public.setores.descricao                                                                                                 | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260420130000_enforce_photo_plan_gate.sql`          | —                                                          | —                                                                                                                                  | equipamento_fotos_require_plus_insert / storage.objects / INSERT<br>equipamento_fotos_require_plus_update / storage.objects / UPDATE                                                                                                                                                                                                   | —                                                                                                                                                                                                                          | enforce_photo_plan_gate_trigger / public.equipamentos                                                                  | —                                 |
| `supabase/migrations/20260420140000_enforce_setores_pro_gate.sql`         | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | enforce_setores_pro_gate_trigger / public.setores                                                                      | —                                 |
| `supabase/migrations/20260420150000_enforce_plan_quotas.sql`              | —                                                          | public.registros.created_at                                                                                                        | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | enforce_equipamentos_limit_trigger / public.equipamentos<br>enforce_registros_monthly_limit_trigger / public.registros | —                                 |
| `supabase/migrations/20260420160000_stripe_webhook_idempotency.sql`       | public.stripe_webhook_events                               | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | stripe_webhook_events_received_at_idx / public.stripe_webhook_events<br>stripe_webhook_events_customer_id_idx / public.stripe_webhook_events<br>stripe_webhook_events_user_id_idx / public.stripe_webhook_events           | —                                                                                                                      | —                                 |
| `supabase/migrations/20260421120000_equipamentos_dados_placa.sql`         | —                                                          | public.equipamentos.dados_placa                                                                                                    | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260421130000_nameplate_analysis_quota.sql`         | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260421140000_ai_usage_cost.sql`                    | public.ai_usage_cost                                       | —                                                                                                                                  | ai_usage_cost_select_own / public.ai_usage_cost / SELECT                                                                                                                                                                                                                                                                               | ai_usage_cost_user_id_created_at_idx / public.ai_usage_cost<br>ai_usage_cost_resource_created_at_idx / public.ai_usage_cost                                                                                                | —                                                                                                                      | —                                 |
| `supabase/migrations/20260424120000_relatorios_bucket.sql`                | —                                                          | —                                                                                                                                  | relatorios_insert_own / storage.objects / INSERT<br>relatorios_select_own / storage.objects / SELECT<br>relatorios_update_own / storage.objects / UPDATE<br>relatorios_delete_own / storage.objects / DELETE                                                                                                                           | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260424150000_harden_photo_plan_gate_ownership.sql` | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260425120000_pmoc_clientes_empresa.sql`            | public.clientes                                            | public.profiles.razao_social<br>public.equipamentos.cliente_id                                                                     | clientes_select_own / public.clientes / SELECT<br>clientes_insert_own / public.clientes / INSERT<br>clientes_update_own / public.clientes / UPDATE<br>clientes_delete_own / public.clientes / DELETE                                                                                                                                   | idx_clientes_user_id / public.clientes<br>idx_equipamentos_cliente_id / public.equipamentos                                                                                                                                | trg_clientes_updated_at / public.clientes                                                                              | —                                 |
| `supabase/migrations/20260425130000_pmoc_checklist_registros.sql`         | —                                                          | public.registros.checklist                                                                                                         | —                                                                                                                                                                                                                                                                                                                                      | idx_registros_checklist / public.registros                                                                                                                                                                                 | —                                                                                                                      | —                                 |
| `supabase/migrations/20260425140000_baseline_core_rls.sql`                | —                                                          | —                                                                                                                                  | %I / public.%I / SELECT<br>%I / public.%I / INSERT<br>%I / public.%I / UPDATE<br>%I / public.%I / DELETE                                                                                                                                                                                                                               | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260425150000_stripe_webhook_claimed_at.sql`        | —                                                          | public.stripe_webhook_events.claimed_at                                                                                            | —                                                                                                                                                                                                                                                                                                                                      | stripe_webhook_events_stuck_lookup_idx / public.stripe_webhook_events                                                                                                                                                      | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426120000_equipamentos_componente.sql`          | —                                                          | public.equipamentos.componente                                                                                                     | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426130000_setores_cliente_id.sql`               | —                                                          | public.setores.cliente_id                                                                                                          | —                                                                                                                                                                                                                                                                                                                                      | setores_cliente_id_idx / public.setores                                                                                                                                                                                    | —                                                                                                                      | cliente_id -> public.clientes(id) |
| `supabase/migrations/20260426140000_profiles_pmoc_fields.sql`             | —                                                          | public.profiles.responsavel_tecnico<br>public.profiles.art_rrt<br>public.profiles.crea_cft<br>public.profiles.cidade               | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426150000_clientes_finalidade.sql`              | —                                                          | public.clientes.finalidade                                                                                                         | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426160000_orcamentos.sql`                       | public.orcamentos                                          | public.profiles.orcamento_numero_format                                                                                            | orcamentos_select_own / public.orcamentos / SELECT<br>orcamentos_insert_own / public.orcamentos / INSERT<br>orcamentos_update_own / public.orcamentos / UPDATE<br>orcamentos_delete_own / public.orcamentos / DELETE                                                                                                                   | orcamentos_user_id_idx / public.orcamentos<br>orcamentos_status_idx / public.orcamentos<br>orcamentos_created_at_idx / public.orcamentos                                                                                   | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426170000_orcamentos_assinatura_digital.sql`    | —                                                          | public.orcamentos.share_token                                                                                                      | —                                                                                                                                                                                                                                                                                                                                      | orcamentos_share_token_idx / public.orcamentos                                                                                                                                                                             | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426170100_fix_get_orcamento_by_token.sql`       | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |
| `supabase/migrations/20260426170200_fix_get_orcamento_profiles_id.sql`    | —                                                          | —                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                          | —                                                                                                                      | —                                 |

### Tabela final por tabela

| Tabela                         | Colunas (tipo + NULL/NOT NULL quando declarado)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Foreign keys                                                                                                                                         | RLS policies | Indexes | `user_id`? | `organization_id`? |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -----------: | ------: | ---------- | ------------------ |
| `...`                          | `IF` NOT EXISTS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                                                                                                                                                    |            0 |       0 | não        | não                |
| `auth.users`                   | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                                                                                                                                                    |            0 |       0 | não        | não                |
| `public.%I`                    | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                                                                                                                                                    |            4 |       0 | não        | não                |
| `public.ai_usage_cost`         | `id` uuid primary key default gen_random_uuid()<br>`user_id` uuid not null references auth.users(id) on delete cascade<br>`created_at` timestamptz not null default timezone('utc', now())<br>`resource` text not null<br>`model` text not null<br>`input_tokens` integer not null default 0<br>`output_tokens` integer not null default 0<br>`cost_usd` numeric(10, 6) not null default 0<br>`success` boolean not null default true                                                                                                                                                                                                                                                                            | user_id uuid not null references auth.users(id) on delete cascade                                                                                    |            1 |       2 | sim        | não                |
| `public.analytics_events`      | `id` uuid primary key default gen_random_uuid()<br>`name` text not null check (length(name) > 0 and length(name) <= 64)<br>`payload` jsonb not null default '{}'::jsonb<br>`session_id` text not null check (length(session_id) between 1 and 64)<br>`user_id` uuid references auth.users(id) on delete set null<br>`created_at` timestamptz not null default timezone('utc', now())                                                                                                                                                                                                                                                                                                                             | user_id uuid references auth.users(id) on delete set null                                                                                            |            1 |       3 | sim        | não                |
| `public.clientes`              | `id` uuid primary key default gen_random_uuid()<br>`user_id` uuid not null references auth.users(id) on delete cascade<br>`--` Nome de fantasia (pra exibir na UI). Obrigatório. nome text not null<br>`inscricao_estadual` text<br>`inscricao_municipal` text<br>`e-mail` ou WhatsApp — campo livre. contato text<br>`created_at` timestamptz not null default timezone('utc', now())<br>`updated_at` timestamptz not null default timezone('utc', now())<br>`finalidade` text                                                                                                                                                                                                                                  | user_id uuid not null references auth.users(id) on delete cascade                                                                                    |            4 |       1 | sim        | não                |
| `public.equipamentos`          | `id` text primary key<br>`user_id` uuid not null references auth.users (id) on delete cascade<br>`nome` text not null<br>`local` text not null<br>`status` text default 'ok'<br>`tag` text default ''<br>`tipo` text default 'Outro'<br>`modelo` text default ''<br>`fluido` text default ''<br>`created_at` timestamptz default now()<br>`criticidade` text<br>`prioridade_operacional` text<br>`periodicidade_preventiva_dias` integer<br>`setor_id` text<br>`fotos` jsonb not null default '[]'::jsonb<br>`dados_placa` jsonb<br>`cliente_id` uuid references public.clientes(id) on delete set null<br>`componente` text                                                                                     | user_id uuid not null references auth.users (id) on delete cascade<br>cliente_id uuid references public.clientes(id) on delete set null,             |            0 |       3 | sim        | não                |
| `public.feedback`              | `id` uuid primary key default gen_random_uuid()<br>`user_id` uuid references auth.users(id) on delete set null<br>`user_email` text<br>`rating` int not null check (rating between 1 and 5)<br>`message` text<br>`created_at` timestamptz not null default timezone('utc', now())                                                                                                                                                                                                                                                                                                                                                                                                                                | user_id uuid references auth.users(id) on delete set null                                                                                            |            2 |       1 | sim        | não                |
| `public.orcamentos`            | `id` uuid NOT NULL DEFAULT gen_random_uuid()<br>`user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE<br>`--` Identificacao numero text NOT NULL<br>`fica` linkado. cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL<br>`cliente_nome` text NOT NULL<br>`cliente_telefone` text<br>`cliente_endereco` text<br>`descricao` text<br>`itens` jsonb NOT NULL DEFAULT '[]'::jsonb<br>`qty` <br>`valor_unitario` <br>`total}]` -- Valores subtotal numeric(12,2) NOT NULL DEFAULT 0<br>`desconto` numeric(12,2) NOT NULL DEFAULT 0<br>`total` numeric(12,2) NOT NULL DEFAULT 0<br>`forma_pagamento` text<br>`observacoes` text<br>`enviado_em` timestamptz<br>`aprovado_em` timestamptz | user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE<br>fica linkado. cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL |            4 |       4 | sim        | não                |
| `public.profiles`              | `id` uuid not null references auth.users (id) on delete cascade<br>`nome` text<br>`plan_code` text not null default 'free'<br>`stripe_customer_id` text<br>`stripe_subscription_id` text<br>`created_at` timestamptz not null default timezone('utc', now())<br>`updated_at` timestamptz not null default timezone('utc', now())<br>`plan` text not null default 'free'<br>`subscription_status` text not null default 'inactive'<br>`is_dev` boolean not null default false<br>`razao_social` text<br>`responsavel_tecnico` text<br>`art_rrt` text<br>`crea_cft` text<br>`cidade` text<br>`orcamento_numero_format` text DEFAULT 'ORC-{YYYY}-{NNNN}'                                                            | id uuid not null references auth.users (id) on delete cascade                                                                                        |            3 |       0 | não        | não                |
| `public.push_subscriptions`    | `user_id` uuid primary key references auth.users(id) on delete cascade<br>`subscription` text not null<br>`user_agent` text<br>`updated_at` timestamptz not null default timezone('utc', now())<br>`created_at` timestamptz not null default timezone('utc', now())                                                                                                                                                                                                                                                                                                                                                                                                                                              | user_id uuid primary key references auth.users(id) on delete cascade                                                                                 |            1 |       0 | sim        | não                |
| `public.registros`             | `id` text primary key<br>`user_id` uuid not null references auth.users (id) on delete cascade<br>`equip_id` text not null references public.equipamentos (id) on delete cascade<br>`data` text not null<br>`tipo` text not null<br>`obs` text default ''<br>`status` text default 'ok'<br>`pecas` text default ''<br>`proxima` text default ''<br>`tecnico` text default ''<br>`custo_pecas` numeric default 0<br>`custo_mao_obra` numeric default 0<br>`assinatura` boolean default false<br>`fotos` jsonb default '[]'::jsonb<br>`created_at` timestamptz default now()<br>`checklist` jsonb                                                                                                                   | user_id uuid not null references auth.users (id) on delete cascade<br>equip_id text not null references public.equipamentos (id) on delete cascade   |            0 |       4 | sim        | não                |
| `public.setores`               | `id` text not null<br>`user_id` uuid not null references auth.users (id) on delete cascade<br>`nome` text not null<br>`cor` text not null default '#00bcd4'<br>`created_at` timestamptz not null default timezone('utc', now())<br>`updated_at` timestamptz not null default timezone('utc', now())<br>`descricao` text<br>`cliente_id` uuid                                                                                                                                                                                                                                                                                                                                                                     | user_id uuid not null references auth.users (id) on delete cascade                                                                                   |            4 |       2 | sim        | não                |
| `public.stripe_webhook_events` | `event_id` text primary key<br>`event_type` text not null<br>`received_at` timestamptz not null default timezone('utc', now())<br>`processed_at` timestamptz<br>`--` Metadata opcional pra debug. NÃO guardamos o payload inteiro (já está no -- Stripe dashboard<br>`claimed_at` timestamptz                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                                    |            0 |       4 | não        | não                |
| `public.tecnicos`              | `id` uuid primary key default gen_random_uuid()<br>`user_id` uuid not null references auth.users (id) on delete cascade<br>`nome` text not null<br>`created_at` timestamptz default now()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | user_id uuid not null references auth.users (id) on delete cascade                                                                                   |            0 |       1 | sim        | não                |
| `public.usage_monthly`         | `user_id` uuid not null references auth.users (id) on delete cascade<br>`month_start` date not null<br>`resource` text not null<br>`used_count` integer not null default 0<br>`created_at` timestamptz not null default timezone('utc', now())<br>`updated_at` timestamptz not null default timezone('utc', now())                                                                                                                                                                                                                                                                                                                                                                                               | user_id uuid not null references auth.users (id) on delete cascade                                                                                   |            3 |       1 | sim        | não                |
| `storage.objects`              | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                                                                                                                                                    |            6 |       0 | não        | não                |

## Seção 7. Persistência local

### Keys de localStorage usadas

| Key/prefix                            | Leitura (arquivos)                                                                                                                        | Escrita/remoção (arquivos)                                                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cooltrack-`                          | src/app.js<br>src/core/auth.js<br>src/core/clienteAlerts.js<br>src/core/errors.js                                                         | src/app.js<br>src/core/auth.js<br>src/core/clienteAlerts.js<br>src/core/devWipeData.js                                                    |
| `cooltrack-blob-queue`                | —                                                                                                                                         | —                                                                                                                                         |
| `cooltrack-bundle-recovery-attempted` | src/core/recoverFromStaleBundle.js                                                                                                        | src/core/recoverFromStaleBundle.js                                                                                                        |
| `cooltrack-cache-owner-v1`            | src/core/storage.js                                                                                                                       | src/core/devWipeData.js<br>src/core/storage.js                                                                                            |
| `cooltrack-cached-plan`               | src/core/auth.js<br>src/core/plans/planCache.js                                                                                           | src/core/auth.js<br>src/core/plans/planCache.js                                                                                           |
| `cooltrack-cliente-alert:`            | src/core/clienteAlerts.js                                                                                                                 | src/core/clienteAlerts.js                                                                                                                 |
| `cooltrack-dev-mode`                  | src/app.js<br>src/core/plans/devPlanOverride.js<br>src/core/plans/monetization.js<br>src/core/plans/planCache.js                          | src/app.js<br>src/core/plans/devPlanOverride.js<br>src/core/plans/planCache.js<br>src/ui/components/devPlanToggle.js                      |
| `cooltrack-dev-plan-override`         | src/core/plans/devPlanOverride.js                                                                                                         | src/core/plans/devPlanOverride.js                                                                                                         |
| `cooltrack-dev-toggle-minimized`      | src/ui/components/devPlanToggle.js                                                                                                        | src/ui/components/devPlanToggle.js                                                                                                        |
| `cooltrack-dev-toggle-pos`            | src/ui/components/devPlanToggle.js                                                                                                        | src/ui/components/devPlanToggle.js                                                                                                        |
| `cooltrack-editing-id`                | src/ui/controller/helpers/themeInitHelpers.js<br>src/ui/views/dashboard.js<br>src/ui/views/registro.js                                    | src/ui/controller/handlers/navigationHandlers.js<br>src/ui/controller/helpers/themeInitHelpers.js<br>src/ui/views/registro.js             |
| `cooltrack-equip-view-mode`           | src/ui/controller/helpers/themeInitHelpers.js                                                                                             | src/ui/controller/helpers/themeInitHelpers.js                                                                                             |
| `cooltrack-error-log`                 | src/core/errors.js                                                                                                                        | src/core/errors.js                                                                                                                        |
| `cooltrack-feedback-history`          | src/ui/components/supportFeedbackModal.js                                                                                                 | src/ui/components/supportFeedbackModal.js                                                                                                 |
| `cooltrack-ftx-done`                  | src/ui/components/onboarding/firstTimeExperience.js                                                                                       | src/ui/components/onboarding/firstTimeExperience.js                                                                                       |
| `cooltrack-ftx-skipped`               | src/ui/components/onboarding/firstTimeExperience.js<br>src/ui/components/onboarding/onboardingBanner.js                                   | src/ui/components/onboarding/firstTimeExperience.js<br>src/ui/components/onboarding/onboardingBanner.js                                   |
| `cooltrack-highlight-id`              | src/ui/components/onboarding/savedHighlight.js                                                                                            | src/ui/components/onboarding/savedHighlight.js                                                                                            |
| `cooltrack-hist-period`               | src/ui/views/historico.js                                                                                                                 | src/ui/views/historico.js                                                                                                                 |
| `cooltrack-hist-summary-collapsed`    | src/ui/views/historico.js                                                                                                                 | src/ui/views/historico.js                                                                                                                 |
| `cooltrack-hist-tipo`                 | src/ui/views/historico.js                                                                                                                 | src/ui/views/historico.js                                                                                                                 |
| `cooltrack-last-client`               | src/ui/views/registro.js                                                                                                                  | src/ui/views/registro.js                                                                                                                  |
| `cooltrack-last-tecnico`              | src/app.js<br>src/core/auth.js<br>src/features/profile.js                                                                                 | src/app.js<br>src/core/auth.js<br>src/features/profile.js                                                                                 |
| `cooltrack-migrated-`                 | src/core/storage.js                                                                                                                       | src/core/devWipeData.js<br>src/core/storage.js                                                                                            |
| `cooltrack-oauth-pending-v1`          | src/core/auth.js                                                                                                                          | src/core/auth.js                                                                                                                          |
| `cooltrack-offline-banner`            | —                                                                                                                                         | —                                                                                                                                         |
| `cooltrack-os-counter-`               | src/domain/pdf/reportModel.js                                                                                                             | src/domain/pdf/reportModel.js                                                                                                             |
| `cooltrack-pdf-preview`               | src/ui/controller/handlers/reportExportHandlers.js                                                                                        | src/ui/controller/handlers/reportExportHandlers.js                                                                                        |
| `cooltrack-pdf-preview=true`          | src/ui/controller/handlers/reportExportHandlers.js                                                                                        | src/ui/controller/handlers/reportExportHandlers.js                                                                                        |
| `cooltrack-photo-pending-upload`      | src/core/photoStorage.js                                                                                                                  | src/core/photoStorage.js                                                                                                                  |
| `cooltrack-pmoc-num`                  | src/domain/pdf/pmoc/pmocReport.js                                                                                                         | src/domain/pdf/pmoc/pmocReport.js                                                                                                         |
| `cooltrack-post-auth-redirect`        | src/app.js                                                                                                                                | src/app.js<br>src/ui/components/authscreen.js                                                                                             |
| `cooltrack-profile`                   | src/core/auth.js<br>src/features/profile.js                                                                                               | src/core/auth.js<br>src/features/profile.js                                                                                               |
| `cooltrack-sig-`                      | src/core/signatureStorage.js<br>src/ui/components/signature/signature-storage.js<br>src/ui/views/historico.js<br>src/ui/views/registro.js | src/core/signatureStorage.js<br>src/ui/components/signature/signature-storage.js<br>src/ui/views/historico.js<br>src/ui/views/registro.js |
| `cooltrack-sig-cleanup-done`          | src/ui/components/signature/signature-storage.js                                                                                          | src/ui/components/signature/signature-storage.js                                                                                          |
| `cooltrack-sig-pending-upload`        | src/core/signatureStorage.js<br>src/ui/components/signature/signature-storage.js<br>src/ui/views/registro.js                              | src/core/signatureStorage.js<br>src/ui/components/signature/signature-storage.js<br>src/ui/views/registro.js                              |
| `cooltrack-sync-deletions-v1`         | src/core/storage.js                                                                                                                       | src/core/devWipeData.js<br>src/core/storage.js                                                                                            |
| `cooltrack-sync-dirty-v1`             | src/core/storage.js                                                                                                                       | src/core/devWipeData.js<br>src/core/storage.js                                                                                            |
| `cooltrack-telemetry`                 | src/core/telemetrySink.js                                                                                                                 | src/core/telemetrySink.js                                                                                                                 |
| `cooltrack-telemetry-session`         | src/core/telemetrySink.js                                                                                                                 | src/core/telemetrySink.js                                                                                                                 |
| `cooltrack-theme`                     | src/core/auth.js                                                                                                                          | src/core/auth.js                                                                                                                          |
| `cooltrack-tour-done`                 | src/ui/components/tour.js                                                                                                                 | src/ui/components/tour.js                                                                                                                 |
| `cooltrack.app`                       | —                                                                                                                                         | —                                                                                                                                         |
| `cooltrack:auth-changed`              | src/app.js<br>src/core/plans/monetization.js                                                                                              | src/app.js                                                                                                                                |
| `cooltrack:navigation-mode-changed`   | src/ui/shell/navigationMode.js                                                                                                            | src/ui/shell/navigationMode.js                                                                                                            |
| `cooltrack:online-status`             | —                                                                                                                                         | —                                                                                                                                         |
| `cooltrack:overflow-onboarded`        | src/ui/components/overflowBanner.js                                                                                                       | src/ui/components/overflowBanner.js                                                                                                       |
| `cooltrack:plan-changed`              | src/core/plans/monetization.js<br>src/core/plans/planCache.js                                                                             | src/core/plans/planCache.js                                                                                                               |
| `cooltrack:profile-updated`           | src/core/plans/monetization.js                                                                                                            | —                                                                                                                                         |
| `cooltrack:sync-status`               | src/core/storage.js<br>src/ui/controller/helpers/themeInitHelpers.js                                                                      | src/core/storage.js<br>src/ui/controller/helpers/themeInitHelpers.js                                                                      |
| `cooltrack:telemetry`                 | —                                                                                                                                         | —                                                                                                                                         |
| `cooltrack_`                          | src/core/auth.js<br>src/core/utils.js<br>src/ui/shell/navigationMode.js<br>src/ui/views/relatorio.js                                      | src/core/auth.js<br>src/core/devWipeData.js<br>src/ui/shell/navigationMode.js<br>src/ui/views/relatorio.js                                |
| `cooltrack_nav_mode`                  | src/ui/shell/navigationMode.js                                                                                                            | src/ui/shell/navigationMode.js                                                                                                            |
| `cooltrack_relatorio_view_mode`       | src/ui/views/relatorio.js                                                                                                                 | src/ui/views/relatorio.js                                                                                                                 |
| `cooltrack_v3`                        | src/core/utils.js                                                                                                                         | src/core/devWipeData.js                                                                                                                   |
| `ct-ftx-done:`                        | src/ui/components/onboarding/firstTimeExperience.js                                                                                       | src/ui/components/onboarding/firstTimeExperience.js                                                                                       |
| `ct-ftx-skipped:`                     | src/ui/components/onboarding/firstTimeExperience.js<br>src/ui/components/onboarding/onboardingBanner.js                                   | src/ui/components/onboarding/firstTimeExperience.js<br>src/ui/components/onboarding/onboardingBanner.js                                   |
| `ct-tour-done:`                       | src/ui/components/tour.js                                                                                                                 | src/ui/components/tour.js                                                                                                                 |
| `ct:install-prompt-dismissed`         | src/ui/components/installAppPrompt.js                                                                                                     | src/ui/components/installAppPrompt.js                                                                                                     |

### IndexedDB e `blobQueue`

- Lib usada: IndexedDB nativo (`indexedDB.open`), sem Dexie/idb.
- Banco: `cooltrack-blob-queue`; store: `photo-pending`; versão: `1`; keyPath: `key`.
- Schema da fila: `{ key, blob, metadata }`. Em ambiente sem IndexedDB, usa `Map` em memória e as pendências não sobrevivem reload.
- Chamadores principais: `src/core/photoStorage.js` enfileira blobs pendentes; `src/core/telemetrySink.js` também usa IndexedDB nativo para telemetria offline.

### Migração `cooltrack_v3`

- Snapshot principal: `cooltrack_v3` em `src/core/utils.js`.
- `migrateIfNeeded(userId)` em `src/core/storage.js` checa dono de cache, dirty flag e snapshot local antes de pull/push contra Supabase.
- A migração de fotos legadas é delegada para `migrateLegacyPhotosInState`; após normalização, o estado é persistido por `writeLocalSnapshot`.

## Seção 8. Testes

| Métrica                                           | Total |
| ------------------------------------------------- | ----: |
| Vitest (`src/__tests__/**/*.test.*`)              |   185 |
| Playwright (`e2e/**/*.spec.*`)                    |    12 |
| pgTAP/Supabase SQL tests (`supabase/tests/*.sql`) |     8 |

### Distribuição por área

| Área       | Testes por nome de arquivo |
| ---------- | -------------------------: |
| `core`     |                          1 |
| `domain`   |                          0 |
| `ui`       |                         16 |
| `react`    |                          1 |
| `features` |                          0 |

Coverage local: `sem diretório coverage/`.

### Top 10 arquivos com mais asserts

|   # | Arquivo                                               | Ocorrências `expect/assert/should` |
| --: | ----------------------------------------------------- | ---------------------------------: |
|   1 | `src/__tests__/nameplateAnalysis.test.js`             |                                105 |
|   2 | `src/__tests__/landingPageReact.test.jsx`             |                                101 |
|   3 | `src/__tests__/dadosPlacaInsights.test.js`            |                                 97 |
|   4 | `src/__tests__/authscreen.redesign.test.js`           |                                 85 |
|   5 | `src/__tests__/registroLegacyChecklistRender.test.js` |                                 84 |
|   6 | `src/__tests__/relatorioControlsIsland.test.jsx`      |                                 80 |
|   7 | `src/__tests__/historicoFiltersLegacyRender.test.js`  |                                 79 |
|   8 | `src/__tests__/equipamentosLegacyRender.test.js`      |                                 75 |
|   9 | `src/__tests__/router.test.js`                        |                                 68 |
|  10 | `src/__tests__/equipamentosView.hero.test.js`         |                                 67 |

### Gaps nominais de teste

| Área           | Exemplos de arquivos exportados sem teste nominal/import direto detectado                                                                                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features` | —                                                                                                                                                                                                                                                                                                                                                                |
| `src/domain`   | `src/domain/pdf/constants.js`<br>`src/domain/pdf/orcamentoPdf.js`<br>`src/domain/pdf/pmoc/constants.js`<br>`src/domain/pdf/pmoc/sections/registry.js`                                                                                                                                                                                                            |
| `src/core`     | `src/core/emailNotification.js`<br>`src/core/devWipeData.js`<br>`src/core/recoverFromStaleBundle.js`<br>`src/core/pushNotifications.js`<br>`src/core/storage/storageNormalizers.js`<br>`src/core/storage/storageRemoteSync.js`<br>`src/core/storage/constants.js`<br>`src/core/storage/storageLocalCache.js`                                                     |
| `src/ui`       | `src/ui/viewModels/equipamentosHeaderModel.js`<br>`src/ui/components/registroEquipPicker.js`<br>`src/ui/components/accountModal.js`<br>`src/ui/components/orcamentoSignaturePage.js`<br>`src/ui/components/orcamentoModal.js`<br>`src/ui/components/devPlanToggle.js`<br>`src/ui/components/offlineBanner.js`<br>`src/ui/controller/handlers/clienteHandlers.js` |

> Proxy usado para gap: exports cujo nome de arquivo não aparece em nomes/conteúdo dos testes. Pode ter falsos positivos quando o teste cobre via fluxo integrado.

## Seção 9. CI/CD e tooling

### Workflows existentes

| Arquivo                    | Nome | Trigger                                                | Jobs           |
| -------------------------- | ---- | ------------------------------------------------------ | -------------- |
| `.github/workflows/ci.yml` | CI   | push, pull_request, workflow_dispatch, contents, group | test-and-build |

### Tooling

- Pre-commit: `.husky/pre-commit` roda `npm run format`, `npm run lint` e faz `git add -A`.
- Linters/formatters: ESLint (`eslint.config.js`) e Prettier (`npm run format` / `format:check`). Não há Stylelint detectado.
- Cloudflare: não há `wrangler.toml`; workflow comenta deploy por Cloudflare Pages conectado ao repositório.
- Vite: React plugin, `manualChunks` para `vendor-sentry`, `vendor-supabase`, `vendor-pdf`, `vendor-charts`; `sourcemap: false`; env injeta versão e commit (`VITE_APP_COMMIT`/`CF_PAGES_COMMIT_SHA`).

### Gaps explícitos em PR

- PR roda `npm run check` no CI: lint, format check, Vitest e build.
- Não roda Playwright E2E no workflow principal.
- Não roda pgTAP/Supabase SQL tests no workflow principal.
- Não há gate de bundle-size, Lighthouse, axe E2E ou upload de coverage configurado.

## Seção 10. Acessibilidade

| Métrica                   | Total |
| ------------------------- | ----: |
| `<img`                    |   118 |
| `<img ... alt=`           |    13 |
| `<img>` sem `alt` (proxy) |   105 |
| Usos de `aria-*`          |  1334 |
| Usos de `role=`           |   214 |
| `focus()` / `tabindex`    |    83 |

### Foco e botões

- Há gerenciamento explícito de foco em modais/sheets via `focus()` e `tabindex`, com concentração em componentes de modal, assinatura, onboarding e auth.
- Botões sem texto interno encontrados pelo proxy:

```text
src/__tests__/registroChecklistIsland.test.jsx:      <button data-action="save-registro"></button>
src/__tests__/core/router-error-boundary.test.js:    <button id="nav-inicio" class="nav-btn"></button>
src/__tests__/core/router-error-boundary.test.js:    <button id="nav-registros" class="nav-btn"></button>
src/__tests__/registroPhotosIsland.test.jsx:      <button data-action="save-registro"></button>
src/__tests__/registroPhotosIsland.test.jsx:      <button data-action="save-and-share-registro"></button>
src/__tests__/router.test.js:    <button id="nav-inicio" class="nav-btn"></button>
src/__tests__/router.test.js:    <button id="nav-registros" class="nav-btn"></button>
src/__tests__/historicoTimelineLegacyRender.test.js:      <button id="hist-filters-trigger"></button>
src/__tests__/registroSignatureIsland.test.jsx:      <button data-action="save-registro"></button>
src/__tests__/registroSignatureIsland.test.jsx:      <button data-action="save-and-share-registro"></button>
```

> Proxy de `<img>` é textual: pode contar strings de testes/templates e não valida accessible name completo.

## Seção 11. Error handling

| Métrica   | Total |
| --------- | ----: |
| `try {`   |   331 |
| `.catch(` |    26 |

### ErrorBoundary React

```text
Nenhum componentDidCatch/ErrorBoundary detectado em src/react/ ou src/.
```

### Sentry / observability

- Sentry está em `optionalDependencies` e é inicializado de forma lazy em `src/core/observability.js` via import dinâmico quando há DSN.
- `src/app.js` inicializa observability no boot e vincula user_id do Supabase quando sessão muda.

```text
package.json:    "@sentry/browser": "^8.55.1"
src/core/telemetry.js:import { addBreadcrumb } from './observability.js';
src/core/telemetry.js:  // Emite também como breadcrumb no Sentry pra contextualizar erros.
src/core/telemetry.js:  // No-op se observability não está inicializado (DSN ausente).
src/core/errors.js:import { captureError } from './observability.js';
src/core/errors.js:    // Passa a exceção original pra Sentry pegar o stack correto,
src/core/observability.js: * observability — wrapper fino sobre @sentry/browser, gated por
src/core/observability.js: *   - Se DSN está setado: lazy-carrega @sentry/browser, inicializa,
src/core/observability.js: *   2. handleError() (errors.js) chama captureError() — vira Sentry event.
src/core/observability.js: *      no próximo Sentry event, dando contexto do que o user fez antes do
src/core/observability.js: *      SDK Sentry automaticamente, sem precisar fazer nada.
src/core/observability.js: *   npm install --save-optional @sentry/browser
src/core/observability.js: * @returns {Promise<boolean>} true se Sentry foi inicializado, false se no-op.
src/core/observability.js:      // ignora o import, o Sentry não vira chunk no dist/, e o browser
src/core/observability.js:      // tenta resolver o bare specifier '@sentry/browser' em runtime —
src/core/observability.js:      // falha silenciosa, Sentry nunca carrega. Já caímos nesse buraco.
src/core/observability.js:      // @sentry/browser está em optionalDependencies do package.json,
src/core/observability.js:      // então `npm install` em fork sem Sentry continua funcionando.
src/core/observability.js:      // Pra forks que não querem Sentry basta não setar VITE_SENTRY_DSN
src/core/observability.js:      // replay-canvas. Sem isso, o barrel '@sentry/browser' arrasta ~700 KB
src/core/observability.js:      } = await import('@sentry/browser');
src/core/observability.js:      // @sentry/browser não instalado OU init falhou. Silencioso.
src/core/observability.js:        console.warn('[observability] Sentry init falhou (silenciado):', err?.message || err);
src/core/observability.js: * Captura uma exceção e envia pro Sentry. No-op se observability não
src/core/observability.js:  getSentry: () => sentry,
src/__tests__/observability.test.js: * Tests pra camada de observability.
src/__tests__/observability.test.js: *   - Com DSN: initObservability() chama Sentry.init, captureError manda
src/__tests__/observability.test.js: *   - Nunca joga exceção mesmo com Sentry quebrado.
src/__tests__/observability.test.js: * Estratégia: vi.doMock no @sentry/browser (dep opcional, pode nem existir
src/__tests__/observability.test.js:    vi.doMock('@sentry/browser', () => sentryMock);
src/__tests__/observability.test.js:    vi.doMock('@sentry/browser', () => {
src/__tests__/observability.test.js:      throw new Error('Cannot find module @sentry/browser');
src/__tests__/observability.test.js:  const mod = await import('../core/observability.js');
src/__tests__/observability.test.js:describe('observability (sem DSN)', () => {
src/__tests__/observability.test.js:describe('observability (com DSN mas Sentry SDK ausente)', () => {
src/__tests__/observability.test.js:      dsn: 'https://fake@sentry.io/123',
src/__tests__/observability.test.js:      dsn: 'https://fake@sentry.io/123',
src/__tests__/observability.test.js:describe('observability (com DSN e Sentry SDK presente)', () => {
src/__tests__/observability.test.js:  it('initObservability() chama Sentry.init com DSN + config segura', async () => {
src/__tests__/observability.test.js:      dsn: 'https://fake@sentry.io/123',
```

### `handleError` centralizado

- Ponto central: `src/core/errors.js`, com `AppError`, `ErrorCodes`, log local e envio para observability.
- Uso recorrente em `app`, `features/userData`, views e handlers de UI.

```text
src/features/userData.js:import { AppError, ErrorCodes, handleError } from '../core/errors.js';
src/features/userData.js:    handleError(error, {
src/features/userData.js:    handleError(error, {
src/core/errors.js:export function handleError(error, options = {}) {
src/ui/views/registro.js:import { ErrorCodes, handleError } from '../../core/errors.js';
src/ui/views/registro.js:        handleError(error, {
src/ui/views/registro.js:              handleError(uploadError, {
src/ui/views/registro.js:        handleError(error, {
src/ui/views/registro.js:        handleError(error, {
src/ui/controller/handlers/profileAccountHandlers.js:import { ErrorCodes, handleError } from '../../../core/errors.js';
src/ui/controller/handlers/profileAccountHandlers.js:      handleError(error, {
src/ui/controller/handlers/profileAccountHandlers.js:      handleError(error, {
src/ui/controller/handlers/orcamentoHandlers.js:import { ErrorCodes, handleError } from '../../../core/errors.js';
src/ui/controller/handlers/orcamentoHandlers.js:    handleError(error, {
src/ui/controller/handlers/orcamentoHandlers.js:    handleError(error, {
src/ui/controller/handlers/orcamentoHandlers.js:    handleError(error, {
src/ui/controller/handlers/registroHandlers.js:import { ErrorCodes, handleError } from '../../../core/errors.js';
src/ui/controller/handlers/registroHandlers.js:      handleError(error, {
src/ui/controller/handlers/registroHandlers.js:      handleError(error, {
src/ui/controller/handlers/registroHandlers.js:      handleError(error, {
src/ui/controller/handlers/registroHandlers.js:      handleError(error, {
src/ui/views/equipamentos.js:import { ErrorCodes, handleError } from '../../core/errors.js';
src/ui/views/equipamentos.js:    handleError(error, {
src/ui/views/equipamentos.js:      handleError(error, {
src/ui/views/equipamentos.js:    handleError(error, {
src/ui/views/equipamentos.js:    handleError(error, {
src/ui/views/equipamentos.js:    handleError(error, {
src/ui/controller/handlers/reportExportHandlers.js:import { ErrorCodes, handleError } from '../../../core/errors.js';
src/ui/controller/handlers/reportExportHandlers.js:      handleError(error, {
src/ui/controller/handlers/reportExportHandlers.js:      handleError(error, {
src/ui/controller/handlers/reportExportHandlers.js:      handleError(error, {
src/ui/controller/handlers/reportExportHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:import { ErrorCodes, handleError } from '../../../core/errors.js';
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/controller/handlers/equipmentHandlers.js:      handleError(error, {
src/ui/components/clienteModal.js:    // upsertCliente já loga via handleError; só reverte UI
src/ui/views/clientes.js:import { handleError, ErrorCodes } from '../../core/errors.js';
src/ui/views/clientes.js:    handleError(error, {
src/ui/views/equipamentos/fotos.js:import { ErrorCodes, handleError } from '../../../core/errors.js';
src/ui/views/equipamentos/fotos.js:    handleError(error, {
src/ui/views/equipamentos/fotos.js:      handleError(err, {
src/app.js:import { ErrorCodes, handleError } from './core/errors.js';
src/app.js:            handleError(error, {
src/app.js:    handleError(error, {
src/app.js:  handleError(error || new Error('Erro global não tratado.'), {
src/app.js:  handleError(event?.reason || new Error('Promessa rejeitada sem tratamento.'), {
```

## Seção 12. TODOs e dívidas explícitas

### Top 30 TODOs/FIXMEs

Nenhum marcador no formato `// TODO|FIXME|XXX|HACK|@deprecated` encontrado em `src/`.

### Top 5 arquivos com mais marcadores

| Arquivo | Marcadores |
| ------- | ---------: |
| —       |          0 |

### Categorização rápida

- bug: 0
- refator: 0
- feature: 0
- dúvida: 0
- outro: 0
