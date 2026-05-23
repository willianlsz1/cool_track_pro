# app-v2 - Mapa de areas sensiveis, prioridade e plano de execucao

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mapear as areas sensiveis do app-v2, priorizar a ordem de refatoracao
para nao repetir erros do v1 e escolher a primeira area para execucao segura.

**Architecture:** O app-v2 deve continuar isolado do legado e do storage real
ate existir contrato de adaptadores. A primeira area escolhida nao conecta
Supabase nem persiste dados; ela cria a porta de persistencia e testes de
contrato que permitirao integrar dados reais em CP posterior.

**Tech Stack:** React, TypeScript, Tailwind `tw-`, Vitest, Vite, Supabase/RLS em
etapa propria futura.

---

## 1. Escopo desta etapa

Esta etapa e documental/read-only sobre runtime.

Permitido:

- mapear areas sensiveis;
- priorizar por dependencia, risco e valor operacional;
- escolher a primeira area para iniciar;
- criar plano de implementacao para `/goal`;
- listar arquivos provaveis e validacoes.

Nao permitido nesta etapa:

- alterar `src/`;
- conectar Supabase;
- criar migrations;
- alterar RLS;
- editar `package.json`, Vite, ESLint ou TypeScript config;
- implementar PDF/share, WhatsApp, billing, assinatura, PMOC, upload ou router;
- importar UI/CSS legado no app-v2.

## 2. Estado atual confirmado

O app-v2 esta em `src/app-v2/` e usa:

- `AppV2Shell` como orquestrador local;
- snapshot mockado em `appV2MockStore`;
- actions puras em `appV2Actions`;
- seletores em `appV2Selectors`;
- view models por area;
- navegacao interna por estado React, nao por URL;
- relatorio local imprimivel com `window.print()`;
- orcamentos locais/mock;
- anexos placeholder/local.

Busca em `src/app-v2` confirmou:

- sem `supabase`;
- sem `fetch`;
- sem `localStorage` ou `sessionStorage`;
- sem router real;
- sem billing real;
- sem WhatsApp real;
- sem PMOC real;
- sem upload/storage real.

Os termos sensiveis que aparecem no app-v2 hoje sao intencionais:

- testes garantindo ausencia de PMOC/PDF/WhatsApp/storage real;
- textos de contato de cliente, como "WhatsApp";
- botao futuro/desabilitado de PDF;
- `window.print()` para preview local imprimivel.

## 3. Principio para nao repetir erros do v1

O erro a evitar nao e "ter areas sensiveis". O erro e deixar areas sensiveis
nascerem acopladas a UI, storage, billing, permissao, PDF/share e estado global
ao mesmo tempo.

Regra para o app-v2:

1. contrato primeiro;
2. adaptador depois;
3. teste de contrato antes de UI;
4. RLS/storage/billing em CP isolado;
5. UI consome porta abstrata, nunca Supabase direto;
6. nenhuma area sensivel entra junto com redesign.

## 4. Mapa das areas sensiveis

| Area sensivel               | Estado atual no app-v2                   | Risco se fizer cedo demais                        | Dependencias principais                    | Prioridade  |
| --------------------------- | ---------------------------------------- | ------------------------------------------------- | ------------------------------------------ | ----------- |
| Persistencia/Supabase/RLS   | ausente; dados mockados                  | acoplar UI ao banco e repetir storage espalhado   | contrato de entidades, auth, RLS, testes   | P0          |
| Auth/perfil real            | ausente no app-v2                        | misturar perfil real com Conta local              | Supabase, cache, logout, permissoes        | P1          |
| Router/deep links           | triado; mantido local                    | contratos publicos prematuros e back quebrado     | ids persistidos, fallback, historico       | P1          |
| Billing/assinatura/quotas   | ausente no runtime app-v2                | paywall client-side e quota burlavel              | auth, Supabase, Stripe, usage server-side  | P2          |
| Upload/storage de anexos    | placeholder local com bloqueio de URL    | upload direto sem ownership/gate                  | auth, storage policies, quota, antivirus   | P2          |
| PDF/share/WhatsApp          | apenas print local; sem share real       | quota localStorage, popup bloqueado, XSS/link     | registro persistido, billing, storage      | P3          |
| Orcamento real              | rascunho local/mock                      | proposta sem ciclo, envio ou assinatura confiavel | persistencia, cliente, billing, PDF/share  | P3          |
| PMOC real                   | ausente; backlog                         | modulo regulatorio acoplado ao fluxo comum        | cliente/equipamento, PDF, billing, storage | P4          |
| Security hardening continuo | Mudanca 17 encerrada; backlog controlado | misturar hardening com feature                    | evidencias, testes focados, CI/Supabase    | transversal |
| Bundle/PDF/vendor warnings  | conhecido fora do app-v2                 | mexer em chunks/PDF junto com feature             | analise de grafo, build, CP dedicado       | transversal |

