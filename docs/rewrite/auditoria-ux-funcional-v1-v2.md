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

2. Cobertura geral dos fluxos v1 ja mapeados: **76%**.
   - Calculo: 29,0 / 38 itens ponderados principais.
   - O app-v2 cobre bem o caminho equipamento -> registro -> relatorio local -> historico recente.
   - A cobertura cai em historico avancado, filtros dedicados, orcamentos editaveis e partes de clientes/equipamentos que no v1 dependiam de filtros, storage ou modulo proprio.

## Matriz de paridade funcional

| Funcionalidade v1                                      | Equivalente no v2                                                                                          | Status                         | Evidencia no codigo/teste                                                                                                       | O que falta                                                                      | Proximo checkpoint recomendado                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| Iniciar registro a partir de equipamento               | `startServiceFromEquipment` e CTA no detalhe/Home                                                          | coberto                        | `src/app-v2/data/appV2Actions.ts`; `src/app-v2/data/appV2Flow.test.ts`; `src/app-v2/shell/AppV2Shell.test.tsx`                  | Nada relevante no escopo mockado                                                 | Manter como base para proximos fluxos           |
| Iniciar registro sem equipamento selecionado           | Picker de equipamento antes do fluxo                                                                       | coberto                        | `AppV2Shell.test.tsx` cobre "ao iniciar servico sem equipamento exige escolha"                                                  | Nada relevante                                                                   | Preservar ao adicionar filtros                  |
| Base vazia antes do primeiro servico                   | Estado vazio orienta cadastrar equipamento e inicia registro apos salvar                                   | coberto                        | `AppV2Shell.test.tsx`; `docs/app-v2-goal.md`                                                                                    | Nada relevante                                                                   | Usar como padrao para novos estados vazios      |
| Contexto do atendimento com cliente/equipamento/motivo | `buildServiceContextViewModel`                                                                             | coberto                        | `src/app-v2/service/serviceFlowViewModel.ts`; teste de contexto                                                                 | Nada relevante                                                                   | Preservar contrato                              |
| Tipo de servico e tipo `Outro`                         | Opcoes v2 e limite de 40 caracteres para custom                                                            | coberto                        | `serviceFlowViewModel.ts`; `serviceFlowViewModel.test.ts`; `appV2Flow.test.ts`                                                  | Nada relevante                                                                   | Nenhum                                          |
| Tecnico responsavel                                    | Campo obrigatorio na etapa de execucao e acumulacao em `tecnicos` mockado                                  | coberto                        | `ServiceStepExecution.tsx`; `appV2Actions.ts`; `appV2Flow.test.ts`                                                              | Autocomplete/lista visual de tecnicos nao auditado como necessario               | Avaliar autocomplete apenas se virar checkpoint |
| Diagnostico e acoes executadas                         | Campos separados e obrigatorios para continuar                                                             | coberto                        | `ServiceStepExecution.tsx`; `serviceFlowViewModel.test.ts`                                                                      | Nada relevante                                                                   | Nenhum                                          |
| Pecas usadas                                           | Campo opcional persistido e exibido no resumo/relatorio                                                    | coberto                        | `appV2Flow.test.ts`; `serviceReportViewModel.test.ts`; `AppV2Shell.test.tsx`                                                    | Nada relevante                                                                   | Nenhum                                          |
| Custo de pecas e mao de obra                           | Campos opcionais preservados sem gerar orcamento real                                                      | coberto                        | `appV2Flow.test.ts`; `serviceFlowViewModel.test.ts`; `serviceReportViewModel.test.ts`                                           | Criar orcamento mockado a partir do fechamento                                   | Checkpoint de orcamentos mock/action            |
| Proxima manutencao pos-servico                         | Campo opcional cria compromisso mockado e aparece no relatorio                                             | coberto por substituição v2    | `appV2Actions.ts`; `appV2Flow.test.ts`; `contrato-proxima-preventiva-pos-salvamento-app-v2.md`                                  | Prompt modal v1 removido por substituicao mais segura                            | Manter substituicao, documentar se criar prompt |
| Status final do equipamento                            | Atualiza status do equipamento ao concluir/editar registro                                                 | coberto                        | `appV2Actions.ts`; `appV2Flow.test.ts`                                                                                          | Nada relevante                                                                   | Nenhum                                          |
| Validacao de data e equipamento                        | Bloqueio por data invalida e equipamento ausente                                                           | coberto                        | `validateServiceCompletion`; `appV2Flow.test.ts`; `AppV2Shell.test.tsx`                                                         | Validacoes adicionais numericas de custo podem ser refinadas depois              | Checkpoint pequeno se houver regra clara        |
| Revisao antes de concluir                              | Etapa `review` com resumo tecnico                                                                          | coberto                        | `serviceFlowViewModel.ts`; `ServiceStepReview.tsx`; testes de shell                                                             | Nada relevante                                                                   | Nenhum                                          |
| Conclusao com feedback local                           | Tela `done` e resumo do servico                                                                            | coberto                        | `ServiceDone.tsx`; `serviceFlowViewModel.test.ts`; `AppV2Shell.test.tsx`                                                        | CTAs mockados de orcamento/proximo compromisso ainda nao executam acoes proprias | Checkpoint pos-salvamento mock/action           |
| Persistencia em historico mockado                      | `completeService` adiciona registro recente e limpa draft                                                  | coberto                        | `appV2Actions.ts`; `appV2Flow.test.ts`                                                                                          | Storage real excluido                                                            | Nenhum                                          |
| Marcar compromisso original como concluido             | Compromisso vinculado muda para `concluido`                                                                | coberto                        | `completeService`; `appV2Flow.test.ts`                                                                                          | Nada relevante                                                                   | Nenhum                                          |
| Editar registro existente                              | Reidrata draft, altera campos, preserva id e nao duplica historico                                         | coberto                        | `createServiceDraftFromRecord`; `updateServiceRecord`; `AppV2Shell.test.tsx`                                                    | Nada relevante                                                                   | Nenhum                                          |
| Reabrir relatorio de registro concluido                | Relatorio local a partir de `RegistroServico`                                                              | coberto                        | `buildServiceReportViewModelFromRecord`; `serviceReportViewModel.test.ts`; `AppV2Shell.test.tsx`                                | PDF real excluido                                                                | Nenhum                                          |
| Acoes pos-salvamento do v1                             | Relatorio local e saidas futuras desabilitadas; output status sugere orcamento/proximo compromisso         | parcial                        | `ServiceDoneViewModel.disabledOutputs`; `servicesHomeViewModel.ts`; `appV2Flow.test.ts`                                         | Criar acao mockada para orcamento e proximo compromisso a partir do fechamento   | Checkpoint pos-salvamento mock/action           |
| PDF/share/WhatsApp do registro                         | Fora do app-v2 nesta etapa                                                                                 | pendente integração sensível   | `docs/rewrite/matriz-paridade-v1-v2.md`; `AGENTS.md`                                                                            | Integracao real de PDF/share/WhatsApp                                            | Etapa sensivel propria, nao misturar            |
| Historico recente de servicos                          | `Servicos > Registros` com lista e busca local                                                             | parcial                        | `servicesHomeViewModel.ts`; `AppV2Shell.test.tsx`                                                                               | Filtros dedicados por periodo, cliente, equipamento, tipo/status                 | Checkpoint historico/filtros                    |
| Busca local em registros                               | Busca por equipamento, cliente, tecnico e texto tecnico                                                    | coberto                        | `servicesHomeViewModel.ts`; `AppV2Shell.test.tsx`                                                                               | Nada relevante                                                                   | Preservar em filtros futuros                    |
| Filtros avancados do historico v1                      | Nao ha equivalente dedicado no app-v2                                                                      | não encontrado no v2           | v1: `historicoViewModel.js` e `historico.js`; v2: apenas busca local                                                            | Periodo, cliente, equipamento, tipo/status e chips                               | Checkpoint historico/filtros                    |
| Deletar registro no historico                          | Nao mapeado no app-v2                                                                                      | não encontrado no v2           | v1: `deleteReg` em `historico.js`; v2 sem acao equivalente                                                                      | Decidir se a exclusao entra no app-v2 ou se sera removida                        | Checkpoint documental antes de UI               |
| Relatorios locais por registro                         | Lista, KPIs, busca e preview/impressao local                                                               | parcial                        | `servicesReportsViewModel.ts`; `serviceReportViewModel.ts`; `AppV2Shell.test.tsx`                                               | Filtros por periodo/equipamento/cliente e relatorio consolidado                  | Checkpoint relatorios locais                    |
| Campos do relatorio tecnico                            | Cabecalho, cliente, equipamento, servico, execucao e assinatura textual                                    | coberto por substituição v2    | `serviceReportViewModel.ts`; `serviceReportViewModel.test.ts`                                                                   | Assinatura digital real excluida                                                 | Preservar modelo simples                        |
| Relatorio consolidado v1                               | So ha relatorios simples por registro no v2                                                                | parcial                        | v1: `relatorioViewModel.js`; v2: `servicesReportsViewModel.ts`                                                                  | Consolidado por periodo/equipamento/cliente                                      | Checkpoint relatorios locais                    |
| Equipamentos: lista, busca e filtros basicos           | Lista com busca e filtros `all`, `attention`, `critical`, `without_first_service`                          | coberto                        | `equipmentViewModel.ts`; testes de shell                                                                                        | Nada relevante                                                                   | Nenhum                                          |
| Equipamentos: detalhe funcional                        | Detalhe mostra cliente, status, ultima visita, proxima preventiva e CTA                                    | coberto                        | `equipmentViewModel.ts`; `AppV2Shell.test.tsx`                                                                                  | Alguns campos v1 avancados ficam fora do corte atual                             | Checkpoint especifico se necessario             |
| Equipamentos: criar/editar mock                        | `saveEquipment` com campos operacionais basicos, setor mock/local e validacoes                             | coberto                        | `equipmentActions.ts`; `equipmentActions.test.ts`; `AppV2Shell.test.tsx`                                                        | Fotos e delecao nao cobertos no app-v2                                           | Checkpoint equipamento fase futura              |
| Equipamentos: setores/fotos/delecao                    | Setores mock/local, arquivamento/desarquivamento e anexos placeholder locais                               | parcial                        | `equipmentActions.ts`; `EquipmentList.tsx`; `EquipmentDetail.tsx`; `AppV2ShellEquipmentAttachments.test.tsx`; docs fases 2-12   | Delecao destrutiva, upload/storage real, gates reais e persistencia real         | Design visual documental ou etapa propria       |
| Clientes: lista/detalhe por base instalada             | Subvisao em Equipamentos com equipamentos e servicos relacionados                                          | coberto por substituição v2    | `equipmentClientsViewModel.ts`; `AppV2Shell.test.tsx`                                                                           | Rota principal separada de Clientes nao existe no shell v2                       | Manter como subvisao ate decisao de navegacao   |
| Clientes: criar/editar mock                            | `saveClient` e formulario v2                                                                               | coberto                        | `clientActions.ts`; `clientActions.test.ts`; `AppV2Shell.test.tsx`                                                              | Delete e storage real excluidos                                                  | Nenhum                                          |
| Clientes: vinculo com equipamento                      | Criar equipamento para cliente preseleciona cliente                                                        | coberto                        | `AppV2Shell.test.tsx`; `docs/app-v2-goal.md`                                                                                    | Nada relevante                                                                   | Proximo checkpoint recomendado: Clientes fase 5 |
| Clientes: filtros/lista avancada v1                    | Nao ha busca, cidade/status, paginacao ou relatorio local por cliente                                      | não encontrado no v2           | v1: `clientesViewModel.js`; v2: `equipmentClientsViewModel.ts`                                                                  | Consulta/filtro dedicada por cliente                                             | Clientes fase 5: mapear filtros/relatorio local |
| Alertas e proxima acao da Home                         | Home prioriza alertas, compromissos vencidos/proximos e criticidade                                        | coberto por substituição v2    | `homeAlerts.ts`; `homeViewModel.ts`; testes de home/shell                                                                       | Nada relevante                                                                   | Preservar ao ampliar filtros                    |
| Orcamentos: pipeline local                             | Lista mockada com KPIs e status                                                                            | parcial                        | `servicesQuotesViewModel.ts`; `AppV2Shell.test.tsx`                                                                             | Criar/editar orcamento mockado e vincular ao fechamento do servico               | Checkpoint orcamentos mock/action               |
| Orcamentos: modal v1 de criacao/edicao                 | Sem equivalente editavel no app-v2                                                                         | não encontrado no v2           | v1: `orcamentoModal.js`; v2: `ServicesQuotesHome.tsx`                                                                           | Formulario mockado, itens, totais, status                                        | Checkpoint isolado de orcamentos                |
| Configuracoes operacionais simples                     | `Conta` com atalhos locais, preferencias em memoria, microcopy, estados locais e ajustes de acessibilidade | coberto por substituicao v2    | `accountViewModel.ts`; `AccountHome.tsx`; `AppV2ShellAccount.test.tsx`; v1: `configuracoes.js`                                  | Perfil real, persistencia, billing, assinatura e PMOC fora                       | Etapas proprias para integracoes sensiveis      |
| Estados vazios e mensagens                             | Servicos/equipamentos/relatorios usam mensagens e orientacao local                                         | coberto                        | `servicesHomeViewModel.ts`; `servicesReportsViewModel.ts`; `AppV2Shell.test.tsx`                                                | Expandir para clientes/orcamentos conforme novos fluxos                          | Reusar padrao existente                         |
| Design final e CSS legado                              | Regras documentais de Design System/UI existem, mas sem refinamento runtime                                | documentado; runtime bloqueado | `AGENTS.md`; `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md`; `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md` | Escolher area unica e checklist antes de CSS/tokens/componentes                  | Design System/UI fase 2 documental              |
| Storage, Supabase/RLS, billing, assinatura e PMOC      | Fora do app-v2 nesta etapa                                                                                 | pendente integração sensível   | `AGENTS.md`; `docs/app-v2-goal.md`                                                                                              | Etapas sensiveis dedicadas                                                       | Nao executar junto com UX funcional             |

