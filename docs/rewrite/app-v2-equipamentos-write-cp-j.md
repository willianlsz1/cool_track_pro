# app-v2 - CP-J escrita real de Equipamento com ownership de Cliente

## 1. Objetivo

Implementar o primeiro contrato de escrita real de `Equipamento` no app-v2,
mantendo o runtime do preview local/mock e fechando o risco identificado na
CP-I: `public.equipamentos.cliente_id` precisa pertencer ao mesmo `user_id` do
equipamento.

## 2. Escopo executado

Incluido:

- writer Supabase puro e injetado para `public.equipamentos`;
- adapter `AppV2DataPort` para sobrescrever somente `saveEquipment`;
- composicao opcional na factory apos clientes read/write;
- trigger SQL idempotente de ownership `equipamentos.cliente_id -> clientes`;
- teste SQL de insert/update cross-tenant;
- testes unitarios do writer, adapter e factory.

Fora de escopo:

- ativacao de runtime real no preview;
- auth real no app-v2;
- setores reais;
- storage/anexos/fotos;
- servicos, registros e orcamentos reais;
- PDF/share, WhatsApp, billing, router/deep links e PMOC real;
- mudanca de `equipamentos.id` de `text` para UUID.

## 3. Arquivos criados/alterados

- `src/app-v2/data/supabaseAppV2EquipmentsWriter.ts`
- `src/app-v2/data/supabaseAppV2EquipmentsWriter.test.ts`
- `src/app-v2/data/appV2EquipamentosWriteDataAdapter.ts`
- `src/app-v2/data/appV2EquipamentosWriteDataAdapter.test.ts`
- `src/app-v2/data/appV2DataSourceFactory.ts`
- `src/app-v2/data/appV2DataSourceFactory.test.ts`
- `supabase/migrations/20260523120000_enforce_equipamentos_cliente_ownership.sql`
- `supabase/tests/14_equipamentos_write_ownership_contract.test.sql`
- `docs/rewrite/app-v2-equipamentos-write-cp-j.md`

## 4. Contratos adotados

### Writer Supabase

`saveAppV2EquipamentoToSupabase`:

- exige `userId`;
- preserva `draft.id` como `text`, conforme schema atual;
- exige `id`, `nome` e `local` nao vazios;
- valida `clienteId` como UUID real quando informado;
- nao mapeia `setor_id` a partir de `draft.setorId`, porque setores reais
  ficam fora da CP-J;
- usa `APP_V2_EQUIPAMENTOS_SELECT` e
  `mapSupabaseEquipamentoRowToAppV2Equipamento` para retorno;
- em `insert`, grava `id`, `user_id` e campos editaveis;
- em `update`, filtra por `id` e `user_id`;
- propaga erro Supabase/RLS sem fallback local;
- exige linha retornada valida.

### Adapter

`createAppV2EquipamentosWriteDataAdapter`:

- recebe `basePort`, `userId` e `equipamentosWriter`;
- quando falta `userId` ou writer, delega `saveEquipment` para a porta base;
- quando writer real existe, salva no writer e faz upsert do equipamento
  retornado no snapshot atual;
- nao importa Supabase real, storage, billing, PDF/share ou WhatsApp.

### Factory

`createAppV2DataSource`:

- aceita `equipamentosWriter` opcional;
- compoe escrita real de equipamento somente apos sessao, reader de clientes e
  writer de clientes estarem presentes;
- nao ativa runtime real no preview por conta propria.

### Banco

`public.enforce_equipamentos_cliente_ownership`:

- permite `cliente_id` nulo;
- bloqueia `INSERT`/`UPDATE` quando `new.cliente_id` nao pertence ao mesmo
  `new.user_id`;
- usa trigger `BEFORE INSERT OR UPDATE OF cliente_id, user_id`;
- guarda execucao quando tabelas/colunas ainda nao existirem.

## 5. Validacao executada

```bash
npm test -- src/app-v2/data/supabaseAppV2EquipmentsWriter.test.ts src/app-v2/data/appV2EquipamentosWriteDataAdapter.test.ts src/app-v2/data/appV2DataSourceFactory.test.ts --run
```

Resultado: 3 arquivos de teste, 17 testes passando.

```bash
supabase migration up --local
supabase test db supabase/tests/14_equipamentos_write_ownership_contract.test.sql
```

Resultado: migration CP-J aplicada no banco local; teste SQL passando.

```bash
npx prettier --write src/app-v2/data/supabaseAppV2EquipmentsWriter.ts src/app-v2/data/supabaseAppV2EquipmentsWriter.test.ts src/app-v2/data/appV2EquipamentosWriteDataAdapter.ts src/app-v2/data/appV2EquipamentosWriteDataAdapter.test.ts src/app-v2/data/appV2DataSourceFactory.ts src/app-v2/data/appV2DataSourceFactory.test.ts supabase/migrations/20260523120000_enforce_equipamentos_cliente_ownership.sql supabase/tests/14_equipamentos_write_ownership_contract.test.sql docs/rewrite/app-v2-equipamentos-write-cp-j.md
```

Resultado: arquivos TS/MD formatados; Prettier retornou falha para `.sql`
porque nao ha parser SQL configurado no projeto.

```bash
npm run build
npm run check
git diff --check
```

Resultado: comandos passando. Permanecem apenas avisos ja conhecidos fora do
escopo da CP-J: warning ESLint em `src/domain/pdf/shareReport.js`, warnings Vite
static+dynamic e chunks grandes.

## 6. Riscos remanescentes

- A CP-J nao ativa o writer real no preview; integracao runtime precisa de etapa
  propria.
- `setor_id` real permanece fora do payload; setor local nao deve ser enviado ao
  Supabase nesta etapa.
- `equipamentos.id` continua `text`; migrar para UUID exigiria etapa dedicada
  com compatibilidade.
- A validacao SQL depende de ambiente Supabase local com Docker disponivel.

## 7. Proximo passo recomendado

Executar CP dedicada para ativacao controlada do writer real no runtime do
app-v2 somente quando houver sessao/auth e client Supabase injetado, mantendo
fallback local explicito e sem misturar setores, anexos ou storage.