## 5. Ordem recomendada

### P0 - Persistencia/Supabase/RLS por contrato

Primeira area a atacar.

Motivo:

- todas as outras areas reais dependem de dados persistidos e permissao;
- o app-v2 hoje tem actions puras e store mockada, que sao bons pontos de
  costura;
- conectar Supabase direto agora repetiria o v1: UI decidindo storage;
- um adaptador de persistencia cria fronteira testavel para as proximas etapas.

Resultado esperado do primeiro CP:

- contrato de porta de dados do app-v2;
- mapeamento de entidades persistiveis;
- testes de contrato com adapter em memoria;
- nenhum Supabase real ainda;
- nenhum schema/migration ainda.

### P1 - Auth/perfil real e router

Depois da porta de dados, separar:

- Auth/perfil real: define usuario atual, tenant, escopo de leitura/escrita e
  limpeza de cache.
- Router: so entra quando houver IDs persistidos e fallback claro.

Nao executar os dois no mesmo CP.

### P2 - Billing/assinatura/quotas e upload/storage

Entram depois de auth/perfil e porta de dados.

Billing/assinatura/quotas devem ser server-side. Upload/storage deve ter
ownership e gate no banco/storage, nao apenas UI.

### P3 - PDF/share/WhatsApp e Orcamento real

Entram depois de persistencia e billing basico.

PDF/share/WhatsApp precisa de:

- registro persistido;
- quota server-side quando comercial;
- sanitizacao de links/textos;
- fallback sem queimar quota indevidamente.

Orcamento real precisa de:

- ciclo persistido;
- proposta vinculada a cliente/equipamento/registro;
- estados comerciais;
- assinatura/envio/PDF em etapa propria.

### P4 - PMOC real

PMOC deve continuar separado.

So deve iniciar depois de:

- cliente/equipamento persistidos;
- relatorios/PDF seguros;
- billing/assinatura resolvidos;
- contrato regulatorio documentado.

## 6. Area escolhida para comecar

Area escolhida: **Persistencia/Supabase/RLS por contrato**, com primeiro CP
limitado a **porta de persistencia app-v2 em memoria**.

Por que esta area:

- e pre-requisito para quase todas as outras;
- reduz risco antes de mexer em Supabase/RLS;
- preserva a fundacao app-v2 atual;
- permite TDD sem ambiente externo;
- impede que componentes React importem Supabase diretamente;
- cria um ponto unico para futura integracao real.

O primeiro CP nao deve criar migrations nem conectar Supabase.

Status CP-A:

- iniciado em `docs/rewrite/app-v2-persistencia-porta-dados-cp-a.md`;
- criado contrato `AppV2DataPort`;
- criado adapter em memoria;
- `AppV2Shell` preparado com prop opcional `dataPort`;
- Supabase/RLS real continua fora do escopo.

Status CP-B:

- documentado em
  `docs/rewrite/app-v2-supabase-rls-readonly-mapping-cp-b.md`;
- mapeadas entidades app-v2 contra tabelas Supabase existentes;
- confirmado que a primeira leitura real futura deve ser `clientes`;
- identificadas lacunas antes de escrita real: `CompromissoServico` sem tabela,
  `RegistroServico` divergente em diagnostico/acoes, `Equipamento.archivedAt`
  sem coluna direta e `Orcamento` ainda sensivel por token/assinatura;
- nenhuma migration, policy ou conexao runtime foi criada nesta CP.

Status CP-C:

- documentado em
  `docs/rewrite/app-v2-supabase-clientes-readonly-cp-c.md`;
- criado mapper puro de `public.clientes` para `Cliente`;
- criado reader read-only de clientes com client injetado/mocado;
- nenhum componente React importa Supabase;
- shell continua usando snapshot local por padrao;
- sem escrita real, migrations, RLS nova, storage, billing, PDF/share,
  WhatsApp, PMOC, Orcamento real ou router.