## Resposta objetiva

- Ja foi implementado: aproximadamente **97% do Registro de Servico** e **76% da UX funcional util geral ja mapeada**.
- Falta: aproximadamente **3% do Registro de Servico** e **24% da UX funcional util geral mapeada**, excluindo integracoes sensiveis e design final.

## Cinco maiores lacunas funcionais

1. Historico avancado: faltam filtros por periodo, cliente, equipamento, tipo/status e chips equivalentes ao v1.
2. Relatorios locais consolidados: ha relatorio por registro, mas falta consulta/relatorio por periodo, cliente ou equipamento.
3. Orcamentos mockados editaveis: o v2 mostra pipeline local, mas ainda nao cria/edita orcamento nem parte do fechamento do servico.
4. Clientes fase 5: falta consulta/filtro dedicada ou relatorio local por cliente alem do detalhe com equipamentos/servicos.
5. Equipamentos avancados: setores, arquivamento/desarquivamento e anexos
   placeholder locais ja cobrem a fatia mock/local principal; upload/storage
   real, gates reais e delecao destrutiva exigem etapas proprias.

## Itens bloqueados por integracao ou design

- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Billing, assinatura e quotas.
- PMOC.
- Assinatura digital real.
- Upload/storage real de fotos/anexos de equipamento.
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

