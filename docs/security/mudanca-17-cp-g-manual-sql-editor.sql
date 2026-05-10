-- Mudanca 17 / CP-G - validacao manual para Supabase SQL Editor.
-- Nao usa \echo porque o SQL Editor nao aceita metacomandos psql/pg_prove.

begin;

do $$
declare
  v_anon_target_id uuid := gen_random_uuid();
  v_user_id uuid := gen_random_uuid();
  v_other_id uuid := gen_random_uuid();
  v_plus_id uuid := gen_random_uuid();
  v_policy_count integer;
  v_bucket_limit bigint;
  v_bucket_public boolean;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values
    (v_anon_target_id, 'abuse-anon-target@test.local', '', now(), now()),
    (v_user_id, 'abuse-user@test.local', '', now(), now()),
    (v_other_id, 'abuse-other@test.local', '', now(), now()),
    (v_plus_id, 'abuse-plus@test.local', '', now(), now());

  delete from public.profiles where id in (v_user_id, v_other_id, v_plus_id);

  set local session_replication_role = 'replica';

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values
    (v_user_id, 'Abuse User', 'free', 'free', 'inactive', false),
    (v_other_id, 'Abuse Other', 'free', 'free', 'inactive', false),
    (v_plus_id, 'Abuse Plus', 'plus', 'plus', 'active', false);

  set local session_replication_role = 'origin';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  set local role anon;

  begin
    insert into public.analytics_events (name, payload, session_id, user_id)
    values ('lp_view', '{}'::jsonb, 'anon-session', null);
  exception when others then
    raise exception 'FAIL: analytics anonimo legitimo deveria passar: % %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.analytics_events (name, payload, session_id, user_id)
    values ('lp_view', '{}'::jsonb, 'anon-forged-session', v_anon_target_id);
    raise exception 'FAIL: analytics anonimo com user_id forjado deveria bloquear';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: analytics anonimo com user_id forjado bloqueado';
    when others then
      raise exception 'FAIL analytics anon forged (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.feedback (user_id, user_email, rating, message)
    values (null, null, 5, 'Feedback anonimo valido');
  exception when others then
    raise exception 'FAIL: feedback anonimo legitimo deveria passar: % %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.feedback (user_id, user_email, rating, message)
    values (v_anon_target_id, 'forged@example.com', 5, 'Feedback forjado');
    raise exception 'FAIL: feedback anonimo com user_id forjado deveria bloquear';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: feedback anonimo com user_id forjado bloqueado';
    when others then
      raise exception 'FAIL feedback anon forged (errcode %): %', sqlstate, sqlerrm;
  end;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into public.analytics_events (name, payload, session_id, user_id)
    values ('login_completed', jsonb_build_object('method', 'email'), 'auth-session', v_user_id);
  exception when others then
    raise exception 'FAIL: analytics autenticado proprio deveria passar: % %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.analytics_events (name, payload, session_id, user_id)
    values ('login_completed', '{}'::jsonb, 'auth-forged-session', v_other_id);
    raise exception 'FAIL: analytics autenticado com user_id de outro usuario deveria bloquear';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: analytics auth com user_id de outro usuario bloqueado';
    when others then
      raise exception 'FAIL analytics auth forged (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.feedback (user_id, user_email, rating, message)
    values (v_user_id, 'abuse-user@test.local', 4, 'Feedback autenticado valido');
  exception when others then
    raise exception 'FAIL: feedback autenticado proprio deveria passar: % %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.feedback (user_id, user_email, rating, message)
    values (v_other_id, 'abuse-other@test.local', 4, 'Feedback autenticado forjado');
    raise exception 'FAIL: feedback autenticado com user_id de outro usuario deveria bloquear';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: feedback auth com user_id de outro usuario bloqueado';
    when others then
      raise exception 'FAIL feedback auth forged (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.analytics_events (name, payload, session_id, user_id)
    values ('bad_payload', jsonb_build_array('not-object'), 'bad-payload-session', v_user_id);
    raise exception 'FAIL: analytics payload nao-objeto deveria bloquear';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: analytics payload nao-objeto bloqueado';
    when others then
      raise exception 'FAIL analytics bad payload (errcode %): %', sqlstate, sqlerrm;
  end;

  reset role;

  select file_size_limit, public
    into v_bucket_limit, v_bucket_public
  from storage.buckets
  where id = 'registro-fotos';

  if v_bucket_limit is null or v_bucket_limit > 10485760 then
    raise exception 'FAIL: registro-fotos deveria ter file_size_limit <= 10MB, atual=%', v_bucket_limit;
  end if;

  if v_bucket_public is distinct from false then
    raise exception 'FAIL: registro-fotos deveria ser bucket privado';
  end if;

  if not public.can_write_registro_fotos_storage_object(
    'registro-fotos',
    v_user_id::text || '/registros/reg-1/foto-1.jpg',
    v_user_id
  ) then
    raise exception 'FAIL: usuario dono deveria poder escrever foto normal de registro';
  end if;

  if public.can_write_registro_fotos_storage_object(
    'registro-fotos',
    v_other_id::text || '/registros/reg-1/foto-1.jpg',
    v_user_id
  ) then
    raise exception 'FAIL: usuario nao deveria poder escrever path de outro usuario';
  end if;

  if public.can_write_registro_fotos_storage_object(
    'registro-fotos',
    v_user_id::text || '/equipamentos/equip-1/foto-1.jpg',
    v_user_id
  ) then
    raise exception 'FAIL: usuario Free nao deveria poder escrever foto de equipamento';
  end if;

  if not public.can_write_registro_fotos_storage_object(
    'registro-fotos',
    v_plus_id::text || '/equipamentos/equip-1/foto-1.jpg',
    v_plus_id
  ) then
    raise exception 'FAIL: usuario Plus deveria poder escrever foto de equipamento propria';
  end if;

  if public.can_write_registro_fotos_storage_object(
    'registro-fotos',
    v_user_id::text || '/tmp/abuso.jpg',
    v_user_id
  ) then
    raise exception 'FAIL: scope desconhecido no bucket registro-fotos deveria bloquear';
  end if;

  select count(*)
    into v_policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in (
      'registro_fotos_select_own',
      'registro_fotos_insert_own',
      'registro_fotos_update_own',
      'registro_fotos_delete_own'
    );

  if v_policy_count <> 4 then
    raise exception 'FAIL: esperadas 4 policies canonicas de registro-fotos, encontradas=%', v_policy_count;
  end if;

  raise notice 'OK: superficies publicas anti-abuso validadas';
end $$;

rollback;

select 'ok - public abuse surfaces hardening' as result;
