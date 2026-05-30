-- ============================================================
-- app-v2: campos de servico para round-trip fiel de RegistroServico
--
-- O modelo do app-v2 (RegistroServico) separa diagnostico, acoes
-- executadas e o rotulo custom do tipo "outro". A tabela registros so
-- tinha `obs` (texto unico), o que tornaria a persistencia lossy.
--
-- Aditivo e idempotente (ADD COLUMN IF NOT EXISTS, nullable) — seguro
-- em producao, sem impacto nas linhas existentes.
-- ============================================================

alter table public.registros
  add column if not exists diagnostico text,
  add column if not exists acoes_executadas text,
  add column if not exists tipo_descricao text;

comment on column public.registros.diagnostico is
  'app-v2: diagnostico tecnico do servico (separado de acoes_executadas).';
comment on column public.registros.acoes_executadas is
  'app-v2: acoes executadas no servico (separado de diagnostico).';
comment on column public.registros.tipo_descricao is
  'app-v2: rotulo custom quando tipo = outro.';