## Atualizacao posterior - Configuracoes/Conta fase 6 encerramento documental

O ciclo local de Configuracoes/Conta foi encerrado apos as fases 1 a 5:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`;
- `Conta` deixou de ser placeholder no criterio mock/local;
- atalhos locais, preferencias em memoria, microcopy, estados locais,
  acessibilidade e resiliencia de texto foram consolidados como cobertura
  funcional local;
- o percentual geral foi recalculado de 28,0 / 38 para 29,0 / 38 itens
  ponderados principais;
- a estimativa geral passou de 74% para 76%;
- Registro de Servico permanece em aproximadamente 97%.

PMOC, Supabase/RLS, migrations, storage real, PDF/share real, WhatsApp real,
billing, assinatura, perfil real, persistencia e design final continuam fora do
escopo desta medicao.

## Atualizacao posterior - Design System/UI fase 1 documental

A fase documental de Design System/UI foi executada apos o encerramento local de
`Conta`:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`;
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` foi consolidado como
  fonte normativa inicial;
- checkpoints visuais futuros devem declarar area unica, componentes afetados,
  tokens/classes esperados, estados de validacao e escopo proibido antes de
  editar codigo;
- nenhuma mudanca de CSS, Tailwind, tokens, componentes, primitives ou runtime
  visual foi feita.

Esta atualizacao nao altera a porcentagem funcional de 76%, porque design final
e CSS legado permanecem fora da medicao funcional principal. PMOC,
Supabase/RLS, migrations, storage real, PDF/share real, WhatsApp real, billing,
assinatura, perfil real e persistencia continuam fora do escopo.

## Atualizacao posterior - Design System/UI fase 2 Home Hoje checklist

A fase 2 documental escolheu Home Hoje como primeira area candidata para
refinamento visual controlado:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`;
- arquivos candidatos foram mapeados sem alterar runtime;
- checklist futuro exige mobile 390px, desktop 1366px, desktop largo 1920px,
  texto longo, estado sem alertas, muitos itens e foco de teclado;
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` passou a recomendar
  QA visual inicial da Home Hoje antes de qualquer refinamento de codigo.

Esta atualizacao nao altera a porcentagem funcional de 76%, porque ainda nao ha
mudanca funcional ou visual de runtime. PMOC, Supabase/RLS, migrations, storage
real, PDF/share real, WhatsApp real, billing, assinatura, perfil real e
persistencia continuam fora do escopo.

## Atualizacao posterior - Design System/UI fase 3 QA visual Home Hoje

O QA visual inicial da Home Hoje foi executado apos o checklist:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-3-qa-visual-home-hoje.md`;
- evidencias visuais e metricas foram salvas em
  `docs/rewrite/qa-design-system-ui-fase-3-home-hoje/`;
