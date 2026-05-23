-- ============================================================
-- Test: app-v2 CP-J equipamentos write ownership contract
--
-- Valida escrita de equipamento com cliente do mesmo usuario e bloqueia
-- cliente_id de outro tenant em INSERT/UPDATE.
-- ============================================================

\echo '1..1'

begin;

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_other_id uuid := gen_random_uuid();
  v_cliente_id uuid;
  v_other_cliente_id uuid;
  v_equip_id text := gen_random_uuid()::text;
  v_sem_cliente_id text := gen_random_uuid()::text;
  v_visible_count integer;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values
    (v_user_id, 'equip-write-owner@test.local', '', now(), now()),
    (v_other_id, 'equip-write-other@test.local', '', now(), now());

  delete from public.profiles where id in (v_user_id, v_other_id);

  set local session_replication_role = 'replica';

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values
    (v_user_id, 'Equip Write Owner', 'free', 'free', 'inactive', false),
    (v_other_id, 'Equip Write Other', 'free', 'free', 'inactive', false);

  set local session_replication_role = 'origin';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.clientes (user_id, nome)
  values (v_user_id, 'Cliente equipamento proprio')
  returning id into v_cliente_id;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_other_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.clientes (user_id, nome)
  values (v_other_id, 'Cliente equipamento outro usuario')
  returning id into v_other_cliente_id;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into public.equipamentos (id, user_id, cliente_id, nome, tipo, local, status)
    values (v_equip_id, v_user_id, v_cliente_id, 'Split proprio', 'Split', 'Recepcao', 'warn');
  exception when others then
    raise exception 'FAIL: dono deveria criar equipamento com cliente proprio: % %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.equipamentos (id, user_id, cliente_id, nome, tipo, local, status)
    values (gen_random_uuid()::text, v_user_id, v_other_cliente_id, 'Split forjado', 'Split', 'Recepcao', 'warn');
    raise exception 'FAIL: insert com cliente_id de outro usuario deveria bloquear';
  exception
    when check_violation then
      raise notice 'OK: insert com cliente de outro usuario bloqueado';
    when others then
      raise exception 'FAIL equipamentos insert ownership (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.equipamentos (id, user_id, nome, tipo, local, status)
    values (v_sem_cliente_id, v_user_id, 'Equipamento sem cliente', 'Outro', 'Sala', 'ok');
  exception when others then
    raise exception 'FAIL: equipamento sem cliente deveria continuar permitido: % %', sqlstate, sqlerrm;
  end;

  begin
    update public.equipamentos
       set cliente_id = v_other_cliente_id
     where id = v_equip_id
       and user_id = v_user_id;
    raise exception 'FAIL: update para cliente_id de outro usuario deveria bloquear';
  exception
    when check_violation then
      raise notice 'OK: update com cliente de outro usuario bloqueado';
    when others then
      raise exception 'FAIL equipamentos update ownership (errcode %): %', sqlstate, sqlerrm;
  end;

  select count(*) into v_visible_count
    from public.equipamentos
   where id = v_equip_id
     and user_id = v_user_id
     and cliente_id = v_cliente_id;

  if v_visible_count <> 1 then
    raise exception 'FAIL: equipamento proprio deveria continuar visivel ao dono';
  end if;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_other_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_visible_count
    from public.equipamentos
   where id = v_equip_id;

  if v_visible_count <> 0 then
    raise exception 'FAIL: outro usuario nao deveria enxergar equipamento do dono';
  end if;

  raise notice 'OK: equipamentos write ownership contract validado';
end $$;

rollback;

\echo 'ok 1 - equipamentos write ownership contract'
