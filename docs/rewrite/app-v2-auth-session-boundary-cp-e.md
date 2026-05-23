# app-v2 - CP-E auth/session boundary read-only

## 1. Objetivo

Definir a fronteira de sessao para dados read-only do app-v2 sem importar auth,
Supabase ou storage real nos componentes React.

Esta CP cria uma factory de composicao que escolhe entre porta local e leitura
read-only de clientes com base em sessao e reader injetados. O runtime do
preview continua local por padrao.

## 2. Escopo

Permitido:

- criar factory de data source do app-v2;
- receber `session.userId` por parametro;
- receber `clientesReader` por injecao;
- compor `MemoryAppV2DataAdapter` com
  `createAppV2ClientesReadOnlyDataAdapter`;
- manter fallback local quando sessao ou reader nao existirem;
- manter fallback local quando a leitura real falhar;
- testar que a factory nao importa Supabase/auth/storage diretamente.

Fora de escopo:

- login UI;
- buscar sessao real;
- importar `src/core/supabase.js`;
- ativar leitura real no `preview.tsx` ou `AppV2Shell`;
- escrita real;
- migrations/RLS novas;
- storage/upload;
- billing, PDF/share, WhatsApp, PMOC, Orcamento real ou router.

## 3. Arquivos criados

- `src/app-v2/data/appV2DataSourceFactory.ts`
- `src/app-v2/data/appV2DataSourceFactory.test.ts`

## 4. Contrato implementado

`createAppV2DataSource` recebe:

- `initialSnapshot?: AppV2MockSnapshot`;
- `session?: { userId?: string | null } | null`;
- `clientesReader?: AppV2ClientesReader`.

Retorna:

- `dataPort: AppV2DataPort`;
- `mode: 'local' | 'clientes-readonly'`;
- `reason?: 'missing-session' | 'missing-clientes-reader'`.

Comportamento:

- sem sessao valida, usa porta local e `reason: 'missing-session'`;
- com sessao, mas sem reader, usa porta local e
  `reason: 'missing-clientes-reader'`;
- com sessao e reader, usa adapter composto de clientes read-only;
- erro do reader continua tratado dentro do adapter CP-D, preservando snapshot
  local.

## 5. Decisoes

- A factory nao conhece Supabase diretamente.
- A factory nao le `localStorage` ou `sessionStorage`.
- A factory nao busca auth real.
- O ponto de injecao futuro fica explicito e testavel antes de qualquer runtime
  real.
- O preview permanece local ate uma CP propria ativar o harness com sessao real
  ou mockada.

## 6. Validacao executada

Durante o CP:

```bash
npm test -- src/app-v2/data/appV2DataSourceFactory.test.ts --run
```

Resultado:

- RED inicial por modulo inexistente.
- GREEN apos implementacao.
- 1 arquivo de teste passou.
- 4 testes passaram.

Validacao final obrigatoria deve ser executada antes de commit:

```bash
npm test -- src/app-v2/data/appV2DataSourceFactory.test.ts src/app-v2/data/appV2ClientesReadOnlyDataAdapter.test.ts src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```

## 7. Proximo CP recomendado

**CP-F - ativacao controlada no dev harness**

Objetivo:

- permitir que o preview/dev harness receba uma data source factory injetada;
- manter o caminho default local;
- criar uma chave explicita de opt-in apenas para desenvolvimento;
- validar que ausencia de sessao ou falha de reader nao quebra a tela;
- nao conectar escrita real.

Fora do CP-F:

- login UI;
- migrations/RLS;
- escrita real;
- storage/upload;
- billing, PDF/share, WhatsApp, PMOC, Orcamento real ou router.

## 8. Riscos remanescentes

- Ainda nao existe fonte real de sessao no app-v2.
- Ainda nao existe client Supabase real plugado no preview.
- Loading/erro visual de leitura real ainda nao foi desenhado.
- Escrita continua local.
