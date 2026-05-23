# app-v2 - Supabase/RLS CP-B mapeamento read-only

## 1. Objetivo

Mapear as entidades atuais do app-v2 contra o schema Supabase versionado e as
policies/RLS existentes, sem criar migrations, sem conectar runtime real e sem
alterar o app legado/v1.

Esta CP prepara a futura leitura real atras de `AppV2DataPort`, criada na CP-A.
Ela e intencionalmente documental/read-only.

## 2. Escopo

Permitido:

- ler migrations Supabase existentes;
- ler testes SQL existentes;
- ler tipos, mock store e porta de dados do app-v2;
- mapear equivalencias e lacunas;
- escolher primeira entidade para leitura real futura;
- definir validacoes necessarias para CP-C.

Fora de escopo:

- criar migrations;
- alterar policies/RLS;
- conectar Supabase no app-v2;
- implementar adapter Supabase;
- ativar storage/upload real;
- alterar billing/assinatura/quotas;
- alterar PDF/share, WhatsApp, PMOC ou Orcamento real;
- alterar router/deep links;
- editar legado/v1.

## 3. Fontes analisadas

App-v2:

- `src/app-v2/domain/types.ts`
- `src/app-v2/data/appV2MockData.ts`
- `src/app-v2/data/appV2DataPort.ts`
- `src/app-v2/data/memoryAppV2DataAdapter.ts`

Supabase/schema:

- `supabase/migrations/20260411000000_baseline_core_tables.sql`
- `supabase/migrations/20260425140000_baseline_core_rls.sql`
- `supabase/migrations/20260418140000_setores.sql`
- `supabase/migrations/20260420120000_setores_descricao_responsavel.sql`
- `supabase/migrations/20260426130000_setores_cliente_id.sql`
- `supabase/migrations/20260425120000_pmoc_clientes_empresa.sql`
- `supabase/migrations/20260426150000_clientes_finalidade.sql`
- `supabase/migrations/20260417000000_equipamentos_manutencao_fields.sql`
- `supabase/migrations/20260418150000_equipamentos_fotos.sql`
- `supabase/migrations/20260426120000_equipamentos_componente.sql`
- `supabase/migrations/20260425130000_pmoc_checklist_registros.sql`
- `supabase/migrations/20260426160000_orcamentos.sql`
- `supabase/migrations/20260426170000_orcamentos_assinatura_digital.sql`
- `supabase/tests/README.md`
- `supabase/tests/*.test.sql`

Legado usado apenas como referencia de schema atual, sem reutilizar runtime:

- `src/core/storage/storageNormalizers.js`
- `src/core/storage/storageRemoteSync.js`

## 4. Estado confirmado do schema

### 4.1 Tabelas diretamente relevantes

| Entidade app-v2       | Tabela existente      | RLS/policies existentes              | Observacao                                                              |
| --------------------- | --------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `Cliente`             | `public.clientes`     | owner-scoped `auth.uid() = user_id`  | Existe com campos comerciais/PMOC e `finalidade`.                       |
| `SetorEquipamento`    | `public.setores`      | owner-scoped + gate Pro para escrita | Existe com `cliente_id`, `descricao`, `responsavel`.                    |
| `Equipamento`         | `public.equipamentos` | owner-scoped + gates por plano       | Existe com cliente, setor, criticidade, fotos e campos extras.          |
| `RegistroServico`     | `public.registros`    | owner-scoped + gates por plano       | Existe, mas contrato app-v2 diverge nos nomes e granularidade.          |
| `tecnicos`            | `public.tecnicos`     | owner-scoped                         | Existe como lista por `user_id,nome`.                                   |
| `Orcamento`           | `public.orcamentos`   | owner-scoped                         | Existe, mas e um modulo comercial real; app-v2 segue local/mock.        |
| `CompromissoServico`  | Nenhuma tabela direta | N/A                                  | Hoje e derivado/local no app-v2; precisa decisao antes de persistir.    |
| `EquipmentAttachment` | `equipamentos.fotos`  | gates Plus+/storage policies         | App-v2 usa `anexos` placeholder; schema real usa `fotos` JSONB/storage. |