Status CP-D:

- documentado em
  `docs/rewrite/app-v2-clientes-readonly-data-port-cp-d.md`;
- criado adapter composto `createAppV2ClientesReadOnlyDataAdapter`;
- `loadSnapshot` pode substituir somente `clientes` quando recebe `userId` e
  reader explicitos;
- falha de leitura real, ausencia de userId ou ausencia de reader mantem o
  snapshot local;
- escritas continuam delegadas para a porta base;
- shell continua sem ativacao real.

Status CP-E:

- documentado em `docs/rewrite/app-v2-auth-session-boundary-cp-e.md`;
- criada factory `createAppV2DataSource`;
- a factory recebe `session.userId` e `clientesReader` por injecao;
- sem sessao ou sem reader, a factory usa porta local com motivo explicito;
- com sessao e reader, compoe leitura read-only de clientes via `AppV2DataPort`;
- a factory nao importa Supabase, auth, `localStorage` ou `sessionStorage`;
- preview e shell continuam sem ativacao real por padrao.

Status CP-F:

- documentado em `docs/rewrite/app-v2-dev-harness-data-source-cp-f.md`;
- `AppV2Shell` carrega snapshot por `dataPort` apenas quando a prop e injetada;
- falha de `dataPort.loadSnapshot()` preserva a tela local;
- `mountAppV2` aceita opcoes de montagem e retorna handle de `unmount`;
- `preview.tsx` segue chamando `mountAppV2(root)` sem dados reais;
- mutacoes continuam locais; escrita real fica para CP propria.

Status CP-G:

- documentado em `docs/rewrite/app-v2-clientes-real-write-cp-g.md`;
- criado writer `saveAppV2ClienteToSupabase`;
- create real de cliente nao envia ID local e deixa o banco gerar UUID;
- edit real exige UUID valido;
- erros de Supabase/RLS sao propagados, sem fallback silencioso para escrita;
- criado teste SQL `supabase/tests/12_clientes_rls_contract.test.sql`;
- `supabase test db supabase/tests/12_clientes_rls_contract.test.sql` passou
  localmente apos iniciar Docker Desktop e `supabase start`.

Status CP-H:

- documentado em `docs/rewrite/app-v2-clientes-write-data-port-cp-h.md`;
- criado adapter `createAppV2ClientesWriteDataAdapter`;
- `saveClient` real e opcional e exige `userId` + writer injetado;
- erro real de Supabase/RLS e propagado, sem fallback silencioso;
- `createAppV2DataSource` ganhou modo `clientes-readwrite`;
- escrita real so ativa quando tambem ha reader real, evitando leitura local
  apos gravacao real;
- `preview.tsx` segue local por padrao.

Status CP-I:

- documentado em `docs/rewrite/app-v2-equipamentos-readonly-cp-i.md`;
- criada leitura relacional minima Cliente -> Equipamentos;
- criada composicao read-only explicita por `clienteId`;
- validado que a leitura real de equipamentos exige `userId`, `clienteId` e
  reader injetado;
- preview segue local por padrao.

Status CP-I1:

- documentado em
  `docs/rewrite/app-v2-equipamentos-readonly-mapping-cp-i1.md`;
- mapeamento de equipamentos reais separado do reader;
- entradas invalidas sao descartadas antes de chegar ao app-v2;
- nenhum componente React importa Supabase.

Status CP-J:

- documentado em `docs/rewrite/app-v2-equipamentos-write-cp-j.md`;
- criado writer real opcional de Equipamento com client injetado;
- create/edit propagam erro real sem fallback silencioso;
- escrita real exige `userId`, `id`, `nome`, `local` e `clienteId` valido;
- `createAppV2DataSource` pode compor escrita real de equipamentos sem ativar
  runtime default.

Status CP-K:

- documentado em `docs/rewrite/app-v2-data-port-shell-writes-cp-k.md`;
- `AppV2Shell` passou a rotear `saveClient` e `saveEquipment` pela
  `AppV2DataPort` quando injetada;
- fallback local sem `dataPort` foi preservado;
- erros de porta mantem formulario aberto e mostram mensagem amigavel.

Status CP-L:

- documentado em `docs/rewrite/app-v2-data-port-archive-cp-l.md`;
- arquivar/desarquivar equipamento usa `dataPort` quando injetada;
- confirmacoes permanecem abertas em erro;
- nenhum storage real, upload ou router foi ativado.

Status CP-M:

- documentado em `docs/rewrite/app-v2-data-port-schedule-cp-m.md`;
- agendamento de preventiva usa `dataPort.scheduleCommitment` quando injetada;
- validacao local de data continua antes da escrita;
- falhas preservam o modal e exibem erro.

Status CP-N:

- documentado em `docs/rewrite/app-v2-data-port-attachment-cp-n.md`;
- foto placeholder/local usa `dataPort.saveEquipmentAttachment` quando injetada;
- upload/storage real continua fora do escopo;
- falhas nao adicionam anexo local indevido.

Status CP-O:

- documentado em `docs/rewrite/app-v2-data-port-sectors-cp-o.md`;
- salvar/remover setor usa `dataPort` quando injetada;
- equipamentos associados ao setor removido permanecem preservados;
- erros mantem painel/confirmacao abertos.

Status CP-P:

- documentado em `docs/rewrite/app-v2-data-port-quotes-cp-p.md`;
- salvar rascunho e criar orcamento pre-servico usam `dataPort` quando
  injetada;
- rascunhos continuam locais/mock sem PDF, billing ou envio real;
- falhas preservam editor/painel aberto com erro.

Status CP-Q:

- documentado em `docs/rewrite/app-v2-data-port-service-completion-cp-q.md`;
- iniciar, concluir e editar registros de servico usam `dataPort` quando
  injetada;
- `ServiceFlow` trata conclusao async sem navegar em erro;
- fallback local permanece usando actions puras.

Status CP-R:

- documentado em
  `docs/rewrite/app-v2-data-port-post-service-quote-cp-r.md`;
- gerar orcamento pos-diagnostico conclui/atualiza o registro via `dataPort`
  antes de criar o orcamento;
- erro na criacao do orcamento preserva a tela concluida e evita duplicar a
  conclusao em nova acao;
- PDF/share, WhatsApp, billing, router e storage real continuam fora.

Status CP-T:

- documentado em `docs/rewrite/app-v2-auth-profile-real-cp-t.md`;
- criado contrato `AppV2SessionReader` para ler usuario autenticado por injecao;
- criado bridge `createAuthenticatedAppV2DataSource` para compor sessao real com
  a `createAppV2DataSource` existente;
- ausencia de usuario, `id` vazio ou erro de auth retornam data source local com
  `reason: 'missing-session'`;
- preview default continua local com `mountAppV2(root)`;
- `AppV2Shell`, `index.tsx`, `preview.tsx` e bridge autenticado permanecem sem
  imports diretos de Supabase/auth/storage;
- router, storage real amplo, PDF/share, WhatsApp, billing, upload e PMOC
  continuam fora.

Status CP-U:

- documentado em
  `docs/rewrite/app-v2-authenticated-harness-opt-in-cp-u.md`;
- criado helper `mountAuthenticatedAppV2` para montagem autenticada opt-in;
- o helper resolve `createAuthenticatedAppV2DataSource` por injecao e passa
  somente `dataPort` para `mountAppV2`;
- o retorno expoe `dataSource` para diagnostico de harness sem acoplar o shell;
- `preview.tsx` continua local com `mountAppV2(root)` e tem guarda contra
  import do helper autenticado;
- helper, preview e shell seguem sem imports diretos de Supabase/auth/storage;
- router, storage real amplo, PDF/share, WhatsApp, billing, upload e PMOC
  continuam fora.

Status CP-V:

- documentado em
  `docs/rewrite/app-v2-authenticated-entrypoint-cp-v.md`;
- criado adapter `createSupabaseAppV2SessionReader` para transformar
  `auth.getUser()` em `AppV2SessionReader`;
- criada factory `createAuthenticatedAppV2BrowserOptions` para compor
  `sessionReader`, `clientesReader`, `clientesWriter` e `equipamentosWriter`
  por client Supabase injetado;
- criado entrypoint opt-in separado
  `src/app-v2/authenticated-preview.html` -> `authenticatedPreview.tsx`;
- URL local esperada:
  `http://localhost:5173/src/app-v2/authenticated-preview.html`;
