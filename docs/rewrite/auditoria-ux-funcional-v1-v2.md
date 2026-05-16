# Auditoria de UX funcional v1 -> app-v2

Data: 2026-05-16

## Estado analisado

- Branch: `codex/rewrite-zero-react-parallel`
- HEAD analisado: `0ae6fd10df8ac7aa77d5b5be7e7dd3b456cef0b4`
- `git status --short` antes da auditoria: sem saida; working tree limpo.
- `git log --oneline -5` antes da auditoria:
  - `0ae6fd1 Add equipment editing and first-item service onboarding`
  - `de08316 Document app-v2 services search and quotes parity`
  - `e43e798 Implement service edit and parity checkpoints`
  - `4c93c00 Implement service record edit checkpoint`
  - `7577d80 Implement mock service record editing in app-v2`
- Base considerada: HEAD atual. Como o working tree estava limpo no inicio, a analise nao separa alteracoes locais preexistentes.

## Escopo

Incluido como UX funcional:

- fluxo de uso;
- campos;
- validacoes;
- edicao;
- historico;
- relatorio local;
- reabertura;
- estados vazios;
- mensagens;
- acoes mockadas.

Excluido da porcentagem principal:

- PDF/share real;
- WhatsApp real;
- storage real;
- Supabase/RLS;
- billing;
- assinatura;
- PMOC;
- design final;
- CSS legado.

## Metodo de peso

Pesos aplicados:

- `coberto` = 1
- `coberto por substituição v2` = 1
- `parcial` = 0.5
- `pendente UI mínima` = 0.25
- `pendente mock/action` = 0.25
- `não encontrado no v2` = 0

Itens marcados como `pendente integração sensível`, `bloqueado por design final` ou `removido conscientemente` foram documentados, mas nao entraram na porcentagem principal quando pertencem as exclusoes do escopo.

## Percentuais estimados

1. Registro de Servico: **97%** de cobertura funcional util.
   - Calculo: 18,5 / 19 itens funcionais nao sensiveis.
   - O fluxo principal esta coberto: iniciar por equipamento ou escolha, preencher tipo, tecnico, diagnostico, acoes, pecas, custos, proxima manutencao, status final, revisar, concluir, atualizar historico, reabrir relatorio e editar registro.
   - Lacuna principal: acoes pos-salvamento ainda sao parcialmente substituidas por relatorio local e sugestoes, sem criacao mockada de orcamento a partir do fechamento.

2. Cobertura geral dos fluxos v1 ja mapeados: **74%**.
   - Calculo: 28,0 / 38 itens ponderados principais.
   - O app-v2 cobre bem o caminho equipamento -> registro -> relatorio local -> historico recente.
   - A cobertura cai em historico avancado, filtros dedicados, configuracoes, orcamentos editaveis e partes de clientes/equipamentos que no v1 dependiam de filtros, storage ou modulo proprio.

## Matriz de paridade funcional