### 4.2 RLS e gates relevantes

Padrao base:

- `equipamentos`, `registros`, `tecnicos`, `clientes`, `setores` e
  `orcamentos` usam ownership por `user_id`.
- Select/insert/update/delete usam `auth.uid() = user_id`.

Gates ja versionados:

- `equipamentos.fotos`: Plus+/Pro para foto real.
- `setores`: Pro para escrita.
- `equipamentos`: limite de plano.
- `registros`: limite mensal de plano.
- `registros.assinatura`: Plus+/Pro.
- `usage_monthly`: escrita direta bloqueada; RPC e server-side sao caminho
  correto.
- `registro-fotos`: bucket privado com policies canonicas e helpers de
  ownership.

Implicacao para app-v2:

- CP-C pode ler dados reais owner-scoped.
- Escrita real nao deve entrar antes de desenho dedicado de quotas/gates.
- Foto/anexo real, assinatura, PDF/share e billing continuam bloqueados para
  etapas proprias.

## 5. Mapeamento de campos

### 5.1 Cliente

| app-v2 `Cliente`      | Supabase `clientes`   | Status     |
| --------------------- | --------------------- | ---------- |
| `id`                  | `id`                  | direto     |
| `nome`                | `nome`                | direto     |
| `razaoSocial`         | `razao_social`        | direto     |
| `documento`           | `cnpj`                | divergente |
| `contato`             | `contato`             | direto     |
| `endereco`            | `endereco`            | direto     |
| `inscricaoEstadual`   | `inscricao_estadual`  | direto     |
| `inscricaoMunicipal`  | `inscricao_municipal` | direto     |
| `canalChamados`       | `url_chamados`        | divergente |
| `finalidadeAmbiente`  | `finalidade`          | divergente |
| `observacoesInternas` | `observacoes`         | divergente |

Lacuna:

- O app-v2 escolheu nomes mais explicitos que o schema legado. CP-C precisa de
  mapper proprio do app-v2, sem importar `storageNormalizers.js`.

### 5.2 Setor

| app-v2 `SetorEquipamento` | Supabase `setores` | Status |
| ------------------------- | ------------------ | ------ |
| `id`                      | `id`               | direto |
| `nome`                    | `nome`             | direto |
| `clienteId`               | `cliente_id`       | direto |
| `cor`                     | `cor`              | direto |
| `descricao`               | `descricao`        | direto |
| `responsavel`             | `responsavel`      | direto |

Risco:

- Escrita de setores tem gate Pro. Leitura read-only e aceitavel como primeira
  prova, mas qualquer escrita real deve validar plano server-side.

### 5.3 Equipamento

| app-v2 `Equipamento`              | Supabase `equipamentos`           | Status             |
| --------------------------------- | --------------------------------- | ------------------ |
| `id`                              | `id`                              | direto             |
| `nome`                            | `nome`                            | direto             |
| `local`                           | `local`                           | direto             |
| `status`                          | `status`                          | direto             |
| `clienteId`                       | `cliente_id`                      | direto             |
| `setorId`                         | `setor_id`                        | direto             |
| `tag`                             | `tag`                             | direto             |
| `tipo`                            | `tipo`                            | direto             |
| `componente`                      | `componente`                      | direto             |
| `criticidade`                     | `criticidade`                     | direto             |
| `prioridadeOperacional`           | `prioridade_operacional`          | direto             |
| `periodicidadePreventivaDias`     | `periodicidade_preventiva_dias`   | direto             |
| `anexos`                          | `fotos`                           | nao direto         |
| `createdAt`                       | `created_at`                      | direto parcial     |
| `archivedAt`                      | sem coluna direta                 | lacuna             |
| `marcaModelo` / `numeroSerie` etc | `modelo`, `fluido`, `dados_placa` | precisa normalizar |

Lacunas:

- `archivedAt` nao tem coluna direta no schema atual. App-v2 tem arquivamento
  local; antes de escrita real, precisa decidir se usa `status`, nova coluna ou
  tabela de eventos.
- `anexos` do app-v2 sao placeholder. Supabase real usa `fotos` JSONB com
  storage. CP-C deve ignorar upload/storage e mapear somente referencias
  existentes, se houver.
- Campos tecnicos de placa precisam contrato proprio para evitar repetir
  fallback legado.

### 5.4 RegistroServico

| app-v2 `RegistroServico` | Supabase `registros`  | Status              |
| ------------------------ | --------------------- | ------------------- |
| `id`                     | `id`                  | direto              |
| `equipamentoId`          | `equip_id`            | direto divergente   |
| `data`                   | `data`                | direto              |
| `tipo`                   | `tipo`                | direto              |
| `tipoDescricao`          | sem coluna direta     | lacuna              |
| `status`                 | `status`              | direto              |
| `tecnico`                | `tecnico`             | direto              |
| `diagnostico`            | sem coluna direta     | lacuna              |
| `acoesExecutadas`        | sem coluna direta     | lacuna              |
| `observacoes`            | `obs`                 | parcial             |
| `pecas`                  | `pecas`               | direto              |
| `custoPecas`             | `custo_pecas`         | tipo diverge        |
| `custoMaoObra`           | `custo_mao_obra`      | tipo diverge        |
| `proximaData`            | `proxima`             | direto divergente   |
| PMOC checklist           | `checklist`           | fora do app-v2 real |
| assinatura/fotos         | `assinatura`, `fotos` | fora de escopo      |

Lacuna:

- O app-v2 separa diagnostico e acoes executadas. O schema legado concentra
  historicamente em `obs`. Escrita real de registros nao deve comecar antes de
  decidir se adiciona colunas, usa JSONB de detalhes ou mantem concatenacao.

### 5.5 Orcamento

| app-v2 `Orcamento`     | Supabase `orcamentos`               | Status            |
| ---------------------- | ----------------------------------- | ----------------- |
| `id`                   | `id`                                | tipo diverge      |
| `numero`               | `numero`                            | direto            |
| `status`               | `status`                            | direto parcial    |
| `clienteId`            | `cliente_id`                        | direto opcional   |
| `equipamentoId`        | `equipamento_id`                    | direto opcional   |
| `registroId`           | `registro_id`                       | direto opcional   |
| `titulo`               | `titulo`                            | direto            |
| `descricao`            | `descricao`                         | direto            |
| `total`                | `total`                             | direto            |
| `desconto`             | `desconto`                          | direto            |
| `validadeDias`         | `validade_dias`                     | direto divergente |
| `formaPagamento`       | `forma_pagamento`                   | direto divergente |
| `observacoes`          | `observacoes`                       | direto            |
| `itens`                | `itens`                             | shape diverge     |
| assinatura/share token | varias colunas publicas/tokenizadas | fora de escopo    |

Risco:

- Orcamento real ja envolve assinatura publica, status comercial, token e
  futura conversao. Nao e bom primeiro alvo de leitura/escrita do app-v2.

### 5.6 CompromissoServico

O app-v2 possui `CompromissoServico` como entidade operacional propria:

- `id`
- `equipamentoId`
- `tipo`
- `status`
- `dataAlvo`
- `prioridade`
- `origem`

Nao ha tabela direta no schema atual. Parte do conceito aparece em
`registros.proxima` e em regras de preventiva, mas nao cobre fila operacional
com status `agendado`, `em_andamento`, `concluido`, `cancelado`.

Conclusao:

- Nao escolher compromissos como primeira entidade real.
- Antes de persistir compromissos, criar etapa dedicada de schema/eventos.

## 6. Entidade escolhida para CP-C

Primeira entidade recomendada para leitura real futura: **Clientes**.

Motivos:

- tabela existe;
- RLS owner-scoped simples;
- nao depende de storage, PDF, WhatsApp, billing ou PMOC real para leitura;
- nao aciona gates de plano na leitura;
- o app-v2 ja trata Cliente como dominio proprio;
- leitura de clientes permite validar auth/user_id e mapper sem mexer em
  fluxos criticos de servico.

Nao escolher agora:

- `setores`: leitura e simples, mas escrita tem gate Pro e depende de cliente.
- `equipamentos`: mais valor, mas tem fotos, plano, limite, archivedAt ausente
  e mais campos divergentes.
- `registros`: alto valor, mas schema diverge de diagnostico/acoes e envolve
  limites mensais, assinatura e fotos.
- `orcamentos`: envolve ciclo comercial, token publico e assinatura.
- `compromissos`: nao tem tabela.

## 7. Plano CP-C recomendado

Objetivo:

Criar adapter Supabase read-only para `clientes` atras de contrato isolado, sem
ativar por padrao no app-v2.

Escopo sugerido:

1. Criar mapper puro `appV2SupabaseMappers.ts` para `Cliente`.
2. Criar teste de mapper:
   - `cnpj` -> `documento`;
   - `url_chamados` -> `canalChamados`;
   - `finalidade` -> `finalidadeAmbiente`;
   - `observacoes` -> `observacoesInternas`;
   - strings nulas viram `undefined` ou string vazia conforme contrato
     escolhido.
3. Criar interface/factory de cliente read-only, sem importar `supabase`
   diretamente nos componentes React.
4. Usar mock de client Supabase em teste; nao usar rede real.
5. Nao ligar o adapter ao shell por padrao.
6. Documentar que Supabase real precisa de `userId` autenticado e que ausencia
   de sessao deve cair para snapshot local.

Arquivos provaveis:

- `src/app-v2/data/appV2SupabaseMappers.ts`
- `src/app-v2/data/appV2SupabaseMappers.test.ts`
- `src/app-v2/data/supabaseAppV2ClientsReader.ts`
- `src/app-v2/data/supabaseAppV2ClientsReader.test.ts`
- `docs/rewrite/app-v2-supabase-clientes-readonly-cp-c.md`

Fora do CP-C:

- escrita de clientes;
- sync bidirecional;
- conflict resolution;
- migrations;
- policies novas;
- leitura de equipamentos/registros;
- ativacao runtime no shell.

## 8. Validacao esperada para CP-C

Obrigatoria:

```bash
npm test -- src/app-v2/data/appV2SupabaseMappers.test.ts src/app-v2/data/supabaseAppV2ClientsReader.test.ts --run
npm test -- src/app-v2/data/appV2DataPort.test.ts src/app-v2/data/memoryAppV2DataAdapter.test.ts --run
npm run format
npm run build
npm run check
git diff --check
```

Quando houver etapa SQL/RLS real:

```bash
supabase test db
```

Observacao:

- `supabase test db` pode depender de Docker/Supabase local. Se o ambiente nao
  estiver disponivel, registrar a limitacao e usar os testes SQL existentes
  como criterio de planejamento, nao como validacao executada.

## 9. Decisoes desta CP

- A primeira leitura real futura deve ser `clientes`.
- O app-v2 nao deve importar normalizadores legados.
- O app-v2 deve ter mappers proprios, pequenos e testados.
- Nenhum componente React deve importar Supabase.
- `AppV2DataPort` continua sendo a fronteira de runtime.
- Escrita real so deve iniciar depois de leitura read-only validada.

## 10. Riscos remanescentes

- `Cliente.id` no app-v2 e string; Supabase usa `uuid`. CP-C deve aceitar string
  e nao assumir ids mockados como UUIDs.
- `documento` no app-v2 e mais generico que `cnpj` no schema.
- `CompromissoServico` ainda nao tem tabela.
- `RegistroServico` precisa decisao de schema para `diagnostico` e
  `acoesExecutadas`.
- `Equipamento.archivedAt` ainda nao tem persistencia direta.
- Orcamento real permanece sensivel por token publico e assinatura.