- `preview.tsx` continua local com `mountAppV2(root)`;
- `AppV2Shell`, preview default e telas seguem sem imports diretos de
  Supabase/auth/storage;
- router, RLS/migrations, storage real amplo, PDF/share, WhatsApp, billing,
  upload e PMOC continuam fora.

Status CP-W:

- documentado em
  `docs/rewrite/app-v2-authenticated-harness-browser-audit-cp-w.md`;
- auditou no browser local o entrypoint autenticado opt-in
  `http://localhost:5173/src/app-v2/authenticated-preview.html`;
- confirmou carregamento da UI `Hoje`, navegacao principal e ausencia de erros
  de console no authenticated preview;
- confirmou que o preview default
  `http://localhost:5173/src/app-v2/preview.html` continua carregando sem erros
  de console;
- nao alterou runtime, shell, telas, router, RLS/migrations, storage amplo,
  PDF/share, WhatsApp, billing, upload, PMOC, v1 ou configs;
- nao validou sessao Supabase real porque isso exige sessao/credenciais locais
  ativas; fallback sem sessao segue coberto pelos testes do harness/data source.

Status CP-X:

- documentado em
  `docs/rewrite/app-v2-primary-cloudflare-readiness-cp-x.md`;
- mapeou que `index.html` ainda usa `/src/app.js`, portanto a producao segue no
  v1/legado;
- classificou `preview.html` e `authenticated-preview.html` como entrypoints de
  preview/harness, nao como bootstrap de producao;
- definiu gates para promover o app-v2 como principal: sessao Supabase real,
  matriz final de corte v1 -> v2, bootstrap app-v2 de producao, troca controlada
  do `index.html`, smoke local e Cloudflare Pages preview;
- manteve runtime, router, storage amplo, PDF/share, WhatsApp, billing, upload,
  PMOC, v1 e configs sem alteracao.

Status CP-Z:

- documentado em `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`;
- criou matriz de corte por fluxo para promover o app-v2 como entrada principal;
- confirmou que a troca do `index.html` continua bloqueada ate existir
  bootstrap de producao app-v2, sessao Supabase real validada, fluxo real minimo
  validado, router/deep links definidos, Cloudflare Pages preview validado e
  rollback documentado;
- definiu primeiro corte operacional minimo e separou PDF/share, WhatsApp,
  billing, upload/storage real, PMOC, assinatura digital real e orcamento real
  como fora do primeiro corte somente se aprovados explicitamente;
- manteve runtime, `index.html`, router, storage amplo, PDF/share, WhatsApp,
  billing, upload, PMOC, v1 e configs sem alteracao.

Status CP-AA:

- documentado em `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`;
- criou `src/app-v2/main.tsx` como bootstrap de producao app-v2 para root futuro
  `app-v2-root`;
- criou `src/app-v2/main.test.tsx` cobrindo montagem quando o root existe,
  ausencia de montagem quando o root nao existe e separacao dos previews/v1;
- manteve `index.html` apontando para `/src/app.js`;
- manteve preview local, authenticated preview, router, storage amplo,
  PDF/share, WhatsApp, billing, upload, PMOC, v1 e configs sem alteracao.

Status CP-AB:

- documentado em `docs/rewrite/app-v2-primary-cutover-cp-ab.md`;
- trocou `index.html` para montar `app-v2-root`;
- trocou o script principal para `/src/app-v2/main.tsx`;
- removeu CSS global legado do entrypoint principal para nao contaminar o
  app-v2;
- documentou rollback para voltar `index.html` ao root `app` e `/src/app.js`;
- manteve router, storage amplo, Supabase/RLS, PDF/share, WhatsApp, billing,
  upload, PMOC, v1 e configs sem alteracao.

## 7. Contrato de arquitetura proposto

Camadas planejadas no app-v2:

```text
UI React
  -> AppV2Shell
    -> useAppV2DataSource ou orquestrador equivalente
      -> AppV2DataPort
        -> MemoryAppV2DataAdapter agora
        -> SupabaseAppV2DataAdapter futuro
```

Regra:

- UI e view models nao conhecem Supabase;
- actions puras continuam em `appV2Actions`;
- adapter aplica actions e devolve snapshot;
- Supabase futuro implementa a mesma porta;
- testes de shell podem continuar usando memoria.

## 8. Entidades do primeiro contrato

Entidades que o contrato precisa cobrir inicialmente:

