-- Remove Stripe billing schema artifacts.
--
-- Billing/pricing saiu do produto e sera refeito em etapa propria. Mantemos
-- plan/plan_code/subscription_status por compatibilidade operacional, mas
-- removemos os metadados Stripe e o ledger do webhook que nao tem mais Edge
-- Function correspondente.

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if coalesce(new.plan, '') is distinct from coalesce(old.plan, '') then
    raise exception 'cannot modify plan' using errcode = '42501';
  end if;

  if coalesce(new.plan_code, '') is distinct from coalesce(old.plan_code, '') then
    raise exception 'cannot modify plan_code' using errcode = '42501';
  end if;

  if coalesce(new.subscription_status, '') is distinct from coalesce(old.subscription_status, '') then
    raise exception 'cannot modify subscription_status' using errcode = '42501';
  end if;

  if coalesce(new.is_dev, false) is distinct from coalesce(old.is_dev, false) then
    raise exception 'cannot modify is_dev' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.protect_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if coalesce(new.plan, 'free') <> 'free' then
    raise exception 'cannot create profile with non-free plan' using errcode = '42501';
  end if;

  if coalesce(new.plan_code, 'free') <> 'free' then
    raise exception 'cannot create profile with non-free plan_code' using errcode = '42501';
  end if;

  if coalesce(new.subscription_status, 'inactive') <> 'inactive' then
    raise exception 'cannot create profile with active subscription' using errcode = '42501';
  end if;

  if coalesce(new.is_dev, false) then
    raise exception 'cannot create developer profile from client' using errcode = '42501';
  end if;

  return new;
end;
$$;

alter table if exists public.profiles
  drop column if exists stripe_customer_id,
  drop column if exists stripe_subscription_id;

drop table if exists public.stripe_webhook_events;

comment on function public.protect_profile_fields() is
  'Bloqueia alteracao client-side de campos operacionais sensiveis de profile enquanto billing esta removido.';

comment on function public.protect_profile_insert() is
  'Bloqueia INSERT client-side de profile com plano nao operacional enquanto billing esta removido.';