- mobile 390px, desktop 1366px e desktop 1920px nao apresentaram overflow
  horizontal;
- bottom nav apareceu no mobile e sidebar apareceu no desktop;
- texto longo injetado temporariamente nao gerou overflow horizontal;
- foi corrigida uma borda nativa preta nos botoes de alerta da coluna auxiliar
  de Home Hoje com `tw-border-0`.

Esta atualizacao nao altera a porcentagem funcional de 76%, porque o ajuste foi
visual/local e nao muda paridade funcional. PMOC, Supabase/RLS, migrations,
storage real, PDF/share real, WhatsApp real, billing, assinatura, perfil real e
persistencia continuam fora do escopo.

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

## Atualizacao posterior - Configuracoes/Conta fase 5 acessibilidade e responsividade local

O checkpoint de Configuracoes/Conta fase 5 foi executado apos microcopy e
estados locais:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-5-a11y-responsividade-local.md`;
- controles de preferencias receberam descricoes associadas;
- lembrete visual recebeu estado pressionado acessivel;
- atalhos locais receberam quebra segura de texto;
- a revisao reduziu risco local de overflow e ambiguidade de foco sem mudar
  design global.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura, perfil real, persistencia e design
final continuam fora do escopo desta medicao.

## Atualizacao posterior - Configuracoes/Conta fase 4 microcopy e estados locais

O checkpoint de Configuracoes/Conta fase 4 foi executado apos as preferencias
visiveis locais:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-4-microcopy-estados-locais.md`;
- a aba `Conta` removeu linguagem de mock da microcopy visivel;
- `AccountHome` passou a exibir estado vazio local;
- `AccountHome` passou a exibir limite local generico para separar sessao atual
  de etapas dedicadas;
- preferencias seguem somente em memoria.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura, perfil real, persistencia e design
final continuam fora do escopo desta medicao.

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

## Atualizacao posterior - Configuracoes/Conta fase 3 preferencias visiveis

O checkpoint de Configuracoes/Conta fase 3 foi executado apos a UI local de
Conta:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-3-preferencias-visiveis.md`;
- preferencias de densidade, tela inicial e lembrete local passaram a ter
  efeito visivel limitado;
- densidade e lembrete ficam restritos a `AccountHome`;
- a tela inicial preferida e aberta apenas por acao explicita e usa abas ja
  existentes do app-v2;
- preferencias seguem somente em memoria.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura, perfil real, persistencia e design
final continuam fora do escopo desta medicao.

## Atualizacao posterior - Configuracoes/Conta fase 1 contrato local

O checkpoint documental de Configuracoes/Conta fase 1 foi executado apos
Orcamentos fase 3:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`;
- atalhos permitidos foram mapeados para fluxos app-v2 existentes;
- preferencias foram limitadas a estado local/em memoria;
- PMOC foi excluido da fase e mantido para etapa propria futura;
- nenhuma UI/runtime de Conta foi implementada nesta fase.

Esta atualizacao reduz a incerteza da lacuna de Configuracoes/Conta, mas nao
recalcula o percentual geral de 74% sem nova auditoria completa dos 38 itens.
PMOC, Supabase/RLS, migrations, storage real, PDF/share real, WhatsApp real,
billing, assinatura e design final continuam fora do escopo desta medicao.

## Atualizacao posterior - Configuracoes/Conta fase 2 UI local

O checkpoint de Configuracoes/Conta fase 2 foi executado apos o contrato local:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-2-ui-local.md`;
- `Conta` deixou de ser placeholder e passou a renderizar painel local;
- atalhos locais cobrem registro, clientes, orcamentos e Home/alertas;
- preferencias ficam apenas em memoria;
- a lacuna de Configuracoes/Conta foi reduzida no criterio mock/local.

Esta atualizacao nao recalcula o percentual geral de 74% sem nova auditoria
completa dos 38 itens. PMOC, Supabase/RLS, migrations, storage real, PDF/share
real, WhatsApp real, billing, assinatura, perfil real e design final continuam
fora do escopo desta medicao.

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

## Atualizacao posterior - Design System/UI fase 4 fechamento Home Hoje

O checkpoint de fechamento visual da Home Hoje foi executado apos o QA inicial:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-4-fechamento-home-hoje.md`;
- evidencias geradas em
  `docs/rewrite/qa-design-system-ui-fase-4-home-hoje/`;
- botoes de `Alertas ativos` permaneceram sem risco de borda nativa;
- divisor de `Alertas ativos` passou a ter cor explicita
  `tw-divide-[#E5EAF0]`;
- mobile 390px, desktop 1366px, desktop 1920px e texto longo ficaram sem
  overflow horizontal;
- o ciclo visual da Home Hoje foi encerrado sem redesign geral.

Esta atualizacao nao altera a porcentagem funcional de 76%, porque o checkpoint
e visual/local e nao muda paridade funcional. PMOC, Supabase/RLS, migrations,
storage real, PDF/share real, WhatsApp real, billing, assinatura, perfil real,
security hardening e React Doctor continuam fora do escopo desta medicao.

## Atualizacao posterior - Equipamentos avancados fase 1 contrato local

O checkpoint documental de Equipamentos avancados foi executado apos o
fechamento visual da Home Hoje:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-1-contrato-local.md`;
- setores do v1 foram mapeados como possivel fatia mock/local futura;
- fotos foram mantidas fora por exigirem upload/storage, regras de plano e
  fallback;
- delecao foi mantida fora por risco sobre registros vinculados, historico,
  relatorios e orcamentos;
- a fase 2 recomendada ficou limitada a setores mock/local basicos.

Esta atualizacao nao recalcula a porcentagem funcional de 76%, porque nao houve
mudanca de runtime. PMOC, Supabase/RLS, migrations, storage real, upload/fotos,
PDF/share real, WhatsApp real, billing, assinatura, perfil real, delecao,
security hardening e React Doctor continuam fora do escopo desta medicao.

## Atualizacao posterior - Equipamentos avancados fase 2 setores mock/local

O checkpoint de setores mock/local foi executado apos o contrato documental:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-2-setores-mock-local.md`;
- `SetorEquipamento` e `setorId` foram adicionados ao contrato local do app-v2;
- o snapshot mockado passou a carregar setores;
- cadastro/edicao de equipamento permite escolher setor;
- lista e detalhe de Equipamentos exibem setor;
- lista de Equipamentos permite filtro local por setor;
- fotos, upload, storage real, billing real, assinatura real, Supabase/RLS,
  migrations, delecao, PMOC, PDF/share e WhatsApp real ficaram fora.