- `Cliente`;
- `SetorEquipamento`;
- `Equipamento`;
- `CompromissoServico`;
- `RegistroServico`;
- `Orcamento`;
- `tecnicos`;
- `today` como contexto local/mock.

Operacoes minimas:

- carregar snapshot inicial;
- salvar equipamento;
- salvar cliente;
- salvar setor;
- arquivar/desarquivar equipamento;
- salvar anexo placeholder;
- agendar compromisso;
- iniciar/concluir/editar registro via actions puras;
- criar/editar orcamento local via actions puras.

Operacoes explicitamente fora do primeiro CP:

- login;
- usuario atual real;
- sync remoto;
- conflito offline;
- Supabase real;
- migrations/RLS;
- upload real;
- PDF/share/WhatsApp;
- billing/assinatura;
- PMOC.

## 9. Plano de implementacao para `/goal`

Use este objetivo:

```text
/goal criar a primeira porta de persistencia do app-v2 conforme docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md, usando adapter em memoria e testes de contrato, sem conectar Supabase, sem migrations, sem storage real, sem router, sem billing, sem PDF/share, sem WhatsApp, sem PMOC e sem alterar legado/v1.
```

### Task 1: Contrato da porta de dados

**Files:**

- Create: `src/app-v2/data/appV2DataPort.ts`
- Test: `src/app-v2/data/appV2DataPort.test.ts`

- [ ] **Step 1: Criar teste de shape do contrato**

Criar `src/app-v2/data/appV2DataPort.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import type { AppV2DataPort } from './appV2DataPort';

describe('AppV2DataPort', () => {
  it('documenta as operacoes minimas de persistencia planejada', () => {
    const requiredMethods: Array<keyof AppV2DataPort> = [
      'loadSnapshot',
      'saveEquipment',
      'saveClient',
      'saveSector',
      'archiveEquipment',
      'unarchiveEquipment',
      'saveEquipmentAttachment',
      'scheduleCommitment',
      'completeService',
      'updateServiceRecord',
      'createQuoteFromServiceRecord',
      'createPreServiceQuote',
      'updateQuoteDraft',
    ];

    expect(requiredMethods).toHaveLength(13);
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
npm test -- src/app-v2/data/appV2DataPort.test.ts --run
```

Expected: falha porque `appV2DataPort.ts` ainda nao existe.

- [ ] **Step 3: Criar contrato**

Criar `src/app-v2/data/appV2DataPort.ts`:

```ts
import type { SaveClientDraft } from '../equipment/clientActions';
import type { SaveEquipmentDraft, SaveEquipmentSectorDraft } from '../equipment/equipmentActions';
import type {
  CompleteServiceInput,
  CreatePreServiceQuoteDraftInput,
  CreateQuoteFromServiceRecordInput,
  ScheduleNextCommitmentInput,
  UpdateQuoteDraftInput,
} from './appV2Actions';
import type { AppV2MockSnapshot } from './appV2MockStore';

export interface AppV2DataPort {
  loadSnapshot(): Promise<AppV2MockSnapshot>;
  saveEquipment(draft: SaveEquipmentDraft): Promise<AppV2MockSnapshot>;
  saveClient(draft: SaveClientDraft): Promise<AppV2MockSnapshot>;
  saveSector(draft: SaveEquipmentSectorDraft): Promise<AppV2MockSnapshot>;
  archiveEquipment(equipmentId: string, today: string): Promise<AppV2MockSnapshot>;
  unarchiveEquipment(equipmentId: string): Promise<AppV2MockSnapshot>;
  saveEquipmentAttachment(
    equipmentId: string,
    attachment: Parameters<
      typeof import('../equipment/equipmentActions').saveEquipmentAttachment
    >[2],
  ): Promise<AppV2MockSnapshot>;
  scheduleCommitment(input: ScheduleNextCommitmentInput): Promise<AppV2MockSnapshot>;
  completeService(input: CompleteServiceInput): Promise<AppV2MockSnapshot>;
  updateServiceRecord(input: CompleteServiceInput): Promise<AppV2MockSnapshot>;
  createQuoteFromServiceRecord(
    input: CreateQuoteFromServiceRecordInput,
  ): Promise<AppV2MockSnapshot>;
  createPreServiceQuote(input: CreatePreServiceQuoteDraftInput): Promise<AppV2MockSnapshot>;
  updateQuoteDraft(input: UpdateQuoteDraftInput): Promise<AppV2MockSnapshot>;
}
```