| Funcionalidade v1                                      | Equivalente no v2                                                                                  | Status                       | Evidencia no codigo/teste                                                                                      | O que falta                                                                      | Proximo checkpoint recomendado                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| Iniciar registro a partir de equipamento               | `startServiceFromEquipment` e CTA no detalhe/Home                                                  | coberto                      | `src/app-v2/data/appV2Actions.ts`; `src/app-v2/data/appV2Flow.test.ts`; `src/app-v2/shell/AppV2Shell.test.tsx` | Nada relevante no escopo mockado                                                 | Manter como base para proximos fluxos           |
| Iniciar registro sem equipamento selecionado           | Picker de equipamento antes do fluxo                                                               | coberto                      | `AppV2Shell.test.tsx` cobre "ao iniciar servico sem equipamento exige escolha"                                 | Nada relevante                                                                   | Preservar ao adicionar filtros                  |
| Base vazia antes do primeiro servico                   | Estado vazio orienta cadastrar equipamento e inicia registro apos salvar                           | coberto                      | `AppV2Shell.test.tsx`; `docs/app-v2-goal.md`                                                                   | Nada relevante                                                                   | Usar como padrao para novos estados vazios      |
| Contexto do atendimento com cliente/equipamento/motivo | `buildServiceContextViewModel`                                                                     | coberto                      | `src/app-v2/service/serviceFlowViewModel.ts`; teste de contexto                                                | Nada relevante                                                                   | Preservar contrato                              |
| Tipo de servico e tipo `Outro`                         | Opcoes v2 e limite de 40 caracteres para custom                                                    | coberto                      | `serviceFlowViewModel.ts`; `serviceFlowViewModel.test.ts`; `appV2Flow.test.ts`                                 | Nada relevante                                                                   | Nenhum                                          |
| Tecnico responsavel                                    | Campo obrigatorio na etapa de execucao e acumulacao em `tecnicos` mockado                          | coberto                      | `ServiceStepExecution.tsx`; `appV2Actions.ts`; `appV2Flow.test.ts`                                             | Autocomplete/lista visual de tecnicos nao auditado como necessario               | Avaliar autocomplete apenas se virar checkpoint |
| Diagnostico e acoes executadas                         | Campos separados e obrigatorios para continuar                                                     | coberto                      | `ServiceStepExecution.tsx`; `serviceFlowViewModel.test.ts`                                                     | Nada relevante                                                                   | Nenhum                                          |
| Pecas usadas                                           | Campo opcional persistido e exibido no resumo/relatorio                                            | coberto                      | `appV2Flow.test.ts`; `serviceReportViewModel.test.ts`; `AppV2Shell.test.tsx`                                   | Nada relevante                                                                   | Nenhum                                          |
| Custo de pecas e mao de obra                           | Campos opcionais preservados sem gerar orcamento real                                              | coberto                      | `appV2Flow.test.ts`; `serviceFlowViewModel.test.ts`; `serviceReportViewModel.test.ts`                          | Criar orcamento mockado a partir do fechamento                                   | Checkpoint de orcamentos mock/action            |
| Proxima manutencao pos-servico                         | Campo opcional cria compromisso mockado e aparece no relatorio                                     | coberto por substituição v2  | `appV2Actions.ts`; `appV2Flow.test.ts`; `contrato-proxima-preventiva-pos-salvamento-app-v2.md`                 | Prompt modal v1 removido por substituicao mais segura                            | Manter substituicao, documentar se criar prompt |
| Status final do equipamento                            | Atualiza status do equipamento ao concluir/editar registro                                         | coberto                      | `appV2Actions.ts`; `appV2Flow.test.ts`                                                                         | Nada relevante                                                                   | Nenhum                                          |
| Validacao de data e equipamento                        | Bloqueio por data invalida e equipamento ausente                                                   | coberto                      | `validateServiceCompletion`; `appV2Flow.test.ts`; `AppV2Shell.test.tsx`                                        | Validacoes adicionais numericas de custo podem ser refinadas depois              | Checkpoint pequeno se houver regra clara        |
| Revisao antes de concluir                              | Etapa `review` com resumo tecnico                                                                  | coberto                      | `serviceFlowViewModel.ts`; `ServiceStepReview.tsx`; testes de shell                                            | Nada relevante                                                                   | Nenhum                                          |
| Conclusao com feedback local                           | Tela `done` e resumo do servico                                                                    | coberto                      | `ServiceDone.tsx`; `serviceFlowViewModel.test.ts`; `AppV2Shell.test.tsx`                                       | CTAs mockados de orcamento/proximo compromisso ainda nao executam acoes proprias | Checkpoint pos-salvamento mock/action           |
| Persistencia em historico mockado                      | `completeService` adiciona registro recente e limpa draft                                          | coberto                      | `appV2Actions.ts`; `appV2Flow.test.ts`                                                                         | Storage real excluido                                                            | Nenhum                                          |
| Marcar compromisso original como concluido             | Compromisso vinculado muda para `concluido`                                                        | coberto                      | `completeService`; `appV2Flow.test.ts`                                                                         | Nada relevante                                                                   | Nenhum                                          |
| Editar registro existente                              | Reidrata draft, altera campos, preserva id e nao duplica historico                                 | coberto                      | `createServiceDraftFromRecord`; `updateServiceRecord`; `AppV2Shell.test.tsx`                                   | Nada relevante                                                                   | Nenhum                                          |
| Reabrir relatorio de registro concluido                | Relatorio local a partir de `RegistroServico`                                                      | coberto                      | `buildServiceReportViewModelFromRecord`; `serviceReportViewModel.test.ts`; `AppV2Shell.test.tsx`               | PDF real excluido                                                                | Nenhum                                          |
| Acoes pos-salvamento do v1                             | Relatorio local e saidas futuras desabilitadas; output status sugere orcamento/proximo compromisso | parcial                      | `ServiceDoneViewModel.disabledOutputs`; `servicesHomeViewModel.ts`; `appV2Flow.test.ts`                        | Criar acao mockada para orcamento e proximo compromisso a partir do fechamento   | Checkpoint pos-salvamento mock/action           |
| PDF/share/WhatsApp do registro                         | Fora do app-v2 nesta etapa                                                                         | pendente integração sensível | `docs/rewrite/matriz-paridade-v1-v2.md`; `AGENTS.md`                                                           | Integracao real de PDF/share/WhatsApp                                            | Etapa sensivel propria, nao misturar            |
| Historico recente de servicos                          | `Servicos > Registros` com lista e busca local                                                     | parcial                      | `servicesHomeViewModel.ts`; `AppV2Shell.test.tsx`                                                              | Filtros dedicados por periodo, cliente, equipamento, tipo/status                 | Checkpoint historico/filtros                    |
| Busca local em registros                               | Busca por equipamento, cliente, tecnico e texto tecnico                                            | coberto                      | `servicesHomeViewModel.ts`; `AppV2Shell.test.tsx`                                                              | Nada relevante                                                                   | Preservar em filtros futuros                    |
| Filtros avancados do historico v1                      | Nao ha equivalente dedicado no app-v2                                                              | não encontrado no v2         | v1: `historicoViewModel.js` e `historico.js`; v2: apenas busca local                                           | Periodo, cliente, equipamento, tipo/status e chips                               | Checkpoint historico/filtros                    |
| Deletar registro no historico                          | Nao mapeado no app-v2                                                                              | não encontrado no v2         | v1: `deleteReg` em `historico.js`; v2 sem acao equivalente                                                     | Decidir se a exclusao entra no app-v2 ou se sera removida                        | Checkpoint documental antes de UI               |
| Relatorios locais por registro                         | Lista, KPIs, busca e preview/impressao local                                                       | parcial                      | `servicesReportsViewModel.ts`; `serviceReportViewModel.ts`; `AppV2Shell.test.tsx`                              | Filtros por periodo/equipamento/cliente e relatorio consolidado                  | Checkpoint relatorios locais                    |
| Campos do relatorio tecnico                            | Cabecalho, cliente, equipamento, servico, execucao e assinatura textual                            | coberto por substituição v2  | `serviceReportViewModel.ts`; `serviceReportViewModel.test.ts`                                                  | Assinatura digital real excluida                                                 | Preservar modelo simples                        |
| Relatorio consolidado v1                               | So ha relatorios simples por registro no v2                                                        | parcial                      | v1: `relatorioViewModel.js`; v2: `servicesReportsViewModel.ts`                                                 | Consolidado por periodo/equipamento/cliente                                      | Checkpoint relatorios locais                    |
| Equipamentos: lista, busca e filtros basicos           | Lista com busca e filtros `all`, `attention`, `critical`, `without_first_service`                  | coberto                      | `equipmentViewModel.ts`; testes de shell                                                                       | Nada relevante                                                                   | Nenhum                                          |
| Equipamentos: detalhe funcional                        | Detalhe mostra cliente, status, ultima visita, proxima preventiva e CTA                            | coberto                      | `equipmentViewModel.ts`; `AppV2Shell.test.tsx`                                                                 | Alguns campos v1 avancados ficam fora do corte atual                             | Checkpoint especifico se necessario             |
| Equipamentos: criar/editar mock                        | `saveEquipment` com campos operacionais basicos e validacoes                                       | coberto                      | `equipmentActions.ts`; `equipmentActions.test.ts`; `AppV2Shell.test.tsx`                                       | Fotos, setores e delecao nao cobertos no app-v2                                  | Checkpoint equipamento fase futura              |
| Equipamentos: setores/fotos/delecao                    | Sem equivalente funcional v2 no escopo atual                                                       | não encontrado no v2         | v1: `src/features/equipamentos/ui/*`; v2 sem acoes equivalentes                                                | Decidir se entra no app-v2 ou se sera replanejado                                | Checkpoint documental de equipamentos           |
| Clientes: lista/detalhe por base instalada             | Subvisao em Equipamentos com equipamentos e servicos relacionados                                  | coberto por substituição v2  | `equipmentClientsViewModel.ts`; `AppV2Shell.test.tsx`                                                          | Rota principal separada de Clientes nao existe no shell v2                       | Manter como subvisao ate decisao de navegacao   |
| Clientes: criar/editar mock                            | `saveClient` e formulario v2                                                                       | coberto                      | `clientActions.ts`; `clientActions.test.ts`; `AppV2Shell.test.tsx`                                             | Delete e storage real excluidos                                                  | Nenhum                                          |
| Clientes: vinculo com equipamento                      | Criar equipamento para cliente preseleciona cliente                                                | coberto                      | `AppV2Shell.test.tsx`; `docs/app-v2-goal.md`                                                                   | Nada relevante                                                                   | Proximo checkpoint recomendado: Clientes fase 5 |
| Clientes: filtros/lista avancada v1                    | Nao ha busca, cidade/status, paginacao ou relatorio local por cliente                              | não encontrado no v2         | v1: `clientesViewModel.js`; v2: `equipmentClientsViewModel.ts`                                                 | Consulta/filtro dedicada por cliente                                             | Clientes fase 5: mapear filtros/relatorio local |
| Alertas e proxima acao da Home                         | Home prioriza alertas, compromissos vencidos/proximos e criticidade                                | coberto por substituição v2  | `homeAlerts.ts`; `homeViewModel.ts`; testes de home/shell                                                      | Nada relevante                                                                   | Preservar ao ampliar filtros                    |
| Orcamentos: pipeline local                             | Lista mockada com KPIs e status                                                                    | parcial                      | `servicesQuotesViewModel.ts`; `AppV2Shell.test.tsx`                                                            | Criar/editar orcamento mockado e vincular ao fechamento do servico               | Checkpoint orcamentos mock/action               |
| Orcamentos: modal v1 de criacao/edicao                 | Sem equivalente editavel no app-v2                                                                 | não encontrado no v2         | v1: `orcamentoModal.js`; v2: `ServicesQuotesHome.tsx`                                                          | Formulario mockado, itens, totais, status                                        | Checkpoint isolado de orcamentos                |
| Configuracoes operacionais simples                     | Aba Conta existe como placeholder                                                                  | pendente UI mínima           | `AppV2Shell.test.tsx`; v1: `configuracoes.js`                                                                  | Atalhos/preferencias mockadas uteis                                              | Checkpoint de mapeamento antes de UI            |
| Estados vazios e mensagens                             | Servicos/equipamentos/relatorios usam mensagens e orientacao local                                 | coberto                      | `servicesHomeViewModel.ts`; `servicesReportsViewModel.ts`; `AppV2Shell.test.tsx`                               | Expandir para clientes/orcamentos conforme novos fluxos                          | Reusar padrao existente                         |
| Design final e CSS legado                              | Fora da auditoria funcional                                                                        | bloqueado por design final   | `AGENTS.md`; `docs/rewrite/matriz-paridade-v1-v2.md`                                                           | Documento de Design System/UI antes de refinamento amplo                         | Etapa documental propria                        |
| Storage, Supabase/RLS, billing, assinatura e PMOC      | Fora do app-v2 nesta etapa                                                                         | pendente integração sensível | `AGENTS.md`; `docs/app-v2-goal.md`                                                                             | Etapas sensiveis dedicadas                                                       | Nao executar junto com UX funcional             |

