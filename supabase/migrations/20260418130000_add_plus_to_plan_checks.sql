-- Atualiza as CHECK constraints em profiles para aceitar o codigo 'plus'.
-- Antes so existiam 'free' e 'pro', o que impedia rotinas internas antigas de
-- gravar perfis Plus (erro 23514 violates check constraint).
--
-- Cobre tanto profiles_plan_code_check (nova, em plan_code) quanto
-- profiles_plan_check (anterior, em plan), ja que existem as duas colunas.

do $$
begin
  -- Remove constraint antiga de plan_code se existir (aceita so free/pro)
  if exists (
    select 1 from pg_constraint
    where conname = 'profiles_plan_code_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_plan_code_check;
  end if;

  -- Recria aceitando os 3 codigos
  alter table public.profiles
    add constraint profiles_plan_code_check
    check (plan_code in ('free', 'plus', 'pro'));
end $$;

do $$
begin
  -- Remove constraint anterior de plan se existir
  if exists (
    select 1 from pg_constraint
    where conname = 'profiles_plan_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_plan_check;
  end if;

  -- Recria aceitando os 3 codigos (so se a coluna plan existir)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'plan'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check
      check (plan in ('free', 'plus', 'pro'));
  end if;
end $$;