Esta atualizacao reduz parcialmente a lacuna de `Equipamentos:
setores/fotos/delecao` no criterio mock/local, mas nao recalcula a porcentagem
funcional de 76% sem nova auditoria completa dos 38 itens. Fotos e delecao
seguem como lacunas separadas por risco.

## Atualizacao posterior - Equipamentos avancados fase 3 setores CRUD local

O checkpoint de criacao/edicao simples de setores mock/local foi executado apos
a fase 2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-3-setores-crud-local.md`;
- `saveEquipmentSector` passou a criar e editar setores no snapshot local;
- `AppV2Shell` ganhou handler local para salvar setor preservando draft de
  servico;
- `EquipmentList` ganhou painel minimo de setores;
- a UI permite criar e editar nome, cliente, cor e responsavel do setor;
- filtros e exibicao de equipamentos refletem os setores alterados localmente.

Esta atualizacao melhora a cobertura local de `Equipamentos:
setores/fotos/delecao`, mas nao altera a porcentagem principal porque fotos,
delecao, billing real, assinatura, storage real, Supabase/RLS, migrations e PMOC
continuam fora do escopo principal.

## Atualizacao posterior - Equipamentos avancados fase 4 delecao contrato local

O checkpoint documental de delecao foi executado apos a fase 3:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-4-delecao-contrato-local.md`;
- delecao de equipamento v1 foi mapeada como remocao de equipamento e registros
  vinculados;
- delecao de setor v1 foi mapeada como remocao de agrupamento com limpeza de
  `setorId` dos equipamentos;
- app-v2 atual foi confirmado sem action ou UI de delecao;
- delecao de setor foi escolhida como primeira fatia mock/local futura;
- delecao ou arquivamento de equipamento ficou para etapa propria por risco em
  registros, relatorios, orcamentos e historico.

Esta atualizacao nao altera a porcentagem principal porque foi documental.
Fotos, delecao runtime, billing real, assinatura, storage real, Supabase/RLS,
migrations e PMOC continuam fora do escopo principal ate checkpoint proprio.

## Atualizacao posterior - Equipamentos avancados fase 5 delecao setor local

O checkpoint de delecao mock/local de setor foi executado apos o contrato da
fase 4:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-5-delecao-setor-local.md`;
- `deleteEquipmentSector` remove setor do snapshot local;
- equipamentos vinculados ao setor removido permanecem no app-v2 sem `setorId`;
- registros e orcamentos sao preservados;
- `EquipmentList` exige confirmacao antes de remover setor;
- delecao de equipamento ficou fora e segue exigindo etapa propria.

Esta atualizacao melhora a cobertura local de `Equipamentos:
setores/fotos/delecao`, mas nao altera a porcentagem principal sem nova auditoria
completa. Fotos, delecao/arquivamento de equipamento, billing real, assinatura,
storage real, Supabase/RLS, migrations e PMOC continuam fora do escopo principal.

## Atualizacao posterior - Equipamentos avancados fase 6 contrato arquivamento equipamento

O checkpoint documental de equipamento foi executado apos a delecao local de
setor:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-6-contrato-arquivamento-equipamento.md`;
- delecao destrutiva do v1 foi rejeitada como padrao inicial do app-v2 por
  remover registros vinculados;
- arquivamento local foi escolhido como contrato recomendado para a proxima fase
  de runtime;
- registros, relatorios, orcamentos, compromissos, filtros e historico devem ser
  preservados;
- delecao destrutiva ficou bloqueada para etapa futura propria.

Esta atualizacao nao altera a porcentagem principal porque foi documental e nao
altera runtime. Fotos, arquivamento runtime, delecao destrutiva, billing real,
assinatura, storage real, Supabase/RLS, migrations e PMOC continuam fora do
escopo principal ate checkpoint proprio.

## Atualizacao posterior - Equipamentos avancados fase 7 arquivamento equipamento local

O checkpoint de arquivamento mock/local de equipamento foi executado apos a
decisao documental:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-7-arquivamento-equipamento-local.md`;
- equipamento passou a aceitar `archivedAt` local;
- action de arquivamento preserva equipamento, registros, compromissos e
  orcamentos;
- lista operacional oculta arquivados por padrao;
- detalhe e areas de Servicos/Relatorios continuam resolvendo historico pelo
  mesmo `equipamentoId`;
- delecao destrutiva segue fora.

Esta atualizacao melhora a cobertura local de `Equipamentos:
setores/fotos/delecao`, mas nao altera a porcentagem principal sem nova auditoria
completa. Fotos, desarquivamento, delecao destrutiva, billing real, assinatura,
storage real, Supabase/RLS, migrations e PMOC continuam fora do escopo principal.

## Atualizacao posterior - Equipamentos avancados fase 8 contrato desarquivamento e compromissos

O checkpoint documental de desarquivamento e compromissos foi executado apos o
arquivamento local:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-8-contrato-desarquivamento-compromissos.md`;
- identificado que compromissos `agendado` de equipamento arquivado ainda podem
  alimentar Home, fila e proxima acao se o runtime nao tratar `archivedAt`;
- definido que o equipamento arquivado deve sair da operacao ativa sem perder
  historico;
- definido que compromissos `agendado` vinculados devem ser preservados como
  registros, mas convertidos localmente para `cancelado` ao arquivar;
- definido que desarquivar nao deve reabrir automaticamente compromissos
  cancelados.

Esta atualizacao nao altera a porcentagem principal porque foi documental.
Desarquivamento runtime, tratamento operacional da Home/fila, fotos, delecao
destrutiva, billing real, assinatura, storage real, Supabase/RLS, migrations e
PMOC continuam fora do escopo principal ate checkpoint proprio.