## Resposta objetiva

- Ja foi implementado: aproximadamente **97% do Registro de Servico** e **74% da UX funcional util geral ja mapeada**.
- Falta: aproximadamente **3% do Registro de Servico** e **26% da UX funcional util geral mapeada**, excluindo integracoes sensiveis e design final.

## Cinco maiores lacunas funcionais

1. Historico avancado: faltam filtros por periodo, cliente, equipamento, tipo/status e chips equivalentes ao v1.
2. Relatorios locais consolidados: ha relatorio por registro, mas falta consulta/relatorio por periodo, cliente ou equipamento.
3. Orcamentos mockados editaveis: o v2 mostra pipeline local, mas ainda nao cria/edita orcamento nem parte do fechamento do servico.
4. Clientes fase 5: falta consulta/filtro dedicada ou relatorio local por cliente alem do detalhe com equipamentos/servicos.
5. Configuracoes/Conta: existe placeholder, mas ainda nao ha atalhos ou preferencias funcionais mockadas equivalentes ao v1.

## Itens bloqueados por integracao ou design

- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Billing, assinatura e quotas.
- PMOC.
- Assinatura digital real.
- Fotos/upload de equipamento.
- Design final, tema, tokens e CSS legado.

## Proximo checkpoint seguro

**Clientes fase 5: mapear filtros/consulta dedicada por Cliente ou relatorio local por Cliente antes de qualquer nova UI.**

