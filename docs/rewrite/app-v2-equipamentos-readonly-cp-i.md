# app-v2 - CP-I leitura relacional Cliente -> Equipamentos

## 1. Objetivo

Implementar a primeira leitura relacional real do app-v2 partindo de Cliente
real para Equipamentos reais, sem ativar runtime real no preview e sem iniciar
escrita relacional.

## 2. Escopo executado

Incluido:

- CP-I.1 mapeamento read-only do schema real de `public.equipamentos`;
- CP-I.2 mapper puro Supabase -> `Equipamento`;
- CP-I.3 reader read-only filtrado por `user_id` e `cliente_id`;
- teste SQL/RLS de leitura Cliente -> Equipamentos;
- CP-I.4 adapter read-only explicito por `clienteId` real.

Fora de escopo:

- escrita real de equipamento;
- ativacao no preview;
- auth real no app-v2;
- setores reais;
- storage/anexos/fotos;
- servicos, registros e orcamentos reais;
- PDF/share, WhatsApp, billing, router/deep links e PMOC real.

## 3. Arquivos criados

- `src/app-v2/data/appV2SupabaseEquipmentMappers.ts`
- `src/app-v2/data/appV2SupabaseEquipmentMappers.test.ts`
- `src/app-v2/data/supabaseAppV2EquipmentsReader.ts`
- `src/app-v2/data/supabaseAppV2EquipmentsReader.test.ts`
- `src/app-v2/data/appV2EquipamentosByClienteReadOnlyDataAdapter.ts`
- `src/app-v2/data/appV2EquipamentosByClienteReadOnlyDataAdapter.test.ts`
- `supabase/tests/13_equipamentos_cliente_read_rls_contract.test.sql`
- `docs/rewrite/app-v2-equipamentos-readonly-mapping-cp-i1.md`

## 4. Contratos adotados

### Mapper

`mapSupabaseEquipamentoRowToAppV2Equipamento`:

- descarta linha sem `id`, `nome` ou `local`;
- mapeia `cliente_id` para `clienteId`;
- mapeia `setor_id` para `setorId`, mas setor real ainda fica fora;
- mapeia `modelo` para `marcaModelo`;
- mapeia `fluido` para `fluidoRefrigerante`;
- mapeia `dados_placa.numero_serie` para `numeroSerie`;
- mapeia `dados_placa.capacidade_btu` para `capacidadeBtuh`;
- nao seleciona nem mapeia `fotos`, porque storage/anexos sao etapa propria.

### Reader

`loadAppV2EquipamentosByClienteFromSupabase`:

- exige `userId`;
- exige `clienteId` UUID real;
- consulta `public.equipamentos`;
- aplica filtros `.eq('user_id', userId)` e `.eq('cliente_id', clienteId)`;
- propaga erro Supabase/RLS sem fallback local;
- descarta linhas invalidas pelo mapper.

### Adapter

`createAppV2EquipamentosByClienteReadOnlyDataAdapter`:

- recebe `basePort`, `userId`, `clienteId` e `equipamentosReader`;
- no `loadSnapshot`, substitui somente equipamentos cujo `clienteId` bate com
  o UUID real informado;
- preserva demais equipamentos locais;
- fallback local acontece apenas se faltar `userId`, `clienteId` UUID, reader ou
  se a leitura real falhar;
- escritas continuam delegadas para a porta base.

## 5. Validacao executada durante a CP

```bash
npm test -- src/app-v2/data/appV2SupabaseEquipmentMappers.test.ts --run
npm test -- src/app-v2/data/appV2SupabaseEquipmentMappers.test.ts src/app-v2/data/supabaseAppV2EquipmentsReader.test.ts --run
npm test -- src/app-v2/data/appV2EquipamentosByClienteReadOnlyDataAdapter.test.ts src/app-v2/data/appV2SupabaseEquipmentMappers.test.ts src/app-v2/data/supabaseAppV2EquipmentsReader.test.ts --run
supabase test db supabase/tests/13_equipamentos_cliente_read_rls_contract.test.sql
```

## 6. Risco estrutural identificado

`public.equipamentos.cliente_id` referencia `public.clientes(id)`, mas a
constraint FK por si so nao garante que o cliente pertence ao mesmo `user_id` do
equipamento. Para leitura, o reader filtra por `user_id` e RLS bloqueia linhas
de outro usuario. Para escrita relacional futura, isso ainda precisa de regra
dedicada.

Antes de habilitar escrita real de equipamentos, criar uma etapa propria para:

- impedir `cliente_id` cross-tenant;
- validar trigger/check/policy em SQL;
- testar insert/update forjado;
- manter IDs locais fora do payload real.

## 7. Proximo CP recomendado

**CP-J - contrato de escrita real de Equipamento com ownership de Cliente**

Escopo recomendado:

- documentar payload minimo de create/edit real de equipamento;
- decidir se `equipamentos.id` continua `text` ou migra para UUID em etapa
  propria;
- criar teste SQL que bloqueie `cliente_id` de outro `user_id`;
- so depois criar writer injetado.
