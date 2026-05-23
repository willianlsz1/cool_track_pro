# app-v2 - Supabase CP-C clientes read-only

## 1. Objetivo

Criar a primeira peca de leitura Supabase do app-v2 para `clientes`, mantendo a
integracao atras de um client injetado/mocado e sem ativar runtime real no
shell.

Esta CP implementa somente mapper e reader read-only. Ela nao conecta o app-v2
ao Supabase por padrao.

## 2. Escopo

Permitido:

- criar mapper puro de linha `public.clientes` para `Cliente`;
- criar reader read-only de clientes com client Supabase injetado;
- testar mapeamento e query shape;
- manter componentes React sem import direto de Supabase.

Fora de escopo:

- usar `src/core/supabase.js`;
- conectar o reader ao `AppV2Shell`;
- escrever clientes no Supabase;
- sync bidirecional;
- cache/offline;
- migrations;
- policies/RLS novas;
- leitura de equipamentos, setores, registros, tecnicos ou orcamentos;
- storage/upload real;
- billing, PDF/share, WhatsApp, PMOC, assinatura ou router.

## 3. Arquivos criados

- `src/app-v2/data/appV2SupabaseMappers.ts`
- `src/app-v2/data/appV2SupabaseMappers.test.ts`
- `src/app-v2/data/supabaseAppV2ClientsReader.ts`
- `src/app-v2/data/supabaseAppV2ClientsReader.test.ts`

## 4. Contrato implementado

### 4.1 Mapper

`mapSupabaseClienteRowToAppV2Cliente` converte:

- `id` -> `id`
- `nome` -> `nome`
- `razao_social` -> `razaoSocial`
- `cnpj` -> `documento`
- `contato` -> `contato`
- `endereco` -> `endereco`
- `inscricao_estadual` -> `inscricaoEstadual`
- `inscricao_municipal` -> `inscricaoMunicipal`
- `url_chamados` -> `canalChamados`
- `finalidade` -> `finalidadeAmbiente`
- `observacoes` -> `observacoesInternas`

Linhas sem `id` ou `nome` sao descartadas. Campos vazios ou nulos nao entram no
objeto final.

### 4.2 Reader

`loadAppV2ClientesFromSupabase`:

- exige `userId` autenticado;
- recebe `client` injetado;
- chama `from('clientes')`;
- usa select explicito dos campos mapeados;
- filtra por `eq('user_id', userId)`;
- aplica o mapper puro;
- propaga erro de leitura com mensagem explicita.

## 5. Decisoes

- O app-v2 nao importa `src/core/supabase.js` nesta CP.
- O reader nao tem fallback para localStorage.
- O shell continua usando snapshot local por padrao.
- `Cliente.id` continua `string`, mesmo que o banco use UUID.
- `documento` fica mapeado para `cnpj` por enquanto, porque e o campo
  versionado existente no schema.

## 6. Validacao executada

Durante o CP:

```bash
npm test -- src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts --run
```

Resultado:

- 2 arquivos de teste passaram.
- 5 testes passaram.

Validacao final obrigatoria deve ser executada antes de commit:

```bash
npm test -- src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts --run
npm run format
npm run build
npm run check
git diff --check
```

## 7. Proximo CP recomendado

**CP-D - integrar leitura de clientes ao AppV2DataPort sem ativacao default**

Objetivo:

- criar um adapter composto ou factory que consiga carregar clientes reais e
  manter o restante do snapshot vindo da memoria/mock;
- manter feature desligada por padrao;
- adicionar testes de fallback quando `userId` estiver ausente ou a leitura
  falhar;
- nao criar escrita real ainda.

Fora do CP-D:

- migrations;
- RLS nova;
- escrita de clientes;
- leitura de equipamentos/registros;
- router;
- storage/upload;
- billing, PDF/share, WhatsApp, PMOC ou Orcamento real.

## 8. Riscos remanescentes

- Ainda nao existe auth/perfil real no app-v2 para fornecer `userId`.
- O reader ainda nao esta conectado ao shell.
- A leitura real ainda precisa decidir estrategia de fallback quando Supabase
  falhar.
- Campos comerciais do cliente continuam mapeados por compatibilidade com o
  schema atual, nao por contrato final de produto.