- [ ] **Step 4: Rodar teste**

Run:

```bash
npm test -- src/app-v2/data/appV2DataPort.test.ts --run
```

Expected: passa.

### Task 2: Adapter em memoria

**Files:**

- Create: `src/app-v2/data/memoryAppV2DataAdapter.ts`
- Test: `src/app-v2/data/memoryAppV2DataAdapter.test.ts`

- [ ] **Step 1: Criar testes de contrato do adapter**

Criar `src/app-v2/data/memoryAppV2DataAdapter.test.ts` cobrindo:

- `loadSnapshot` devolve clone, nao referencia mutavel;
- `saveEquipment` preserva comportamento de `saveEquipment`;
- `createPreServiceQuote` cria Orcamento local;
- adapter nao contem termos `supabase`, `localStorage`, `fetch` ou `billing`.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
npm test -- src/app-v2/data/memoryAppV2DataAdapter.test.ts --run
```

Expected: falha porque adapter ainda nao existe.

- [ ] **Step 3: Implementar adapter minimo**

Criar `src/app-v2/data/memoryAppV2DataAdapter.ts` com classe/factory que:

- recebe snapshot inicial;
- guarda estado em memoria;
- chama actions puras existentes;
- clona retorno em `loadSnapshot`;
- nunca usa storage real.

- [ ] **Step 4: Rodar testes**

Run:

```bash
npm test -- src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts --run
```

Expected: passa.

### Task 3: Preparar shell sem trocar runtime ainda

**Files:**

- Modify: `src/app-v2/shell/AppV2Shell.tsx`
- Test: `src/app-v2/shell/AppV2Shell.test.tsx`

- [ ] **Step 1: Adicionar prop opcional planejada**

Adicionar prop opcional sem mudar comportamento default:

```ts
interface AppV2ShellProps {
  initialSnapshot?: AppV2MockSnapshot;
  dataPort?: AppV2DataPort;
}
```

Regra:

- se `dataPort` nao existir, comportamento atual permanece igual;
- nao ativar carregamento async neste CP se isso aumentar risco;
- testes existentes devem continuar passando.

- [ ] **Step 2: Testar que shell default continua local**

Run:

```bash
npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run
```

Expected: passa sem alterar expectativa visual/fluxo.

### Task 4: Documentar CP e limites

**Files:**

- Create: `docs/rewrite/app-v2-persistencia-porta-dados-cp-a.md`
- Modify: `docs/rewrite/app-v2-areas-sensiveis-mapa-prioridade-plano.md`

- [ ] **Step 1: Criar relatorio do CP**

O relatorio deve registrar:

- objetivo;
- arquivos alterados;
- contrato criado;
- adapter em memoria;
- o que ficou fora;
- validacoes executadas;
- proximo CP recomendado: Supabase/RLS read-only schema mapping.

- [ ] **Step 2: Atualizar este documento**

Marcar P0 como iniciado/concluido conforme resultado.

### Task 5: Validacao final

- [ ] **Step 1: Rodar testes focados**

Run:

```bash
npm test -- src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
```

Expected: passa.

- [ ] **Step 2: Rodar validacao obrigatoria**

Run:

```bash
npm run format
npm run build
npm run check
git diff --check
```

Expected:

- comandos passam;
- warnings Vite conhecidos podem permanecer;
- warning conhecido em `src/domain/pdf/shareReport.js` pode permanecer;
- nenhum novo uso de Supabase/storage real no app-v2.

- [ ] **Step 3: Commit sugerido**

```bash
git add src/app-v2/data src/app-v2/shell docs/rewrite
git commit -m "feat(app-v2): add data port contract"
```

## 10. Proximo CP depois do primeiro

Depois do adapter em memoria:

1. **CP-B Supabase/RLS read-only mapping**
   - concluido documentalmente em
     `docs/rewrite/app-v2-supabase-rls-readonly-mapping-cp-b.md`;
   - nao criou migrations;
   - nao conectou runtime app-v2.

2. **CP-C Supabase clientes read-only**
   - concluido em
     `docs/rewrite/app-v2-supabase-clientes-readonly-cp-c.md`;
   - criou mapper e reader read-only com testes;
   - nao ativou runtime no shell.

3. **CP-D integrar leitura de clientes ao AppV2DataPort sem ativacao default**
   - concluido em
     `docs/rewrite/app-v2-clientes-readonly-data-port-cp-d.md`;
   - criou adapter composto e fallback local testado;
   - nao ativou runtime no shell.

4. **CP-E auth/session boundary para app-v2 read-only**
   - concluido em `docs/rewrite/app-v2-auth-session-boundary-cp-e.md`;
   - criou factory de composicao para data source app-v2;
   - manteve leitura real desligada por padrao;
   - testou ausencia de sessao, ausencia de reader e fallback local.

5. **CP-F ativacao controlada no dev harness**
   - concluido em `docs/rewrite/app-v2-dev-harness-data-source-cp-f.md`;
   - permitiu injecao explicita de `dataPort`;
   - manteve preview default local;
   - validou shell e mount com testes focados.

6. **CP-G escrita real pequena**
   - concluido em `docs/rewrite/app-v2-clientes-real-write-cp-g.md`;
   - criou writer injetado de Cliente com regra UUID;
   - criou teste SQL RLS;
   - validou SQL/RLS localmente com Supabase ativo.

7. **CP-H adapter composto de escrita de Cliente via AppV2DataPort**
   - concluido em `docs/rewrite/app-v2-clientes-write-data-port-cp-h.md`;
   - compos `saveClient` real opcional;
   - manteve preview default local;
   - adicionou modo `clientes-readwrite`;
   - testou create real com UUID retornado e erro real propagado.

8. **CP-I reconciliacao de IDs e leitura relacional minima**
   - concluido em `docs/rewrite/app-v2-equipamentos-readonly-cp-i.md`;
   - area escolhida: Cliente -> Equipamentos;
   - criou mapper, reader e adapter read-only explicito;
   - validou RLS de leitura por owner e `cliente_id`;
   - manteve preview local.

9. **CP-J contrato de escrita real de Equipamento**
   - concluido em `docs/rewrite/app-v2-equipamentos-write-cp-j.md`;
   - criou writer real opcional com client injetado;
   - manteve preview local;
   - propagou erro real sem fallback silencioso.

10. **CP-K shell writes via AppV2DataPort**
    - concluido em `docs/rewrite/app-v2-data-port-shell-writes-cp-k.md`;
    - roteou criacao/edicao de clientes e equipamentos pelo data port quando
      injetado.

11. **CP-L a CP-R completar mutacoes locais do shell via data port**
    - CP-L archive/unarchive;
    - CP-M agendamento;
    - CP-N anexos placeholder;
    - CP-O setores;
    - CP-P orcamentos locais;
    - CP-Q ciclo de servico;
    - CP-R orcamento pos-diagnostico.

12. **Proximo checkpoint recomendado**
    - consolidar tipos/helpers de resultado async fora de dominios especificos,
      se a duplicacao entre equipamentos, clientes e servicos continuar
      crescendo;
    - ou iniciar novo plano dedicado para uma area real seguinte: auth/perfil
      real ou leitura/escrita adicional persistida, sem misturar router,
      PDF/share, billing ou upload.

## 11. Riscos remanescentes

- `supabase test db` depende de Docker ativo no ambiente local; na CP-G, a
  validacao passou apos iniciar Docker Desktop e Supabase local.
- O contrato de `Orcamento` local pode precisar evoluir antes de orcamento real.
- Auth/perfil real ainda nao existe no app-v2; adapter real precisara de usuario
  atual.
- Reconciliacao completa de IDs locais para IDs reais ainda nao cobre todas as
  entidades do app-v2.
- Escrita real completa de equipamento ainda depende de validacoes/policies
  permanentes no ambiente Supabase final.
- Router/deep link continua bloqueado ate IDs persistidos e fallback serem
  definidos.
- PDF/share/WhatsApp e billing continuam fora ate haver persistencia e quota
  server-side.

## 12. Criterio de aceite do primeiro CP

O primeiro CP sera aceito se:

- app-v2 continuar funcionando com snapshot local;
- nenhum componente React importar Supabase;
- existir `AppV2DataPort`;
- existir adapter em memoria testado;
- actions puras atuais continuarem a fonte de regra;
- testes focados e `npm run check` passarem;
- documento do CP registrar que Supabase/RLS real continua fora.
