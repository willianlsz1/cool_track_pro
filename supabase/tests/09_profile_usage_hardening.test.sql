-- ============================================================
-- Test: profile + usage_monthly hardening
--
-- Valida:
--   - UPDATE comum em nome continua permitido.
--   - service_role continua podendo atualizar campos operacionais sensiveis.
--   - Usuario autenticado nao pode inserir/alterar usage_monthly direto.
--   - RPC increment_monthly_usage continua sendo o caminho permitido.
-- ============================================================

\echo '1..1'

begin;

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_profile_count integer;
  v_usage_count integer;
  v_rpc_count integer;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values (v_user_id, 'profile-usage@test.local', '', now(), now());

  delete from public.profiles where id = v_user_id;

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  set local role authenticated;

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values (v_user_id, 'Profile Usage User', 'free', 'free', 'inactive', false);

  update public.profiles
    set nome = 'Profile Usage User Edited'
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
        subscription_status = 'active'
    where id = v_user_id;

  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
      and plan_code = 'pro'
      and subscription_status = 'active'
  ) then
    raise exception 'FAIL: service_role deveria atualizar campos operacionais sensiveis';
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

  raise notice 'OK: profile + usage_monthly hardening validado';
end $$;

rollback;

\echo 'ok 1 - profile + usage_monthly hardening'