## Atualizacao posterior - Equipamentos avancados fase 9 runtime desarquivamento e compromissos

O checkpoint de runtime mock/local foi executado apos o contrato documental:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-9-runtime-desarquivamento-compromissos.md`;
- arquivar equipamento agora cancela localmente compromissos `agendado`
  vinculados ao equipamento;
- desarquivar equipamento remove `archivedAt` sem reabrir compromissos
  cancelados;
- Home, alertas, fila e proxima acao deixam de considerar equipamentos
  arquivados;
- Servicos nao lista arquivados na escolha operacional e bloqueia inicio direto
  por equipamento arquivado;
- historico de Servicos/Relatorios permanece resolvendo o equipamento pelo mesmo
  `equipamentoId`.

Esta atualizacao melhora a cobertura local de `Equipamentos:
setores/fotos/delecao`, mas nao altera a porcentagem principal sem nova auditoria
completa. Fotos/anexos, delecao destrutiva, billing real, assinatura, storage
real, Supabase/RLS, migrations e PMOC continuam fora do escopo principal.

## Atualizacao posterior - Equipamentos avancados fase 10 contrato fotos e anexos

O checkpoint documental de fotos/anexos foi executado apos a estabilizacao local
de arquivamento/desarquivamento:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-10-contrato-fotos-anexos.md`;
- fotos de equipamento do v1 foram classificadas como area sensivel por
  misturar gate de plano, editor, upload, storage, fallback offline e capa
  visual;
- definido que o app-v2 deve iniciar por contrato `EquipmentAttachment`
  mock/local, sem arquivo real e sem storage real;
- definido limite inicial de ate 3 itens visuais por equipamento no mock;
- definido que upload/storage real, Supabase/RLS, migrations e billing/gates
  reais permanecem para etapas proprias.

Esta atualizacao nao altera a porcentagem principal porque foi documental.
Fotos/anexos runtime, upload real, storage real, billing real, assinatura,
Supabase/RLS, migrations, delecao destrutiva e PMOC continuam fora do escopo
principal ate checkpoint proprio.

## Atualizacao posterior - Equipamentos avancados fase 11 anexos placeholder local

O checkpoint de runtime mock/local foi executado apos o contrato documental de
fotos/anexos:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-11-anexos-placeholder-local.md`;
- `Equipamento` ganhou contrato `EquipmentAttachment` local;
- `saveEquipmentAttachment` adiciona/edita anexo placeholder com limite de 3
  itens por equipamento;
- metadados de arquivo, URL, bucket, signed URL e storage real sao bloqueados;
- card e detalhe exibem capa/anexos locais;
- shell permite adicionar placeholder local sem input real de arquivo;
- editar, arquivar e desarquivar preservam anexos locais.

Esta atualizacao melhora a cobertura local de `Equipamentos:
setores/fotos/delecao`, mas nao altera a porcentagem principal sem nova
reauditoria. Upload real, storage real, Supabase/RLS, migrations, billing real,
assinatura, delecao destrutiva e PMOC continuam fora do escopo principal ate
checkpoint proprio.

## Atualizacao posterior - Equipamentos avancados fase 12 reauditoria de paridade

A reauditoria documental de Equipamentos foi executada apos anexos placeholder
locais:

- relatorio criado em
  `docs/rewrite/equipamentos-avancados-fase-12-reauditoria-paridade.md`;
- `Equipamentos: setores/fotos/delecao` foi reclassificado no texto da matriz
  para refletir setores, arquivamento/desarquivamento e anexos placeholder
  locais;
- a porcentagem geral estimada permanece **76%**, porque o item continua
  `parcial` pelo metodo de peso e as lacunas restantes pertencem a integracoes
  sensiveis ou etapas proprias;
- PMOC foi mantido fora do ciclo e deve ser refeito em etapa propria futura;
- o restante de Equipamentos foi separado entre design, backlog sensivel e
  etapa propria de delecao destrutiva.

Decisao: para UX funcional mock/local, Equipamentos esta suficientemente
avancado para nao puxar novas fatias funcionais pequenas automaticamente. O
proximo passo seguro e auditoria visual documental de Equipamentos antes de
qualquer refinamento de design.

## Atualizacao posterior - Design System/UI fase 5 auditoria visual Equipamentos

A auditoria visual documental de Equipamentos foi executada apos a reauditoria
de paridade:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-5-equipamentos-auditoria-visual.md`;
- lista, card, detalhe, estados vazios, anexos locais, mobile/desktop, rolagem
  e texto longo foram definidos como criterios obrigatorios da proxima fase
  visual;
- riscos de densidade da lista, excesso de cards no detalhe, truncamento em
  cards, diferenca entre vazio real e filtro sem resultado, e interpretacao de
  anexo placeholder como upload real foram documentados;
- matriz minima de QA visual futura foi definida para mobile 390, desktop 1366
  e desktop 1920.

Esta atualizacao nao altera a porcentagem principal porque foi documental e nao
altera runtime funcional. Equipamentos permanece avancado para UX funcional
mock/local, mas o refinamento visual depende de QA real em browser. PMOC,
upload/storage real, Supabase/RLS, migrations, billing real, assinatura,
delecao destrutiva, PDF/share e WhatsApp continuam fora do escopo principal ate
checkpoint proprio.

## Atualizacao posterior - Design System/UI fase 6 QA visual Equipamentos