Motivo: e o proximo foco ja recomendado em `docs/app-v2-goal.md`, aproveita a base atual de Clientes fase 4, nao exige storage real, nao toca areas sensiveis e pode ser executado primeiro como contrato/documento pequeno antes de qualquer implementacao.

## Validacao deste checkpoint

Validacoes solicitadas para rodar apos este documento:

```bash
npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run
npm run check
git diff --check
```

Resultado da validacao executada em 2026-05-16:

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`: passou com 4 arquivos e 69 testes.
- `git diff --check`: passou.
- `npm run check`: falhou em `prettier --check .` porque este documento ainda nao estava formatado no momento da primeira validacao. O warning conhecido de `src/domain/pdf/shareReport.js` apareceu em `lint`, sem erro de lint.

Acao documental posterior: o arquivo foi formatado com Prettier e deve ser revalidado antes do fechamento.

Resultado final apos formatacao:

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`: passou novamente com 4 arquivos e 69 testes.
- `git diff --check`: passou novamente.
- `npm run check`: passou. Permanece apenas o warning ESLint conhecido em `src/domain/pdf/shareReport.js` e os warnings Vite static+dynamic/chunk-size ja tratados como backlog tecnico controlado.

## Atualizacao posterior - Clientes fase 5

Clientes fase 5A-D foi executada apos esta auditoria:

- 5A: contrato documental criado em `docs/rewrite/clientes-fase-5-consulta-relatorio-local.md`.
- 5B: `equipmentClientsViewModel` passou a cobrir busca, filtros operacionais e resumo local por Cliente.
- 5C: `Equipamentos > Clientes` passou a exibir busca, filtros locais e `Resumo local do cliente`.
- 5D: `docs/app-v2-goal.md` e `docs/rewrite/matriz-paridade-v1-v2.md` foram atualizados.

Esta atualizacao reduz a lacuna de Clientes indicada na auditoria, mas nao recalcula
o percentual geral de 74% sem nova auditoria completa dos 38 itens. PMOC,
Supabase/RLS, migrations, storage real, PDF/share, WhatsApp real, billing e
design final continuam fora do escopo desta medicao.

## Atualizacao posterior - Servicos Registros filtros locais

O checkpoint de filtros locais em `Servicos > Registros` foi executado apos
Clientes fase 5:

- contrato documental criado em
  `docs/rewrite/servicos-registros-filtros-app-v2.md`;
- `servicesHomeViewModel` passou a filtrar historico por periodo, cliente,
  equipamento, tipo/status e busca textual;
- `ServicesHome` passou a exibir controles simples para esses filtros dentro de
  `Servicos > Registros`;
