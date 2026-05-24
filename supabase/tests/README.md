# Testes de integracao - contratos operacionais de banco

Esses arquivos SQL exercitam triggers e contratos operacionais de banco
(fotos, setores, equipamentos, registros monthly, protecao de `profiles`).
Eles rodam dentro de uma transacao que termina com `ROLLBACK`, entao nao deixam
dados reais.

## Por que nao JS/Vitest?

As triggers vivem em Postgres. Testa-las via `supabase-js` exige uma instancia
rodando e credenciais de service_role. SQL direto roda rapido, mostra stack
trace legivel e cobre o contrato real do banco.

## Pre-requisitos

Uma dessas opcoes:

1. Supabase CLI local:

   ```bash
   supabase start
   supabase db reset
   ```

2. `psql` apontando para staging/prod com `service_role` ou owner:

   ```bash
   psql "$DATABASE_URL" -f supabase/tests/<arquivo>.sql
   ```

## Como rodar

Os arquivos `supabase/tests/*.test.sql` sao a versao oficial para
`supabase test db` / `pg_prove`. Eles podem usar metacomandos do `psql`, como
`\echo`, para emitir plano e resultado TAP.

```bash
for f in supabase/tests/*.test.sql; do
  echo "$f"
  psql "$DATABASE_URL" -f "$f" -v ON_ERROR_STOP=1 || exit 1
done
echo "All passed."
```

Cada arquivo usa `RAISE EXCEPTION` quando uma assercao falha. Saida `0`
significa sucesso; qualquer outro codigo indica falha.

O billing/Stripe runtime foi removido. Testes antigos do webhook Stripe foram
apagados; docs historicos em `docs/security/` permanecem apenas como registro.

## Padrao de teste

Cada `.test.sql` segue:

```sql
begin;

-- 1. Fixtures
insert into auth.users (...) values (...);
insert into profiles (id, plan, plan_code, subscription_status, is_dev)
  values (...);

-- 2. Simula uma sessao autenticada
set local role authenticated;
set local request.jwt.claims = '{"sub": "<user-uuid>"}';

-- 3. Caso positivo: operacao que deve passar
do $$
begin
  insert into public.<tabela> (...) values (...);
end $$;

-- 4. Caso negativo: operacao que deve falhar com 42501
do $$
begin
  insert into public.<tabela> (...) values (...);
  raise exception 'TEST FAILED: insert deveria ter sido bloqueado';
exception when insufficient_privilege then
  raise notice 'OK: bloqueio funcionou: %', sqlerrm;
end $$;

rollback;
```

## Arquivos

- `01_user_has_plus_plan.test.sql` - helper que outras triggers usam.
- `02_photo_plan_gate.test.sql` - `enforce_photo_plan_gate` em
  `equipamentos.fotos`.
- `03_setores_pro_gate.test.sql` - `enforce_setores_pro_gate` em
  `public.setores`.
- `04_equipamentos_limit.test.sql` - `enforce_equipamentos_limit` em
  `public.equipamentos`.
- `05_registros_monthly_limit.test.sql` - `enforce_registros_monthly_limit` em
  `public.registros`.
- `06_protect_profile_fields.test.sql` - `protect_profile_fields` em
  `public.profiles`.
- `09_profile_usage_hardening.test.sql` - hardening de `profiles` e escrita
  direta em `usage_monthly`.
- `11_public_abuse_surfaces.test.sql` - hardening de `analytics_events`,
  `feedback` e policies canonicas do bucket `registro-fotos`.

## Versoes manuais para SQL Editor

Arquivos em `docs/security/*manual-sql-editor.sql` sao historicos. Eles nao
usam `\echo`, porque `\echo` e comando psql/pg_prove.

## Adicionando testes

1. Adicione um arquivo `NN_<nome>.test.sql` seguindo o padrao acima.
2. Cubra casos positivo e negativo, incluindo `service_role` quando relevante.
3. Use `begin`/`rollback` para nao deixar lixo.
4. Rode localmente antes de commitar.