O QA visual real de Equipamentos foi executado em browser apos a auditoria
documental:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-6-equipamentos-qa-visual.md`;
- evidencias salvas em
  `docs/rewrite/qa-design-system-ui-fase-6-equipamentos/`;
- lista, filtro sem resultado, texto longo e detalhe com 3 anexos locais foram
  capturados em mobile 390, desktop 1366 e desktop 1920;
- nao houve overflow horizontal da pagina em nenhum cenario;
- estado vazio e detalhe com anexos renderizaram corretamente;
- texto longo foi truncado sem quebrar layout;
- o unico achado visual foi o chip `Sem primeiro servico` parcialmente cortado
  no mobile 390 dentro da faixa de filtros rolavel.

Esta atualizacao nao altera a porcentagem principal porque e uma validacao
visual/documental. A proxima melhoria recomendada e um ajuste pequeno de UI na
faixa de filtros de Equipamentos mobile. PMOC, upload/storage real,
Supabase/RLS, migrations, billing real, assinatura, delecao destrutiva,
PDF/share e WhatsApp continuam fora do escopo principal ate checkpoint proprio.

## Atualizacao posterior - Design System/UI fase 7 filtros mobile Equipamentos

O ajuste visual pequeno da faixa de filtros de Equipamentos foi executado apos o
QA visual:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-7-equipamentos-filtros-mobile.md`;
- `EquipmentList` deixou de usar rolagem horizontal na faixa de filtros;
- a faixa de filtros agora quebra linha com `tw-flex-wrap`;
- evidencias pos-ajuste foram salvas em
  `docs/rewrite/qa-design-system-ui-fase-7-equipamentos-filtros/`;
- os 12 cenarios de lista, filtro sem resultado, texto longo e detalhe com
  anexos foram recapturados em mobile 390, desktop 1366 e desktop 1920;
- nao houve overflow horizontal de pagina nem elementos visiveis fora da
  viewport nos cenarios pos-ajuste.

Esta atualizacao nao altera a porcentagem principal porque e refinamento visual
local, nao nova paridade funcional. O ciclo visual de Equipamentos fica fechado
para lista, filtros, estado vazio, texto longo e detalhe com anexos locais.
PMOC, upload/storage real, Supabase/RLS, migrations, billing real, assinatura,
delecao destrutiva, PDF/share e WhatsApp continuam fora do escopo principal ate
checkpoint proprio.

## Atualizacao posterior - Reauditoria matriz UX v1-v2 pos Equipamentos visual

A reauditoria documental da matriz UX v1-v2 foi executada apos o fechamento
visual local de Equipamentos:

- relatorio criado em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-equipamentos-design.md`;
- Equipamentos foi confirmado como visualmente fechado para lista, filtros,
  estado vazio, texto longo e detalhe com anexos placeholder locais;
- a porcentagem geral estimada permanece **76%**, porque esta etapa nao cria
  nova paridade funcional e Equipamentos continua `parcial` apenas por lacunas
  sensiveis ou de etapa propria;
- acoes pos-salvamento, filtros de Registros, Relatorios consolidados e
  Orcamentos mock/local ja possuem checkpoints anteriores, entao nao devem ser
  reabertos como se fossem lacunas novas;
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria;
- Supabase/RLS e migrations permanecem em etapa propria futura, com possibilidade
  de refazer migrations se necessario;
- o proximo fluxo recomendado foi definido como auditoria visual documental de
  `Servicos`.

Decisao: o proximo checkpoint seguro e Design System/UI fase 8, com auditoria
visual documental de `Servicos` cobrindo Registros, Relatorios e Orcamentos
locais, ainda sem runtime, PDF/share real, WhatsApp real, storage real,
Supabase/RLS, migrations, PMOC, billing real, assinatura, router novo ou
redesign amplo.

## Atualizacao posterior - Design System/UI fase 8 auditoria visual Servicos

A auditoria visual documental de `Servicos` foi executada apos a reauditoria da
matriz UX v1-v2:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-8-servicos-auditoria-visual.md`;
- Registros, Relatorios e Orcamentos foram auditados como area unica, sem
  reabrir lacunas funcionais ja cobertas por checkpoints anteriores;
- riscos de subvisao horizontal, filtros densos, cards com texto longo, lista
  operacional, preview imprimivel e edicao local de orcamento foram
  documentados;
- definida matriz minima de QA visual para mobile 390, desktop 1366 e desktop 1920.

Esta atualizacao nao altera a porcentagem principal porque e documental e
visual, sem nova paridade funcional. PMOC, PDF/share real, WhatsApp real,
storage real, Supabase/RLS, migrations, billing real, assinatura, router global,
seguranca e React Doctor continuam fora do escopo principal ate checkpoint
proprio.

## Atualizacao posterior - Design System/UI fase 9 QA visual Servicos

O QA visual real de `Servicos` foi executado apos a auditoria documental da fase
8:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-9-servicos-qa-visual.md`;
- evidencias salvas em `docs/rewrite/qa-design-system-ui-fase-9-servicos/`;
- Registros, Relatorios e Orcamentos foram capturados em 27 cenarios entre
  mobile 390, desktop 1366 e desktop 1920;
- a primeira captura encontrou overflow horizontal de 2px no input `Buscar
registros` em mobile 390;
- `ServicesHome` recebeu somente `tw-box-border` no input de busca de Registros;
- a recaptura completa ficou sem overflow horizontal de pagina e sem elementos
  visiveis fora da viewport nos 27 cenarios.

Esta atualizacao nao altera a porcentagem principal porque e refinamento visual
local, nao nova paridade funcional. PMOC, PDF/share real, WhatsApp real,
storage real, Supabase/RLS, migrations, billing real, assinatura, router global,
seguranca e React Doctor continuam fora do escopo principal ate checkpoint
proprio.

## Atualizacao posterior - Reauditoria matriz UX v1-v2 pos Servicos visual

A reauditoria documental da matriz UX v1-v2 foi executada apos o fechamento
visual local de `Servicos`:

- relatorio criado em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-servicos-design.md`;
- `Servicos` foi confirmado como visualmente fechado para Registros,
  Relatorios e Orcamentos nos cenarios cobertos pela fase 9;
- a porcentagem geral estimada permanece **76%**, porque esta etapa nao cria
  nova paridade funcional;
- Home Hoje, Equipamentos e Servicos ja possuem ciclos visuais recentes, entao
  nao devem ser reabertos sem novo achado objetivo;
- `Conta` foi classificada como proximo fluxo visual seguro, pois ja possui
  ciclo funcional local encerrado e ainda nao teve auditoria visual dedicada;
