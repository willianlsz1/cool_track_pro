# app-v2 - CP-D clientes read-only via AppV2DataPort

## 1. Objetivo

Integrar a leitura read-only de clientes ao contrato `AppV2DataPort` por meio de
um adapter composto, sem ativar Supabase por padrao no shell e sem introduzir
escrita real.

Esta CP transforma o reader de clientes da CP-C em uma peca plugavel na porta de
dados, mantendo fallback local seguro.

## 2. Escopo

Permitido:

- criar adapter composto para `AppV2DataPort`;
- substituir somente `clientes` no `loadSnapshot`;
- delegar todas as escritas para a porta base;
- usar `clientesReader` injetado;
- manter fallback local quando `userId`, reader ou leitura real falhar.

Fora de escopo:

- importar `src/core/supabase.js`;
- ativar o adapter no `AppV2Shell`;
- buscar sessao/auth real;
- escrever clientes no Supabase;
- ler equipamentos, setores, registros, tecnicos ou orcamentos;
- criar migrations ou policies;
- alterar billing, storage/upload, PDF/share, WhatsApp, PMOC, Orcamento real ou
  router.

## 3. Arquivos criados

- `src/app-v2/data/appV2ClientesReadOnlyDataAdapter.ts`
- `src/app-v2/data/appV2ClientesReadOnlyDataAdapter.test.ts`

## 4. Contrato implementado

`createAppV2ClientesReadOnlyDataAdapter` recebe:

- `basePort: AppV2DataPort`;
- `userId?: string | null`;
- `clientesReader?: (userId: string) => Promise<Cliente[]>`.

Comportamento:

- `loadSnapshot()` carrega o snapshot local/base;
- se `userId` e `clientesReader` existirem, tenta carregar clientes reais;
- se a leitura real passar, substitui apenas `snapshot.clientes`;
- se a leitura falhar, devolve o snapshot local/base;
- todos os metodos de escrita e mutacao delegam para `basePort`.

## 5. Decisoes

- O adapter e generico e nao conhece Supabase diretamente.
- A dependencia real fica injetada por `clientesReader`.
- Falha de leitura real nao quebra preview/local.
- O shell nao foi alterado nesta CP.
- Escrita real continua bloqueada para etapa propria.

## 6. Validacao executada

Durante o CP:

```bash
npm test -- src/app-v2/data/appV2ClientesReadOnlyDataAdapter.test.ts --run
```

Resultado:

- 1 arquivo de teste passou.
- 3 testes passaram.

Validacao final obrigatoria deve ser executada antes de commit:

```bash
npm test -- src/app-v2/data/appV2ClientesReadOnlyDataAdapter.test.ts src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```

## 7. Proximo CP recomendado

**CP-E - auth/session boundary para app-v2 read-only**

Objetivo:

- definir como o app-v2 recebe `userId` e client real sem importar auth/core nos
  componentes;
- criar uma factory de composicao que possa ser usada por entrypoint/dev harness;
- manter desligado por padrao;
- testar ausencia de sessao, erro de auth e fallback local.

Fora do CP-E:

- login UI;
- escrita real;
- migrations;
- RLS nova;
- storage/upload;
- billing, PDF/share, WhatsApp, PMOC, Orcamento real ou router.

## 8. Riscos remanescentes

- Ainda nao ha `userId` real no app-v2.
- A composicao ainda nao esta ligada ao preview.
- Falhas de leitura real hoje fazem fallback silencioso; CP-E deve decidir como
  expor erro/loading quando a leitura real for habilitada.
- Escrita continua local.
