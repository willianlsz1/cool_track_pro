-- ============================================================
-- Test: app-v2 CP-G clientes RLS contract
--
-- Valida que `public.clientes` permite escrita/leitura do dono autenticado e
-- bloqueia leitura, update e insert forjados para outro user_id.
-- ============================================================

\echo '1..1'

begin;

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_other_id uuid := gen_random_uuid();
  v_cliente_id uuid;
  v_visible_count integer;
begin
  insert into auth.users (id, email, encrypted_password, created_at, updated_at)
  values
    (v_user_id, 'clientes-owner@test.local', '', now(), now()),
    (v_other_id, 'clientes-other@test.local', '', now(), now());

  delete from public.profiles where id in (v_user_id, v_other_id);

  set local session_replication_role = 'replica';

  insert into public.profiles (id, nome, plan, plan_code, subscription_status, is_dev)
  values
    (v_user_id, 'Clientes Owner', 'free', 'free', 'inactive', false),
    (v_other_id, 'Clientes Other', 'free', 'free', 'inactive', false);

  set local session_replication_role = 'origin';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into public.clientes (user_id, nome, razao_social, cnpj, contato, finalidade)
    values (v_user_id, 'Cliente proprio', 'Cliente Proprio LTDA', '12.345.678/0001-90', '(31) 98888-0000', 'Comercial')
    returning id into v_cliente_id;
  exception when others then
    raise exception 'FAIL: usuario autenticado deveria criar cliente proprio: % %', sqlstate, sqlerrm;
  end;

  select count(*) into v_visible_count from public.clientes where id = v_cliente_id;
  if v_visible_count <> 1 then
    raise exception 'FAIL: cliente proprio deveria estar visivel para o dono';
  end if;

  begin
    insert into public.clientes (user_id, nome)
    values (v_other_id, 'Cliente forjado');
    raise exception 'FAIL: insert com user_id de outro usuario deveria bloquear';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: insert forjado bloqueado';
    when others then
      raise exception 'FAIL clientes insert forged (errcode %): %', sqlstate, sqlerrm;
  end;

  begin
    update public.clientes
       set nome = 'Cliente forjado'
     where id = v_cliente_id
       and user_id = v_other_id;

    if found then
      raise exception 'FAIL: update com user_id de outro usuario nao deveria afetar linha';
    end if;
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK: update forjado bloqueado';
    when others then
      raise exception 'FAIL clientes update forged (errcode %): %', sqlstate, sqlerrm;
  end;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_other_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_visible_count from public.clientes where id = v_cliente_id;
  if v_visible_count <> 0 then
    raise exception 'FAIL: outro usuario nao deveria enxergar cliente do dono';
  end if;

  raise notice 'OK: clientes RLS contract validado';
end $$;

rollback;

\echo 'ok 1 - clientes RLS contract'
