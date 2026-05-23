# app-v2 - Persistencia CP-A porta de dados em memoria

## 1. Objetivo

Criar a primeira fronteira de persistencia do app-v2 sem conectar Supabase,
storage real, migrations ou RLS.

Este CP implementa um contrato de porta de dados e um adapter em memoria para
preservar o comportamento local atual enquanto prepara a futura integracao real
por uma fronteira testavel.

## 2. Escopo

Permitido:

- criar `AppV2DataPort`;
- criar adapter em memoria;
- usar actions puras existentes como fonte da regra;
- preparar o shell para aceitar a porta opcional sem ativar runtime async;
- adicionar testes de contrato.

Fora de escopo:

- Supabase real;
- migrations;
- RLS;
- auth/perfil real;
- storage/upload real;
- billing, assinatura ou quotas;
- PDF/share;
- WhatsApp;
- PMOC;
- router/deep links;
- legado/v1;
- alteracao de `package.json`, Vite, ESLint ou TypeScript config.

## 3. Arquivos alterados

- `src/app-v2/data/appV2DataPort.ts`
- `src/app-v2/data/appV2DataPort.test.ts`
- `src/app-v2/data/memoryAppV2DataAdapter.ts`
- `src/app-v2/data/memoryAppV2DataAdapter.test.ts`
- `src/app-v2/shell/AppV2Shell.tsx`
- `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`
- `docs/rewrite/app-v2-persistencia-porta-dados-cp-a.md`

## 4. Decisoes

### 4.1 Porta antes de Supabase

A integracao real nao foi iniciada. O app-v2 agora tem um contrato para
persistencia planejada, mas segue usando estado local por padrao.

### 4.2 Adapter em memoria

O adapter em memoria:

- recebe snapshot inicial;
- guarda estado em memoria;
- devolve clones em `loadSnapshot`;
- chama actions puras atuais;
- nao usa Supabase, `fetch`, `localStorage`, `sessionStorage`, billing ou
  storage real.

### 4.3 Shell preparado, comportamento preservado

`AppV2Shell` recebeu `dataPort?: AppV2DataPort` apenas como prop planejada. A
prop ainda nao e ativada, para evitar trocar o modelo de execucao antes de um
CP dedicado de orquestracao async.

## 5. Operacoes cobertas pela porta

- `loadSnapshot`
- `saveEquipment`
- `saveClient`
- `saveSector`
- `deleteSector`
- `archiveEquipment`
- `unarchiveEquipment`
- `saveEquipmentAttachment`
- `scheduleCommitment`
- `startServiceFromEquipment`
- `completeService`
- `updateServiceRecord`
- `createQuoteFromServiceRecord`
- `createPreServiceQuote`
- `updateQuoteDraft`

## 6. Validacao executada

Durante o CP:

```bash
npm test -- src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run
```

Resultado:

- `appV2DataPort.test.ts`: passou.
- `memoryAppV2DataAdapter.test.ts`: passou.
- `AppV2Shell.test.tsx`: passou com 37 testes.

Validacao final obrigatoria deve ser executada antes de commit:

```bash
npm test -- src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```

## 7. Riscos remanescentes

- `dataPort` ainda nao esta ativo no shell.
- Auth/perfil real ainda nao existe no app-v2.
- Supabase/RLS real ainda nao foi mapeado contra as entidades app-v2.
- Orquestracao async de carregamento/erro/loading ainda precisa de etapa
  propria.
- SQL/RLS real pode depender de Docker/Supabase local ou CI.

## 8. Proximo CP recomendado

**CP-B - Supabase/RLS read-only schema mapping**

Objetivo:

- mapear entidades app-v2 para tabelas existentes;
- identificar lacunas de schema;
- listar policies/RLS necessarias;
- escolher primeira entidade para leitura real futura;
- nao criar migrations ainda;
- nao conectar runtime app-v2 ainda.
