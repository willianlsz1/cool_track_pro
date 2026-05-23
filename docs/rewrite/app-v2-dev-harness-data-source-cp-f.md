# app-v2 - CP-F ativacao controlada no dev harness

## 1. Objetivo

Permitir que o harness do app-v2 receba uma `AppV2DataPort` injetada de forma
explicita, mantendo o preview local por padrao.

Esta CP liga o carregamento inicial do shell a uma porta de dados opcional, mas
nao ativa Supabase real, auth real, escrita real ou storage real.

## 2. Escopo

Permitido:

- `AppV2Shell` carregar snapshot inicial por `dataPort` quando a prop for
  passada;
- `mountAppV2` aceitar opcoes de montagem;
- retornar handle de unmount para testes/harness;
- manter `mountAppV2(root)` com comportamento local;
- testar injecao explicita pelo shell e pelo entrypoint.

Fora de escopo:

- buscar sessao real;
- importar Supabase/core no app-v2;
- criar chave em URL/localStorage;
- ligar preview a dados reais automaticamente;
- escrita real;
- migrations/RLS;
- storage/upload;
- billing, PDF/share, WhatsApp, PMOC, Orcamento real ou router.

## 3. Arquivos alterados

- `src/app-v2/index.tsx`
- `src/app-v2/index.test.tsx`
- `src/app-v2/shell/AppV2Shell.tsx`
- `src/app-v2/shell/AppV2ShellDataPort.test.tsx`

## 4. Contrato implementado

`mountAppV2` agora aceita:

```ts
interface AppV2MountOptions {
  initialSnapshot?: AppV2MockSnapshot;
  dataPort?: AppV2DataPort;
}
```

e retorna:

```ts
interface AppV2MountHandle {
  unmount(): void;
}
```

Comportamento do shell:

- sem `dataPort`, segue usando `initialSnapshot` ou `createAppV2MockSnapshot()`;
- com `dataPort`, chama `loadSnapshot()` apos montagem;
- se a leitura passar, substitui o estado do app-v2 pelo snapshot retornado;
- se a leitura falhar, preserva a tela local;
- mutacoes do shell continuam locais nesta CP.

## 5. Decisoes

- A ativacao e apenas por injecao explicita, nao por URL ou storage.
- O preview `src/app-v2/preview.tsx` segue chamando `mountAppV2(root)` sem
  opcoes.
- Nenhum componente React importa Supabase diretamente.
- A leitura real ainda depende da CP-E factory ser conectada por etapa propria.
- Escritas reais continuam bloqueadas ate CP dedicada.

## 6. Validacao executada

Durante o CP:

```bash
npm test -- src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm test -- src/app-v2/index.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
```

Resultado:

- RED inicial no shell: `dataPort.loadSnapshot` nao era chamado.
- RED inicial no harness: `mountAppV2` ignorava opcoes.
- GREEN apos implementacao.
- 2 arquivos de teste passaram.
- 2 testes passaram.

Validacao final obrigatoria deve ser executada antes de commit:

```bash
npm test -- src/app-v2/index.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx src/app-v2/data/appV2DataSourceFactory.test.ts src/app-v2/data/appV2ClientesReadOnlyDataAdapter.test.ts src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```

## 7. Proximo CP recomendado

**CP-G - escrita real pequena com Cliente**

Objetivo:

- escolher `Cliente` como primeira entidade de escrita real;
- validar contrato contra schema/RLS existente antes de runtime;
- criar adapter de escrita pequeno e testavel;
- nao misturar equipamentos, setores, registros, orcamentos ou anexos;
- rodar validacao SQL/RLS quando ambiente permitir.

Fora do CP-G:

- router;
- upload/storage;
- billing/quotas;
- PDF/share;
- WhatsApp;
- PMOC;
- Orcamento real.

## 8. Riscos remanescentes

- O shell ainda executa mutacoes locais, mesmo quando recebe `dataPort`.
- Ainda nao existe loading/erro visual para fonte injetada.
- Ainda nao existe sessao real plugada ao preview.
- A primeira escrita real exigira validacao de RLS e ambiente Supabase/Docker.