- a lacuna de historico avancado indicada nesta auditoria foi reduzida no
  criterio mock/local.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing e design final continuam fora do escopo desta
medicao.

## Atualizacao posterior - Orcamentos fase 2 edicao local basica

O checkpoint de Orcamentos fase 2 foi executado apos o mock/action
pos-fechamento:

- contrato documental criado em
  `docs/rewrite/orcamentos-fase-2-edicao-local-app-v2.md`;
- `updateQuoteDraft` passou a editar titulo, total e status de rascunho local;
- `Servicos > Orcamentos` passou a oferecer `Editar orcamento` para rascunhos
  mockados;
- a lacuna de modal v1 de edicao foi reduzida no criterio mock/local basico,
  ainda sem itens detalhados ou integracoes reais.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura e design final continuam fora do
escopo desta medicao.

## Atualizacao posterior - Orcamentos fase 3 itens locais simples

O checkpoint de Orcamentos fase 3 foi executado apos a edicao local basica:

- contrato documental criado em
  `docs/rewrite/orcamentos-fase-3-itens-locais-app-v2.md`;
- `Orcamento` passou a aceitar itens locais simples no contrato mockado;
- `updateQuoteDraft` passou a recalcular total pela soma dos itens locais;
- `Servicos > Orcamentos` passou a permitir adicionar item simples no rascunho;
- a lacuna de itens do modal v1 foi reduzida no criterio mock/local basico,
  ainda sem orcamento real, regras comerciais, PDF/share ou envio.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura e design final continuam fora do
escopo desta medicao.

## Atualizacao posterior - Orcamentos mock/action pos-fechamento

O checkpoint de orcamentos mock/action pos-fechamento foi executado apos
relatorios consolidados locais:

- contrato documental criado em
  `docs/rewrite/orcamentos-mock-action-pos-fechamento-app-v2.md`;
- `createQuoteFromServiceRecord` passou a criar orcamento local a partir de
  registro concluido;
- o estado `Servico concluido` passou a oferecer `Criar orcamento mockado`;
- `Servicos > Orcamentos` recebe o novo item no pipeline local;
- a lacuna de acao pos-salvamento para orcamento foi reduzida no criterio
  mock/local.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura e design final continuam fora do
escopo desta medicao.

## Atualizacao posterior - Relatorios consolidados locais

O checkpoint de relatorios consolidados locais em `Servicos > Relatorios` foi
executado apos os filtros locais de Registros:

- contrato documental criado em
  `docs/rewrite/relatorios-consolidados-locais-app-v2.md`;
- `servicesReportsViewModel` passou a aceitar filtros por periodo, cliente e
  equipamento;
- `ServiceReportsHome` passou a exibir controles simples e resumo consolidado
  local;
- a lacuna de relatorio consolidado indicada nesta auditoria foi reduzida no
  criterio mock/local.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing e design final continuam fora do escopo desta
medicao.
