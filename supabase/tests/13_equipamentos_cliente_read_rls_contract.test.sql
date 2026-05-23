-- ============================================================
-- Test: app-v2 CP-I equipamentos read-only RLS contract
--
-- Valida que `public.equipamentos` e lido pelo dono autenticado e que outro
-- usuario nao enxerga equipamentos do dono, inclusive quando o filtro por
-- cliente_id real e aplicado.
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
  v_visible_count integer;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values
    (v_user_id, 'equip-owner@test.local', '', now(), now()),
    (v_other_id, 'equip-other@test.local', '', now(), now());

  delete from public.profiles where id in (v_user_id, v_other_id);

  set local session_replication_role = 'replica';

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values
    (v_user_id, 'Equip Owner', 'free', 'free', 'inactive', false),
    (v_other_id, 'Equip Other', 'free', 'free', 'inactive', false);

  set local session_replication_role = 'origin';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.clientes (user_id, nome)
  values (v_user_id, 'Cliente equipamento proprio')
  returning id into v_cliente_id;

  insert into public.equipamentos (id, user_id, cliente_id, nome, tipo, local, status)
  values (v_equip_id, v_user_id, v_cliente_id, 'Split proprio', 'Split', 'Recepcao', 'warn');

  select count(*) into v_visible_count
    from public.equipamentos
   where id = v_equip_id
     and user_id = v_user_id
     and cliente_id = v_cliente_id;

  if v_visible_count <> 1 then
    raise exception 'FAIL: dono deveria enxergar equipamento proprio filtrado por cliente_id';
  end if;

  insert into public.clientes (user_id, nome)
  values (v_user_id, 'Cliente sem equipamento')
  returning id into v_other_cliente_id;

  select count(*) into v_visible_count
    from public.equipamentos
   where user_id = v_user_id
     and cliente_id = v_other_cliente_id;

  if v_visible_count <> 0 then
    raise exception 'FAIL: filtro por outro cliente do mesmo dono nao deveria retornar equipamento';
  end if;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_other_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_visible_count
    from public.equipamentos
   where id = v_equip_id
     and cliente_id = v_cliente_id;

  if v_visible_count <> 0 then
    raise exception 'FAIL: outro usuario nao deveria enxergar equipamento do dono';
  end if;

  raise notice 'OK: equipamentos Cliente -> Equipamentos read-only RLS validado';
end $$;

rollback;

\echo 'ok 1 - equipamentos cliente read RLS contract'
