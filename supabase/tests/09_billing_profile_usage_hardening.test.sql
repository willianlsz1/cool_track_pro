-- ============================================================
-- Test: billing profile + usage_monthly hardening
--
-- Valida lacunas do CP-B:
--   - INSERT autenticado em profiles nao pode semear stripe_*.
--   - UPDATE comum em nome continua permitido.
--   - service_role continua podendo atualizar billing no profile.
--   - Usuario autenticado nao pode inserir/alterar usage_monthly direto.
--   - RPC increment_monthly_usage continua sendo o caminho permitido.
-- ============================================================

begin;

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_profile_count integer;
  v_usage_count integer;
  v_rpc_count integer;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values (v_user_id, 'billing-cp-b@test.local', '', now(), now());

  -- Remove profile auto-criado para testar INSERT manual via role autenticada.
  delete from public.profiles where id = v_user_id;

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  set local role authenticated;

  begin
    insert into public.profiles (
      id,
      nome,
      plan,
      plan_code,
      subscription_status,
      is_dev,
      stripe_customer_id
    )
    values (
      v_user_id,
      'Billing User',
      'free',
      'free',
      'inactive',
      false,
      'cus_seeded_by_client'
    );
    raise exception 'FAIL: INSERT profile com stripe_customer_id deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: INSERT stripe_customer_id bloqueado';
    when others then raise exception 'FAIL INSERT stripe_customer_id (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.profiles (
      id,
      nome,
      plan,
      plan_code,
      subscription_status,
      is_dev,
      stripe_subscription_id
    )
    values (
      v_user_id,
      'Billing User',
      'free',
      'free',
      'inactive',
      false,
      'sub_seeded_by_client'
    );
    raise exception 'FAIL: INSERT profile com stripe_subscription_id deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: INSERT stripe_subscription_id bloqueado';
    when others then raise exception 'FAIL INSERT stripe_subscription_id (errcode %): %', sqlstate, sqlerrm;
  end;

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values (v_user_id, 'Billing User', 'free', 'free', 'inactive', false);

  update public.profiles
    set nome = 'Billing User Edited'
    where id = v_user_id
    returning 1 into v_profile_count;

  if coalesce(v_profile_count, 0) <> 1 then
    raise exception 'FAIL: UPDATE nome deveria afetar 1 row';
  end if;

  reset role;
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_user_id, 'role', 'service_role')::text,
    true
  );
  set local role service_role;

  update public.profiles
    set plan = 'pro',
        plan_code = 'pro',
        subscription_status = 'active',
        stripe_customer_id = 'cus_service_role',
        stripe_subscription_id = 'sub_service_role'
    where id = v_user_id;

  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
      and plan_code = 'pro'
      and subscription_status = 'active'
      and stripe_customer_id = 'cus_service_role'
      and stripe_subscription_id = 'sub_service_role'
  ) then
    raise exception 'FAIL: service_role deveria atualizar billing profile';
  end if;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  set local role authenticated;

  begin
    insert into public.usage_monthly (user_id, month_start, resource, used_count)
    values (
      v_user_id,
      date_trunc('month', timezone('utc', now()))::date,
      'pdf_export',
      0
    );
    raise exception 'FAIL: INSERT direto em usage_monthly deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: INSERT direto em usage_monthly bloqueado';
    when others then raise exception 'FAIL INSERT usage_monthly (errcode %): %', sqlstate, sqlerrm;
  end;

  select public.increment_monthly_usage(
    v_user_id,
    'pdf_export',
    date_trunc('month', timezone('utc', now()))::date,
    1
  ) into v_rpc_count;

  if v_rpc_count <> 1 then
    raise exception 'FAIL: RPC increment_monthly_usage deveria retornar 1, retornou %', v_rpc_count;
  end if;

  begin
    update public.usage_monthly
      set used_count = 0
      where user_id = v_user_id
        and resource = 'pdf_export'
      returning used_count into v_usage_count;
    raise exception 'FAIL: UPDATE direto em usage_monthly deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: UPDATE direto em usage_monthly bloqueado';
    when others then raise exception 'FAIL UPDATE usage_monthly (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    delete from public.usage_monthly
      where user_id = v_user_id
        and resource = 'pdf_export';
    raise exception 'FAIL: DELETE direto em usage_monthly deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: DELETE direto em usage_monthly bloqueado';
    when others then raise exception 'FAIL DELETE usage_monthly (errcode %): %', sqlstate, sqlerrm;
  end;

  reset role;
  select used_count into v_usage_count
  from public.usage_monthly
  where user_id = v_user_id
    and resource = 'pdf_export';

  if v_usage_count <> 1 then
    raise exception 'FAIL: usage_monthly deveria permanecer 1 apos UPDATE bloqueado, ficou %', v_usage_count;
  end if;

  raise notice 'OK: billing profile + usage_monthly hardening validado';
end $$;

rollback;

select 'ok - billing profile + usage_monthly hardening' as result;
