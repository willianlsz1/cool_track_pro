-- ============================================================
-- Test: protect_profile_fields + protect_profile_insert em public.profiles
--
-- Valida que:
--   UPDATE:
--     - User autenticado muda nome -> passa
--     - User autenticado muda plan_code -> bloqueia
--     - User autenticado muda plan -> bloqueia
--     - User autenticado muda subscription_status -> bloqueia
--     - User autenticado muda is_dev -> bloqueia
--
--   INSERT:
--     - User autenticado insere profile operacional -> passa
--     - User autenticado insere com plan_code='pro' -> bloqueia
--     - User autenticado insere com is_dev=true -> bloqueia
--     - User autenticado insere com subscription_status='active' -> bloqueia
-- ============================================================

\echo '1..1'

begin;

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_insert_user_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values (v_user_id, 'pp@test.local', '', now(), now());

  update public.profiles
    set plan = 'free',
        plan_code = 'free',
        subscription_status = 'inactive',
        is_dev = false,
        nome = 'Orig Name'
    where id = v_user_id;

  insert into public.profiles (id, plan, plan_code, subscription_status, is_dev, nome)
  values (v_user_id, 'free', 'free', 'inactive', false, 'Orig Name')
  on conflict (id) do nothing;

  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  set local role authenticated;

  begin
    update public.profiles set nome = 'New Name' where id = v_user_id;
    raise notice 'OK: UPDATE nome passou';
  exception when others then
    raise exception 'FAIL caso 1 (UPDATE nome deveria passar): % %', sqlstate, sqlerrm;
  end;

  begin
    update public.profiles set plan_code = 'pro' where id = v_user_id;
    raise exception 'FAIL caso 2: UPDATE plan_code deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: UPDATE plan_code bloqueado';
    when others then raise exception 'FAIL caso 2 (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    update public.profiles set plan = 'pro' where id = v_user_id;
    raise exception 'FAIL caso 3: UPDATE plan deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: UPDATE plan bloqueado';
    when others then raise exception 'FAIL caso 3 (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    update public.profiles set subscription_status = 'active' where id = v_user_id;
    raise exception 'FAIL caso 4: UPDATE subscription_status deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: UPDATE subscription_status bloqueado';
    when others then raise exception 'FAIL caso 4 (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    update public.profiles set is_dev = true where id = v_user_id;
    raise exception 'FAIL caso 5: UPDATE is_dev deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: UPDATE is_dev bloqueado';
    when others then raise exception 'FAIL caso 5 (errcode %): %', sqlstate, sqlerrm;
  end;

  reset role;
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values (v_insert_user_id, 'ppi@test.local', '', now(), now());
  delete from public.profiles where id = v_insert_user_id;

  perform set_config('request.jwt.claims', json_build_object('sub', v_insert_user_id)::text, true);
  set local role authenticated;

  begin
    insert into public.profiles (id, plan, plan_code, subscription_status, is_dev)
    values (v_insert_user_id, 'free', 'free', 'inactive', false);
    raise notice 'OK: INSERT profile operacional passou';
  exception when others then
    raise exception 'FAIL caso 6 (INSERT operacional deveria passar): % %', sqlstate, sqlerrm;
  end;

  reset role;
  delete from public.profiles where id = v_insert_user_id;
  perform set_config('request.jwt.claims', json_build_object('sub', v_insert_user_id)::text, true);
  set local role authenticated;

  begin
    insert into public.profiles (id, plan, plan_code, subscription_status, is_dev)
    values (v_insert_user_id, 'free', 'pro', 'inactive', false);
    raise exception 'FAIL caso 7: INSERT plan_code=pro deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: INSERT plan_code=pro bloqueado';
    when others then raise exception 'FAIL caso 7 (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.profiles (id, plan, plan_code, subscription_status, is_dev)
    values (v_insert_user_id, 'free', 'free', 'inactive', true);
    raise exception 'FAIL caso 8: INSERT is_dev=true deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: INSERT is_dev=true bloqueado';
    when others then raise exception 'FAIL caso 8 (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.profiles (id, plan, plan_code, subscription_status, is_dev)
    values (v_insert_user_id, 'free', 'free', 'active', false);
    raise exception 'FAIL caso 9: INSERT subscription_status=active deveria ter sido bloqueado';
  exception
    when insufficient_privilege then raise notice 'OK: INSERT subscription_status=active bloqueado';
    when others then raise exception 'FAIL caso 9 (errcode %): %', sqlstate, sqlerrm;
  end;

  raise notice 'OK: protect_profile_fields + protect_profile_insert: 9/9 casos passaram';
end $$;

rollback;

\echo 'ok 1 - protect_profile_fields + protect_profile_insert'
