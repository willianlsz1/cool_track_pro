-- ============================================================
-- Test: server-side gate de assinatura digital em registros
--
-- Valida lacunas do CP-E:
--   - Free nao pode inserir/atualizar public.registros.assinatura.
--   - Plus e Pro podem persistir assinatura.
--   - Free continua podendo salvar registro sem assinatura e fotos normais.
--   - service_role continua podendo operar.
--   - Storage helper/policies bloqueiam path de assinatura para Free sem
--     bloquear paths normais de fotos de registros.
-- ============================================================

\echo '1..1'

begin;

do $$
declare
  v_free_id uuid := gen_random_uuid();
  v_plus_id uuid := gen_random_uuid();
  v_pro_id uuid := gen_random_uuid();
  v_service_id uuid := gen_random_uuid();
  v_equip_free text := gen_random_uuid()::text;
  v_equip_plus text := gen_random_uuid()::text;
  v_equip_pro text := gen_random_uuid()::text;
  v_equip_service text := gen_random_uuid()::text;
  v_free_reg text := gen_random_uuid()::text;
  v_free_photo_reg text := gen_random_uuid()::text;
  v_policy_count integer;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values
    (v_free_id, 'sig-free@test.local', '', now(), now()),
    (v_plus_id, 'sig-plus@test.local', '', now(), now()),
    (v_pro_id, 'sig-pro@test.local', '', now(), now()),
    (v_service_id, 'sig-service@test.local', '', now(), now());

  delete from public.profiles where id in (v_free_id, v_plus_id, v_pro_id, v_service_id);

  set local session_replication_role = 'replica';

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values
    (v_free_id, 'Signature Free', 'free', 'free', 'inactive', false),
    (v_plus_id, 'Signature Plus', 'plus', 'plus', 'active', false),
    (v_pro_id, 'Signature Pro', 'pro', 'pro', 'active', false),
    (v_service_id, 'Signature Service', 'free', 'free', 'inactive', false);

  set local session_replication_role = 'origin';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_free_id)::text, true);
  set local role authenticated;
  insert into public.equipamentos (id, user_id, nome, tipo, local, status)
  values (v_equip_free, v_free_id, 'Eq Free Sig', 'Split', 'Sala', 'ok');

  insert into public.registros (id, user_id, equip_id, data, tipo, obs, status, assinatura)
  values (
    v_free_reg,
    v_free_id,
    v_equip_free,
    to_char(now(), 'YYYY-MM-DD'),
    'manutencao',
    'Free sem assinatura',
    'ok',
    false
  );

  insert into public.registros (id, user_id, equip_id, data, tipo, obs, status, fotos, assinatura)
  values (
    v_free_photo_reg,
    v_free_id,
    v_equip_free,
    to_char(now(), 'YYYY-MM-DD'),
    'manutencao',
    'Free com foto normal',
    'ok',
    jsonb_build_array(jsonb_build_object('path', v_free_id::text || '/registros/' || v_free_photo_reg || '/foto-1.jpg')),
    false
  );

  begin
    update public.registros
      set obs = 'Free update comum'
      where id = v_free_reg;
  exception when others then
    raise exception 'FAIL: Free deveria atualizar registro sem mexer em assinatura: % %', sqlstate, sqlerrm;
  end;

  begin
    update public.registros
      set assinatura = true
      where id = v_free_reg;
    raise exception 'FAIL: Free UPDATE em registros.assinatura deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: Free UPDATE assinatura bloqueado';
    when others then raise exception 'FAIL UPDATE assinatura Free (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.registros (id, user_id, equip_id, data, tipo, obs, status, assinatura)
    values (
      gen_random_uuid()::text,
      v_free_id,
      v_equip_free,
      to_char(now(), 'YYYY-MM-DD'),
      'manutencao',
      'Free com assinatura',
      'ok',
      true
    );
    raise exception 'FAIL: Free INSERT com registros.assinatura deveria bloquear';
  exception
    when insufficient_privilege then raise notice 'OK: Free INSERT assinatura bloqueado';
    when others then raise exception 'FAIL INSERT assinatura Free (errcode %): %', sqlstate, sqlerrm;
  end;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_plus_id)::text, true);
  set local role authenticated;
  insert into public.equipamentos (id, user_id, nome, tipo, local, status)
  values (v_equip_plus, v_plus_id, 'Eq Plus Sig', 'Split', 'Sala', 'ok');

  begin
    insert into public.registros (id, user_id, equip_id, data, tipo, obs, status, assinatura)
    values (
      gen_random_uuid()::text,
      v_plus_id,
      v_equip_plus,
      to_char(now(), 'YYYY-MM-DD'),
      'manutencao',
      'Plus com assinatura',
      'ok',
      true
    );
  exception when others then
    raise exception 'FAIL: Plus deveria salvar assinatura: % %', sqlstate, sqlerrm;
  end;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_pro_id)::text, true);
  set local role authenticated;
  insert into public.equipamentos (id, user_id, nome, tipo, local, status)
  values (v_equip_pro, v_pro_id, 'Eq Pro Sig', 'Split', 'Sala', 'ok');

  begin
    insert into public.registros (id, user_id, equip_id, data, tipo, obs, status, assinatura)
    values (
      gen_random_uuid()::text,
      v_pro_id,
      v_equip_pro,
      to_char(now(), 'YYYY-MM-DD'),
      'manutencao',
      'Pro com assinatura',
      'ok',
      true
    );
  exception when others then
    raise exception 'FAIL: Pro deveria salvar assinatura: % %', sqlstate, sqlerrm;
  end;

  reset role;
  insert into public.equipamentos (id, user_id, nome, tipo, local, status)
  values (v_equip_service, v_service_id, 'Eq Service Sig', 'Split', 'Sala', 'ok');

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_service_id, 'role', 'service_role')::text,
    true
  );
  set local role service_role;

  begin
    insert into public.registros (id, user_id, equip_id, data, tipo, obs, status, assinatura)
    values (
      gen_random_uuid()::text,
      v_service_id,
      v_equip_service,
      to_char(now(), 'YYYY-MM-DD'),
      'manutencao',
      'Service role com assinatura',
      'ok',
      true
    );
  exception when others then
    raise exception 'FAIL: service_role deveria salvar assinatura: % %', sqlstate, sqlerrm;
  end;

  reset role;

  if not public.is_registro_signature_storage_object(
    'registro-fotos',
    v_free_id::text || '/registros/' || v_free_reg || '/assinatura.png'
  ) then
    raise exception 'FAIL: helper deveria reconhecer path de assinatura';
  end if;

  if public.is_registro_signature_storage_object(
    'registro-fotos',
    v_free_id::text || '/registros/' || v_free_reg || '/foto-1.jpg'
  ) then
    raise exception 'FAIL: helper nao deveria tratar foto normal como assinatura';
  end if;

  if public.can_write_registro_signature_storage_object(
    'registro-fotos',
    v_free_id::text || '/registros/' || v_free_reg || '/assinatura.png',
    v_free_id
  ) then
    raise exception 'FAIL: Free nao deveria poder escrever assinatura no Storage';
  end if;

  if not public.can_write_registro_signature_storage_object(
    'registro-fotos',
    v_free_id::text || '/registros/' || v_free_photo_reg || '/foto-1.jpg',
    v_free_id
  ) then
    raise exception 'FAIL: Free deveria poder escrever foto normal de registro';
  end if;

  if not public.can_write_registro_signature_storage_object(
    'registro-fotos',
    v_plus_id::text || '/registros/' || v_free_reg || '/assinatura.png',
    v_plus_id
  ) then
    raise exception 'FAIL: Plus deveria poder escrever assinatura no Storage';
  end if;

  if public.can_write_registro_signature_storage_object(
    'registro-fotos',
    v_plus_id::text || '/registros/' || v_free_reg || '/assinatura.png',
    v_free_id
  ) then
    raise exception 'FAIL: helper deveria exigir ownership do primeiro segmento do path';
  end if;

  select count(*)
    into v_policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in (
      'registro_signature_require_plus_insert',
      'registro_signature_require_plus_update'
    )
    and permissive = 'RESTRICTIVE';

  if v_policy_count <> 2 then
    raise exception 'FAIL: policies restritivas de Storage esperadas=2 encontradas=%', v_policy_count;
  end if;

  raise notice 'OK: signature server-side gate validado';
end $$;

rollback;

\echo 'ok 1 - signature server-side gate'
