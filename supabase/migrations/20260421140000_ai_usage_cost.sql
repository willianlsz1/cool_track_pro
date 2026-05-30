-- CoolTrack Pro - Telemetria de custo por chamada de IA.
--
-- Cada analise de placa (e futuramente outros recursos de IA) consome tokens
-- no provider de IA. Sem telemetria de custo, o produto fica sem visibilidade
-- de consumo por usuario e por recurso.
--
-- Esta tabela registra 1 linha por chamada a IA (bem-sucedida ou nao), com:
--   - input_tokens / output_tokens crus (vindos da response do provider)
--   - cost_usd calculado na edge function a partir da tabela de custo do modelo
--   - model (ex: 'claude-sonnet-4-6') para futura comparacao entre modelos
--   - resource (ex: 'nameplate_analysis') para agrupar por recurso
--   - success: distingue chamadas uteis de falhas
--
-- RLS:
--   - insert so via service_role (a edge function usa service_role).
--   - select: usuario ve so as proprias linhas (util pra futuro dashboard de
--     uso pessoal). Dashboard admin global sai via service_role no servidor.

create table if not exists public.ai_usage_cost (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  resource text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  success boolean not null default true,

  constraint ai_usage_cost_resource_check
    check (resource in ('nameplate_analysis')),
  constraint ai_usage_cost_tokens_nonneg
    check (input_tokens >= 0 and output_tokens >= 0),
  constraint ai_usage_cost_cost_nonneg
    check (cost_usd >= 0)
);

create index if not exists ai_usage_cost_user_id_created_at_idx
  on public.ai_usage_cost (user_id, created_at desc);

create index if not exists ai_usage_cost_resource_created_at_idx
  on public.ai_usage_cost (resource, created_at desc);

alter table public.ai_usage_cost enable row level security;

-- Usuarios veem so o proprio historico de custo.
drop policy if exists ai_usage_cost_select_own on public.ai_usage_cost;
create policy ai_usage_cost_select_own
  on public.ai_usage_cost
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Insert vem exclusivamente do service_role (edge function). Nao criamos
-- policy para authenticated; o default (deny) e o comportamento desejado.

comment on table public.ai_usage_cost is
  'Uma linha por chamada a um provider de IA. Usada para medir consumo por usuario/recurso e detectar cauda longa de custo.';
comment on column public.ai_usage_cost.cost_usd is
  'Custo em USD calculado a partir de input_tokens/output_tokens e tabela de custo do modelo no momento da chamada.';
comment on column public.ai_usage_cost.success is
  'false quando a analise falhou mesmo tendo consumido tokens upstream.';