- PMOC permanece excluido deste ciclo e deve ser refeito em etapa propria;
- Supabase/RLS e migrations permanecem em etapa propria futura, com possibilidade
  de refazer migrations se necessario.

Decisao: o proximo checkpoint seguro e Design System/UI fase 10, com auditoria
visual documental de `Conta` cobrindo atalhos locais, preferencias em memoria,
lembrete local, ajuda, estados locais, texto longo, foco, mobile/desktop e
densidade compacta, ainda sem runtime, storage real, Supabase/RLS, migrations,
PMOC, billing real, assinatura, PDF/share, WhatsApp, perfil real ou redesign
amplo.

## Atualizacao posterior - Design System/UI fase 10 auditoria visual Conta

A auditoria visual documental de `Conta` foi executada apos a reauditoria
pos-Servicos:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-10-conta-auditoria-visual.md`;
- atalhos locais, preferencias em memoria, lembrete local, ajuda, estados
  locais, texto longo, foco, mobile/desktop e densidade compacta foram auditados
  sem alterar runtime;
- riscos de densidade compacta em mobile, atalhos com texto longo, selects em
  grid, lembrete condicional, termos sensiveis proximos e excesso de blocos
  foram documentados;
- definida matriz minima de QA visual para mobile 390, desktop 1366 e desktop 1920.

Esta atualizacao nao altera a porcentagem funcional de 76%, porque e documental
e visual, sem nova paridade funcional. Perfil real, persistencia, billing,
assinatura, Supabase/RLS, migrations, PMOC, PDF/share, WhatsApp, suporte real,
seguranca e React Doctor continuam fora do escopo principal ate checkpoint
proprio.

## Atualizacao posterior - Design System/UI fase 11 QA visual Conta

O QA visual real de `Conta` foi executado apos a auditoria documental da fase 10:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-11-conta-qa-visual.md`;
- evidencias salvas em `docs/rewrite/qa-design-system-ui-fase-11-conta/`;
- default, densidade compacta, lembrete ativo, foco em atalho, texto local e
  preferencias foram capturados em 13 cenarios entre mobile 390, desktop 1366 e
  desktop 1920;
- a captura ficou sem overflow horizontal de pagina, sem elementos visiveis fora
  da viewport e sem termos sensiveis visiveis;
- nao houve ajuste visual porque nao houve achado objetivo.

Esta atualizacao nao altera a porcentagem funcional de 76%, porque e validacao
visual/local e nao muda paridade funcional. Perfil real, persistencia, billing,
assinatura, Supabase/RLS, migrations, PMOC, PDF/share, WhatsApp, suporte real,
seguranca e React Doctor continuam fora do escopo principal ate checkpoint
proprio.

## Atualizacao posterior - Reauditoria matriz UX v1-v2 pos Conta visual

A reauditoria documental da matriz UX v1-v2 foi executada apos o fechamento
visual local de `Conta`:

- relatorio criado em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-conta-design.md`;
- Home Hoje, Equipamentos, Servicos e Conta foram consolidados como areas com
  ciclos visuais recentes no recorte local;
- `Conta` foi mantida como visualmente validada nos 13 cenarios da fase 11;
- a porcentagem geral estimada permanece **76%**, porque a etapa e documental e
  visual, sem nova paridade funcional;
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria;
- Supabase/RLS e migrations permanecem em etapa propria futura, com possibilidade
  de refazer migrations se necessario.

Decisao: o proximo checkpoint seguro e Design System/UI fase 12, com fechamento
documental da primeira passada visual do app-v2, consolidando Home Hoje,
Equipamentos, Servicos e Conta, evidencias de QA, criterios aceitos, limites do
que nao foi coberto e gates para nao reabrir visual sem novo achado objetivo.

Perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations, PMOC,
PDF/share, WhatsApp, suporte real, seguranca e React Doctor continuam fora do
escopo principal ate checkpoint proprio.

## Atualizacao posterior - Reauditoria funcional pos-fechamento visual

A reauditoria funcional documental pos-fechamento visual foi executada:

- relatorio criado em
  `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`;
- Historico/filtros, Relatorios locais, Orcamentos mock/action e Clientes
  filtros/relatorio local foram reconhecidos como candidatos ja executados no
  worktree atual;
- a porcentagem geral estimada permanece **76%**, porque esta etapa nao fez
  recalculo item a item dos 38 itens ponderados;
- ficou definido que puxar runtime novo antes de normalizar a matriz pode
  repetir o erro do v1 de evoluir sem fonte de verdade atualizada.

Decisao: o proximo checkpoint seguro e recalculo documental completo da matriz
UX v1-v2 apos fechamento visual e candidatos nao sensiveis ja executados, sem
alterar runtime.

Perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations, PMOC,
PDF/share, WhatsApp, suporte real, seguranca e React Doctor continuam fora do
escopo principal ate checkpoint proprio.

## Atualizacao posterior - Design System/UI fase 12 fechamento visual

O fechamento documental da primeira passada visual do app-v2 foi executado apos
a reauditoria pos-Conta:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-12-fechamento-primeira-passada.md`;
- Home Hoje, Equipamentos, Servicos e Conta foram consolidados como primeira
  passada visual encerrada no recorte local;
- 76 screenshots de QA visual foram contabilizados nas pastas das fases 3, 4,
  6, 7, 9 e 11;
- foram definidos gates para nao reabrir visual sem overflow, elemento fora da
  viewport, texto cobrindo conteudo, foco invisivel, estado vazio ambigui,
  promessa de integracao real inexistente ou novo fluxo funcional;
- a porcentagem geral estimada permanece **76%**, porque a etapa e documental e
  visual, sem nova paridade funcional.

Decisao: a primeira passada visual nao deve continuar em ciclos repetidos sem
novo achado objetivo. O proximo checkpoint seguro e uma reauditoria funcional
documental pos-fechamento visual para escolher uma unica lacuna nao sensivel
entre Historico/filtros, Relatorios locais, Orcamentos mock/action e Clientes
filtros/relatorio local.

Perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations, PMOC,
PDF/share, WhatsApp, suporte real, seguranca e React Doctor continuam fora do
escopo principal ate checkpoint proprio.
