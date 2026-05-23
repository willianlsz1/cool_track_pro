# app-v2 - CP-G escrita real pequena de Cliente

## 1. Objetivo

Criar o primeiro contrato de escrita real do app-v2 para `Cliente`, com client
Supabase injetado, sem ativar runtime no shell e sem misturar outras entidades.

Esta CP prepara create/update de `public.clientes` e explicita a regra de ID:
create nao envia ID local porque a tabela usa `uuid`; edit exige UUID real.

## 2. Escopo

Permitido:

- criar writer de cliente com client injetado;
- mapear `SaveClientDraft` para colunas de `public.clientes`;
- deixar o banco gerar UUID em create;
- exigir UUID valido em edit;
- propagar erro de RLS/Supabase sem fallback silencioso de escrita;
- criar teste SQL de contrato RLS para `public.clientes`.

Fora de escopo:

- ativar escrita real no `AppV2Shell`;
- ligar preview a Supabase real;
- criar login/session real;
- escrever equipamentos, setores, registros, orcamentos ou anexos;
- criar migrations;
- alterar policies existentes;
- storage/upload;
- billing, PDF/share, WhatsApp, PMOC, Orcamento real ou router.

## 3. Arquivos criados

- `src/app-v2/data/supabaseAppV2ClientsWriter.ts`
- `src/app-v2/data/supabaseAppV2ClientsWriter.test.ts`
- `supabase/tests/12_clientes_rls_contract.test.sql`

## 4. Contrato implementado

`saveAppV2ClienteToSupabase` recebe:

- `client: SupabaseAppV2ClientsWriteClient`;
- `userId: string`;
- `draft: SaveClientDraft`.

Create:

- exige `userId`;
- exige `nome`;
- ignora `draft.id`;
- envia `user_id` e campos de cliente;
- deixa `public.clientes.id` ser gerado pelo banco;
- retorna `Cliente` mapeado da linha retornada.

Edit:

- exige `userId`;
- exige `nome`;
- exige `draft.id` como UUID valido;
- faz `update(...).eq('id', draft.id).eq('user_id', userId)`;
- retorna `Cliente` mapeado da linha retornada.

Erro:

- erro retornado pelo Supabase e propagado;
- resposta sem linha retornada gera erro;
- nao ha fallback para escrita local quando a intencao e escrita real.

## 5. Decisoes

- IDs mockados como `cliente-1` nao podem ser usados como PK real.
- Create real deve produzir novo UUID no banco.
- Edit real so deve operar sobre UUID persistido.
- O writer nao importa `src/core/supabase.js`.
- O writer nao e usado pelo shell nesta CP.
- A composicao com `AppV2DataPort` fica para fase posterior, depois da
  validacao SQL/RLS local ou CI.

## 6. Teste SQL RLS

Foi criado `supabase/tests/12_clientes_rls_contract.test.sql` para validar:

- usuario autenticado cria cliente proprio;
- dono enxerga cliente proprio;
- insert com `user_id` de outro usuario e bloqueado;
- update forjado nao afeta linha de outro usuario;
- outro usuario nao enxerga cliente do dono.

Execucao tentada:

```bash
supabase test db supabase/tests/12_clientes_rls_contract.test.sql
```

Resultado:

- tentativa inicial falhou porque o Postgres local nao estava ativo em
  `127.0.0.1:54322`.

Tentativa de subir ambiente:

```bash
supabase start
```

Resultado:

- tentativa inicial falhou porque o Docker Desktop/engine nao estava
  disponivel, apesar da CLI Docker existir.

Mensagem relevante:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
Docker Desktop is a prerequisite for local development.
```

Atualizacao pos-validacao:

- Docker Desktop foi iniciado localmente.
- `supabase start` concluiu com sucesso.
- `supabase test db supabase/tests/12_clientes_rls_contract.test.sql`
  passou.
- O teste validou bloqueio de insert/update forjado por RLS no contrato de
  `clientes`.

## 7. Validacao executada

Durante o CP:

```bash
npm test -- src/app-v2/data/supabaseAppV2ClientsWriter.test.ts --run
```

Resultado:

- RED inicial por modulo inexistente.
- RED intermediario por buscar `client.from('clientes')` antes de validar UUID.
- GREEN apos corrigir a ordem de validacao.
- 1 arquivo de teste passou.
- 4 testes passaram.

Validacao final obrigatoria deve ser executada antes de commit:

```bash
npm test -- src/app-v2/data/supabaseAppV2ClientsWriter.test.ts src/app-v2/index.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx src/app-v2/data/appV2DataSourceFactory.test.ts src/app-v2/data/appV2ClientesReadOnlyDataAdapter.test.ts src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```

## 8. Proximo CP recomendado

**CP-H - adapter composto de escrita de Cliente via AppV2DataPort**

Pre-condicao recomendada:

- satisfeita localmente com
  `supabase test db supabase/tests/12_clientes_rls_contract.test.sql`.

Objetivo:

- compor `saveClient` real opcional na porta de dados;
- manter fallback local somente quando modo real nao estiver habilitado;
- nao ativar no preview por padrao;
- testar create real retornando UUID e edit real exigindo UUID.

Fora do CP-H:

- outras entidades;
- router;
- upload/storage;
- billing/quotas;
- PDF/share;
- WhatsApp;
- PMOC;
- Orcamento real.

## 9. Riscos remanescentes

- A validacao SQL/RLS passou localmente, mas ainda deve ser mantida em CI quando
  houver pipeline dedicado.
- O shell ainda salva clientes localmente.
- Ainda nao ha reconciliacao entre IDs locais e UUIDs reais em fluxos existentes.
