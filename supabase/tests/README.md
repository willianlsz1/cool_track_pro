# Testes de integração — triggers de plano

Esses arquivos SQL exercitam as triggers de enforcement de plano (fotos,
setores, equipamentos, registros monthly, proteção de `profiles`). Foram
escritos pra rodar **dentro de uma transação** que termina com `ROLLBACK`,
então **não alteram dados reais** — podem rodar em staging ou prod.

## Por que não JS/Vitest?

As triggers vivem em Postgres. Testá-las via `supabase-js` exige uma
instância rodando + credenciais de service_role, e gera ruído (network
latency, rate limits). SQL direto roda em milissegundos, dá stack trace
legível e é óbvio de ler.

## Pré-requisitos

Uma dessas opções:

1. **Supabase CLI local** (recomendado):

   ```bash
   supabase start
   supabase db reset  # aplica todas as migrations
   ```

2. **psql** apontando pra staging/prod com `service_role` ou owner:

   ```bash
   psql "$DATABASE_URL" -f supabase/tests/<arquivo>.sql
   ```

## Como rodar

Os arquivos `supabase/tests/*.test.sql` sao a versao oficial para
`supabase test db` / `pg_prove`. Eles podem usar metacomandos do `psql`, como
`\echo`, para emitir plano e resultado TAP.

```bash
# Suite completa (recomendado em pre-release)
for f in supabase/tests/*.test.sql; do
  echo "▶ $f"
  psql "$DATABASE_URL" -f "$f" -v ON_ERROR_STOP=1 || exit 1
done
echo "All passed."
```

Cada arquivo usa `RAISE EXCEPTION` quando uma asserção falha. Saída `0`
significa sucesso, qualquer outro código indica falha.

### Supabase SQL Editor

O SQL Editor do Supabase nao aceita metacomandos `psql`, incluindo `\echo`.
Arquivos manuais para SQL Editor devem ficar fora de `supabase/tests/` e usar
`select 'ok - ...' as result;` no final.

O teste `09_billing_profile_usage_hardening.test.sql` possui duas versoes:

- `supabase/tests/09_billing_profile_usage_hardening.test.sql` — versao oficial
  TAP para `supabase test db` / `pg_prove`.
- `docs/security/mudanca-17-cp-b-manual-sql-editor.sql` — versao manual para
  Supabase SQL Editor, sem `\echo`.

## Padrão de teste

Cada `.test.sql` segue:

```sql
begin;

-- 1. Fixtures (usuário Free/Plus/Pro/dev)
insert into auth.users (...) values (...);
insert into profiles (id, plan, plan_code, subscription_status, is_dev)
  values (...);

-- 2. Simula uma sessão autenticada
set local role authenticated;
set local request.jwt.claims = '{"sub": "<user-uuid>"}';

-- 3. Testa caso POSITIVO: operação que deve passar
do $$
begin
  insert into public.<tabela> (...) values (...);
  -- ok
end $$;

-- 4. Testa caso NEGATIVO: operação que deve falhar com 42501
do $$
begin
  insert into public.<tabela> (...) values (...);
  raise exception 'TEST FAILED: insert deveria ter sido bloqueado';
exception when insufficient_privilege then
  raise notice '✓ bloqueio funcionou: %', sqlerrm;
end $$;

rollback;
```

## Arquivos

- `01_user_has_plus_plan.test.sql` — helper que outras triggers usam.
- `02_photo_plan_gate.test.sql` — `enforce_photo_plan_gate` em
  `equipamentos.fotos`.
- `03_setores_pro_gate.test.sql` — `enforce_setores_pro_gate` em
  `public.setores`.
- `04_equipamentos_limit.test.sql` — `enforce_equipamentos_limit` em
  `public.equipamentos`.
- `05_registros_monthly_limit.test.sql` — `enforce_registros_monthly_limit`
  em `public.registros`.
- `06_protect_profile_fields.test.sql` — `protect_profile_fields` em
  `public.profiles`.
- `07_stripe_webhook_idempotency.test.sql` — `public.stripe_webhook_events`
  ledger: PK em event_id bloqueia retries, UPDATE processed_at/error_message
  funciona.
- `09_billing_profile_usage_hardening.test.sql` — CP-B da Mudanca 17:
  bloqueio de `stripe_*` em INSERT de `profiles` e escrita direta em
  `usage_monthly`.
- `10_signature_plan_gate.test.sql` — CP-E da Mudanca 17: gate server-side de
  `registros.assinatura` e policies restritivas para o path
  `registro-fotos/{user_id}/registros/{registro_id}/assinatura.png`.
- `11_public_abuse_surfaces.test.sql` — CP-G da Mudanca 17: hardening de
  `analytics_events`, `feedback` e policies canonicas do bucket
  `registro-fotos`.

## Versoes manuais para SQL Editor

Arquivos em `docs/security/*manual-sql-editor.sql` sao versoes manuais para o
Supabase SQL Editor. Eles nao usam `\echo`, porque `\echo` e comando
psql/pg_prove. O sucesso manual deve aparecer como `select 'ok - ...' as
result;`.

- `docs/security/mudanca-17-cp-b-manual-sql-editor.sql` — versao manual do
  hardening de billing profile e `usage_monthly`.
- `docs/security/mudanca-17-cp-e-manual-sql-editor.sql` — versao manual do gate
  server-side de assinatura digital.
- `docs/security/mudanca-17-cp-g-manual-sql-editor.sql` — versao manual do
  hardening de superficies publicas anti-abuso.

## Adicionando testes

Ao criar uma nova trigger de plano:

1. Adicione um arquivo `NN_<nome>.test.sql` seguindo o padrão acima.
2. Cobrir pelo menos 4 casos: Free (bloqueia), Plus/Pro (passa), dev
   (passa), service_role (passa).
3. Usar `begin`/`rollback` pra não deixar lixo.
4. Rodar localmente antes de commitar.
