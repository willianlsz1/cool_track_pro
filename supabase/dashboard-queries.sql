-- ============================================================
-- DASHBOARD SAVED QUERIES - fonte unica de verdade
-- ============================================================
-- Queries master para colar no SQL Editor do Supabase Dashboard.
-- Billing/Stripe foi removido do produto; este arquivo nao deve conter
-- consultas de assinatura, checkout, portal ou metadados Stripe.
--
-- Sugestao de queries salvas:
--   [Users] Ver perfil operacional
--   [Users] Ajuste operacional de perfil
--   [Analytics] Funil e eventos
--   [Schema] Inspecao do banco
--
-- Queries de DDL vivem em supabase/migrations/ com timestamp.
-- ============================================================


-- ============================================================
-- [Users] Ver perfil operacional
-- ============================================================

select u.email,
       p.nome,
       p.plan_code,
       p.plan,
       p.subscription_status,
       p.is_dev,
       p.created_at,
       p.updated_at
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'EMAIL_AQUI@exemplo.com';


-- ============================================================
-- [Users] Ajuste operacional de perfil
-- ============================================================
-- IMPORTANTE: `protect_profile_fields_trigger` bloqueia alteracao client-side
-- de plan/plan_code/subscription_status/is_dev. No SQL Editor do Dashboard,
-- use transacao curta com `session_replication_role = 'replica'` apenas para
-- manutencao operacional controlada.

-- -------- REDEFINIR PERFIL PARA OPERACIONAL --------
-- begin;
--   set local session_replication_role = 'replica';
--   update public.profiles
--   set plan_code = 'free',
--       plan = 'free',
--       subscription_status = 'inactive',
--       is_dev = false
--   where id = (select id from auth.users where email = 'EMAIL_AQUI@exemplo.com');
-- commit;

-- -------- LIGAR / DESLIGAR DEV --------
-- begin;
--   set local session_replication_role = 'replica';
--   update public.profiles set is_dev = true
--   where id = (select id from auth.users where email = 'EMAIL_AQUI@exemplo.com');
-- commit;
--
-- begin;
--   set local session_replication_role = 'replica';
--   update public.profiles set is_dev = false
--   where id = (select id from auth.users where email = 'EMAIL_AQUI@exemplo.com');
-- commit;


-- ============================================================
-- [Analytics] Funil e eventos
-- ============================================================

-- -------- EVENTOS ULTIMOS 7 DIAS --------
select name, count(*) as ocorrencias
from public.analytics_events
where created_at > now() - interval '7 days'
group by name
order by ocorrencias desc;

-- -------- FUNIL SEMANAL (ultimos 90 dias) --------
-- select date_trunc('week', created_at)::date as semana,
--        count(*) filter (where name = 'lp_view') as views,
--        count(*) filter (where name = 'lp_cta_click') as ctas,
--        count(*) filter (where name = 'signup_completed') as signups,
--        count(*) filter (where name = 'first_equipment_added') as ativados
-- from public.analytics_events
-- where created_at > now() - interval '90 days'
-- group by 1
-- order by 1 desc;

-- -------- EVENTOS DE 1 USUARIO (debug) --------
-- select created_at, name, payload
-- from public.analytics_events
-- where user_id = (select id from auth.users where email = 'EMAIL_AQUI@exemplo.com')
-- order by created_at desc
-- limit 100;

-- -------- TOP EVENTOS POR DIA (ultimos 30 dias) --------
-- select date(created_at) as dia, name, count(*) as n
-- from public.analytics_events
-- where created_at > now() - interval '30 days'
-- group by 1, 2
-- order by 1 desc, 3 desc;


-- ============================================================
-- [Schema] Inspecao do banco
-- ============================================================

-- -------- COLUNAS DE UMA TABELA --------
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;

-- -------- TAMANHO DAS TABELAS --------
-- select schemaname || '.' || relname as tabela,
--        pg_size_pretty(pg_total_relation_size(relid)) as tamanho,
--        n_live_tup as linhas
-- from pg_stat_user_tables
-- where schemaname = 'public'
-- order by pg_total_relation_size(relid) desc;

-- -------- TABELAS COM RLS ATIVO --------
-- select schemaname, tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;

-- -------- POLICIES DE UMA TABELA --------
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies
-- where schemaname = 'public' and tablename = 'profiles';

-- -------- CONSTRAINTS DE UMA TABELA --------
-- select conname, pg_get_constraintdef(oid)
-- from pg_constraint
-- where conrelid = 'public.profiles'::regclass;

-- -------- HISTORICO DE MIGRATIONS APLICADAS --------
-- select version, name, executed_at
-- from supabase_migrations.schema_migrations
-- order by version desc
-- limit 20;
