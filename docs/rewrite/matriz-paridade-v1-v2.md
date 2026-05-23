# Matriz de paridade funcional v1 -> v2

## 1. Objetivo

Registrar a comparacao entre capacidades operacionais existentes no app legado
v1 e equivalentes atuais ou planejados no app-v2.

Esta matriz deve guiar checkpoints futuros do Codex antes de qualquer mudanca
de codigo em `src/app-v2/`.

## 2. Estado inicial

- Branch: `codex/rewrite-zero-react-parallel`.
- HEAD base: `7600c6b674a92e289dca384612d7d2ce3c1da9a5`.
- Escopo deste checkpoint: Registro de Servico.
- Resultado: analise documental, sem implementacao de codigo.

## 3. Registro de Servico

### Fontes v1 analisadas

- `src/features/registro/save/payload.js`
- `src/features/registro/save/persistence.js`
- `src/features/registro/save/postSave.js`
- `src/ui/controller/serviceRegistrationEntry.js`
- `docs/rewrite/etapa-0-inventario-fluxo-tecnico.md`

### Fontes v2 analisadas

- `src/app-v2/service/serviceFlowViewModel.ts`
- `src/app-v2/data/appV2Actions.ts`
- `docs/app-v2-goal.md`

### Matriz

| Capacidade v1                                              | Evidencia v1                                                             | Equivalente v2 atual                                                                           | Status                      | Melhoria permitida                                                       | Validacao necessaria                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| Abrir registro direto a partir de equipamento              | `startServiceRegistration(params)` aceita `equipId`                      | `startServiceFromEquipment(state, equipmentId)`                                                | coberto                     | Manter entrada contextual com visual v2                                  | Teste shell + teste action              |
| Abrir registro sem equipamento com seletor/picker          | `startServiceRegistration` usa `openEquipPicker` quando nao ha `equipId` | escolha de equipamento no app-v2 antes de iniciar o fluxo                                      | coberto                     | Criar escolha de equipamento dentro do fluxo v2 sem copiar picker legado | Teste shell para inicio sem equipamento |
| Orientar criacao de equipamento quando nao ha equipamentos | `mode: create-equipment`                                                 | estado vazio orienta ir para Equipamentos antes do registro                                    | coberto                     | Estado vazio acionavel para criar equipamento antes do registro          | Teste de estado vazio                   |
| Validar equipamento existente                              | `validateRegistroPayloadDraftData` usa `existingEquipamentos`            | `completeService` valida equipamento existente e shell mostra erro local                       | coberto                     | Validacao amigavel antes de concluir                                     | Teste de dominio/action + shell         |
| Validar data obrigatoria e valida                          | `validateRegistroPayload`                                                | `completeService` valida data simples do contrato mockado                                      | coberto                     | Manter data simples no fluxo, sem storage real                           | Teste de payload/action + shell         |
| Validar tipo de servico                                    | `tipo` obrigatorio e `Outro` customizado validado                        | v2 possui opcoes e descricao customizada local para `Outro`                                    | coberto                     | Campo curto para detalhe de `Outro` quando selecionado                   | Teste view model + shell                |
| Validar tecnico obrigatorio                                | v1 exige `tecnico` no fluxo padrao                                       | v2 possui campo local de tecnico no draft e bloqueia revisao sem valor                         | coberto                     | Campo local sem lista global nem storage real                            | Teste de conclusao                      |
| Registrar diagnostico/observacoes                          | `obs` vira `descricaoFinal`                                              | registro mockado preserva diagnostico, acoes e `observacoes` compatível                        | coberto                     | Separar diagnostico, acoes e observacoes no contrato v2                  | Teste action + relatorio                |
| Registrar pecas                                            | `pecas` persistido                                                       | v2 possui campo opcional de pecas no draft, registro mockado e relatorio                       | coberto                     | Campo textual opcional sem custos, estoque ou orcamento real             | Teste view model + action + shell       |
| Registrar custos                                           | `custoPecas` e `custoMaoObra` persistidos                                | v2 possui custos opcionais no draft, registro mockado e relatorio                              | coberto                     | Captura opcional sem virar orcamento real                                | Teste payload + relatorio               |
| Registrar proxima manutencao                               | `proxima` validado e persistido                                          | v2 possui `proximaData` opcional e cria compromisso mockado no fechamento                      | coberto                     | Agendamento simples do proximo compromisso                               | Teste action + shell                    |
| Atualizar status do equipamento apos salvar                | `buildRegistroCreateStateMutation` atualiza `equipamentos.status`        | `completeService` atualiza status do equipamento                                               | coberto                     | Manter regra pura e testavel                                             | Teste action                            |
| Adicionar tecnico novo                                     | v1 atualiza `tecnicos` se tecnico novo nao existe                        | app-v2 acumula tecnico em lista mockada na criacao e edicao                                    | coberto                     | UI/autocomplete e storage real ficam para etapa propria                  | Teste action                            |
| Editar registro existente                                  | `buildRegistroEditStateMutation`                                         | edicao mockada reidrata, salva por `id`, altera equipamento/data e reabre relatorio atualizado | coberto                     | Manter mock local ate etapa propria de storage real                      | Teste action + view model + shell       |
| Manter historico automaticamente                           | v1 adiciona registro em `state.registros`                                | `completeService` adiciona registro no mock                                                    | coberto                     | Exibir historico consultavel por Servicos                                | Teste shell                             |
| Pos-salvamento com PDF/WhatsApp/toast/fallback             | `notifyRegistroCreateSaved` e `runRegistroDirectShareAfterSave`          | v2 tem preview/print simples e relatorios mockados                                             | parcial                     | Manter relatorio local; WhatsApp/PDF real em etapa sensivel              | Teste relatorio + plano sensivel        |
| Prompt de proxima preventiva apos salvar                   | `runRegistroPreventivaPromptAfterSave`                                   | v2 usa campo `Proxima manutencao` dentro do fluxo e cria compromisso mockado no fechamento     | coberto por substituição v2 | Nao recriar prompt pos-salvamento do v1 sem necessidade                  | Teste action + shell                    |

## 4. Lacunas prioritarias

1. Falta suporte a `proxima` no contrato do draft.
2. Agendamento de proximo compromisso existe como action, mas nao esta ligado ao
   fechamento do fluxo.
3. Pos-salvamento do v1 tinha WhatsApp/PDF/fallback; no v2 isso deve permanecer
   isolado como area sensivel, mas a capacidade de abrir/reabrir relatorio deve
   continuar coberta.

## 5. Melhorias recomendadas

### Melhoria estrutural

- Separar contrato de draft do Registro de Servico em campos mais proximos do v1
  antes de ligar novas telas.
- Criar testes de equivalencia para payload minimo antes de migrar campos
  adicionais.

### Melhoria funcional

- Criar escolha de equipamento quando o registro nasce sem contexto.
- Criar etapa de fechamento com `Ver relatorio`, `Agendar proximo compromisso`
  e `Voltar para Servicos`, mantendo orcamento como backlog controlado.

### Melhoria visual

- Manter fluxo por etapas do app-v2, sem retornar ao formulario longo do v1.
- Exibir campos adicionais por grupos progressivos para nao piorar uso em campo.

### Areas sensiveis

- PDF/share legado.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Billing/cotas.
- Assinatura.
- PMOC.

## 6. Checkpoint concluido - Inicio sem equipamento

O app-v2 passou a cobrir a primeira lacuna de paridade do Registro de Servico:

- iniciar registro sem contexto abre uma escolha de equipamentos;
- quando nao ha equipamentos, o app orienta ir para Equipamentos antes do
  registro;
- abertura direta por equipamento continua preservada.

## 7. Checkpoint concluido - Tecnico operacional

O app-v2 passou a cobrir a lacuna de tecnico no Registro de Servico:

- `ServiceDraft` possui tecnico local;
- a etapa de execucao exige tecnico, diagnostico e acoes antes da revisao;
- revisao, conclusao, relatorio imediato e lista de registros recentes exibem o
  tecnico informado;
- a conclusao mockada deixou de injetar `Tecnico app-v2` no shell.

## 8. Checkpoint concluido - Outro customizado

O app-v2 passou a cobrir a lacuna de descricao customizada para `Outro` no
Registro de Servico:

- `ServiceDraft` possui `customKind`;
- selecionar `Outro` exibe campo local de descricao;
- a etapa de tipo bloqueia avanco quando `Outro` esta vazio ou acima de 40
  caracteres;
- revisao, conclusao, relatorio imediato, registro mockado, registros recentes
  e relatorios reabertos exibem `Outro · descricao`;
- a descricao fica em `tipoDescricao` opcional no mock app-v2, sem storage real.

## 9. Checkpoint concluido - Pecas usadas

O app-v2 passou a cobrir a lacuna de pecas usadas no Registro de Servico:

- `ServiceDraft` possui `partsUsed` opcional;
- a etapa de execucao exibe campo opcional `Pecas usadas`;
- revisao, conclusao, relatorio imediato, registro mockado, registros recentes
  e relatorios reabertos preservam pecas quando informadas;
- a busca de relatorios considera pecas usadas;
- custos, estoque, orcamento real e storage real permaneceram fora do escopo.

## 10. Proximo checkpoint recomendado

Implementar apenas a proxima lacuna do Registro de Servico:

> Peças usadas devem virar campo opcional do Registro de Servico no app-v2, sem
> custos, sem orcamento real e sem storage real.

Escopo sugerido:

- app-v2 apenas;
- sem storage real;
- sem PDF/share;
- sem WhatsApp real;
- sem alterar package/config;
- testes focados em draft, revisao, conclusao, registro mockado e relatorio.

Esse checkpoint preserva paridade v1 sem abrir areas sensiveis.

Atualizacao apos conclusao deste checkpoint: o proximo checkpoint recomendado
passa a ser custos de pecas e mao de obra como campos opcionais do Registro de
Servico no app-v2, sem orcamento real, sem billing e sem storage real.

## 11. Checkpoint em andamento - Custos opcionais

Escopo aprovado para o checkpoint atual:

- preservar `custoPecas` e `custoMaoObra` do v1 como campos opcionais no
  Registro de Servico app-v2;
- manter os valores no draft, revisao, conclusao, registro mockado, recentes,
  busca e relatorio;
- nao gerar orcamento real, billing, estoque, storage real, PDF/share ou
  WhatsApp real;
- validar com TDD focado antes da implementacao.

## 12. Checkpoint concluido - Custos opcionais

O app-v2 passou a cobrir a lacuna de custos do Registro de Servico:

- `ServiceDraft` possui `partsCost` e `laborCost` opcionais;
- a etapa de execucao exibe campos opcionais `Custo de pecas` e
  `Custo de mao de obra`;
- revisao, conclusao, relatorio imediato, registro mockado, registros recentes
  e relatorios reabertos preservam os custos quando informados;
- a busca de relatorios considera custos informados;
- orcamento real, billing, estoque, storage real, PDF/share e WhatsApp real
  permaneceram fora do escopo.

## 13. Proximo checkpoint recomendado

Implementar apenas a proxima lacuna do Registro de Servico:

> Proxima manutencao deve virar campo opcional do Registro de Servico no
> app-v2, conectando-se ao agendamento mockado ja existente, sem calendario
> completo, sem recorrencia avancada e sem storage real.

## 14. Checkpoint concluido - Proxima manutencao

O app-v2 passou a cobrir a lacuna de proxima manutencao no Registro de
Servico:

- `ServiceDraft` possui `nextMaintenanceDate` opcional;
- a etapa de execucao exibe campo opcional de data para proxima manutencao;
- revisao, conclusao, relatorio imediato, registro mockado, registros recentes
  e relatorios reabertos preservam a data quando informada;
- `completeService` grava `proximaData` e cria compromisso mockado
  `preventiva` com `origem: "registro"` para o mesmo equipamento;
- calendario completo, recorrencia avancada, notificacoes, storage real,
  PDF/share e WhatsApp real permaneceram fora do escopo.

## 15. Proximo checkpoint recomendado

Implementar apenas a proxima lacuna pequena do Registro de Servico:

> Validacao amigavel de equipamento e data do Registro de Servico no app-v2,
> sem alterar router, storage real, contratos legados ou areas sensiveis.

Escopo sugerido:

- app-v2 apenas;
- validar equipamento existente antes de concluir;
- validar data simples do registro no contrato mockado;
- manter erros como mensagens locais do fluxo v2, sem storage real;
- testes focados em action, view model e shell.

## 16. Checkpoint concluido - Validacao amigavel de equipamento e data

O app-v2 passou a cobrir as lacunas de validacao basica do Registro de Servico:

- `completeService` bloqueia conclusao quando o equipamento do draft nao existe
  mais no snapshot mockado;
- `completeService` bloqueia conclusao quando a data mockada do registro esta
  ausente ou nao segue data calendario simples em formato `YYYY-MM-DD`;
- o shell do app-v2 valida antes de avancar da revisao para finalizado e exibe
  mensagem local amigavel no proprio fluxo;
- o fluxo valido de conclusao permanece preservado.

Areas mantidas fora do escopo:

- storage real;
- router novo;
- contratos legados;
- PDF/share;
- WhatsApp real;
- billing, assinatura, Supabase/RLS, permissoes e PMOC.

Testes executados:

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 30 testes.

## 17. Proximo checkpoint recomendado

Implementar apenas a proxima lacuna pequena do Registro de Servico:

> Separar diagnostico e acoes executadas no registro mockado e no relatorio
> local do app-v2, preservando a compatibilidade de `observacoes` e sem tocar
> storage real, PDF/share, WhatsApp real, router ou contratos legados.

Escopo sugerido:

- app-v2 apenas;
- manter `observacoes` como texto de compatibilidade quando necessario;
- expor diagnostico e acoes como campos distintos no registro mockado e
  relatorio local;
- criar/atualizar testes de action e relatorio local;
- nao alterar layout estrutural nem copiar UI/CSS legado.

## 18. Checkpoint concluido - Diagnostico e acoes separados

O app-v2 passou a cobrir a lacuna de diagnostico/observacoes do Registro de
Servico:

- `RegistroServico` mockado possui `diagnostico` e `acoesExecutadas`
  opcionais;
- `completeService` preenche os campos separados e mantem `observacoes`
  concatenada como compatibilidade;
- relatorio reaberto prefere `diagnostico` e `acoesExecutadas` quando
  existirem;
- registros antigos apenas com `observacoes` continuam tendo fallback no
  relatorio local.

Areas mantidas fora do escopo:

- storage real;
- router novo;
- contratos legados;
- PDF/share;
- WhatsApp real;
- billing, assinatura, Supabase/RLS, permissoes e PMOC;
- design visual e CSS legado.

Testes executados:

- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 24 testes.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 39 testes.

## 19. Proximo checkpoint recomendado

As lacunas restantes do Registro de Servico nao devem continuar
automaticamente neste goal sem decisao humana, porque entram em gate:

> Definir contrato aprovado para uma das lacunas restantes: tecnico global,
> edicao de registro existente, prompt de proxima preventiva, ou
> pos-salvamento PDF/WhatsApp real.

Motivo:

- tecnico global depende de contrato/lista e pode tocar storage futuro;
- edicao de registro existente e maior que um checkpoint pequeno;
- prompt de proxima preventiva envolve decisao de UX;
- PDF/share e WhatsApp real sao areas sensiveis.

## 20. Checkpoint concluido - Edicao de Registro fase 1 mockada

O app-v2 passou a cobrir a primeira fatia segura de edicao de registro
existente:

- `createServiceDraftFromRecord` reidrata `ServiceDraft` a partir de
  `RegistroServico`;
- registros antigos apenas com `observacoes` continuam gerando draft por
  fallback;
- `updateServiceRecord` atualiza registro existente por `id`;
- a edicao preserva `id` e nao duplica item em `registros`;
- equipamento inexistente e data invalida continuam bloqueados pela validacao
  compartilhada;
- o shell reaproveita o fluxo visual existente para editar um registro recente
  do mock local, sem router novo e sem CSS legado.

Campos cobertos nesta fase:

- equipamento preservado;
- data preservada pelo draft de edicao;
- tipo e `Outro` customizado;
- tecnico;
- diagnostico;
- acoes executadas;
- `observacoes` como compatibilidade;
- pecas usadas;
- custos;
- proxima manutencao;
- status final.

Areas mantidas fora do escopo:

- storage real;
- router novo;
- contratos legados;
- PDF/share real;
- WhatsApp real;
- billing, assinatura, cotas, Supabase/RLS, permissoes e PMOC;
- novo design visual e CSS legado.

Testes executados:

- `npm test -- src/app-v2/service/serviceFlowViewModel.test.ts --run`
  passou com 10 testes.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts --run`
  passou com 27 testes.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 16
  testes.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 52 testes.
- `npm run format`: passou.
- `npm run build`: passou com warnings Vite conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos no build.
- `git diff --check`: passou.

## 21. Proximo checkpoint recomendado

> Edicao de Registro fase 2: definir UX aprovada para alterar equipamento e
> data dentro do fluxo de edicao, ou limitar explicitamente a fase 2 a uma
> fatia sem UI nova.

Motivo:

- a fase 1 preserva equipamento/data, mas nao cria controles visuais novos para
  altera-los;
- alterar equipamento ou data no fluxo exige decisao de UX/posicionamento;
- qualquer evolucao alem da action/mock deve evitar novo design improvisado.

## 22. Checkpoint concluido - Edicao de Registro fase 2 equipamento e data

O app-v2 passou a cobrir a edicao mockada completa de registro existente dentro
do escopo seguro aprovado:

- a etapa de contexto do fluxo de edicao exibe a data do registro com input
  simples `type="date"`, reaproveitando o padrao visual ja usado para datas;
- a troca de equipamento em modo edicao reaproveita `ServiceEquipmentChoice`,
  o mesmo padrao/lista usado no inicio de Registro de Servico sem contexto;
- ao selecionar outro equipamento, o draft de edicao retorna ao fluxo atual sem
  router novo, sem picker novo e sem CSS legado;
- `updateServiceRecord` preserva `id`, nao duplica historico e grava novo
  `equipamentoId` e nova `data`;
- relatorio imediato e relatorio reaberto refletem equipamento e data editados;
- diagnostico, acoes, pecas, custos, proxima manutencao e fallback de
  `observacoes` continuam preservados;
- validacao de equipamento existente e data obrigatoria/valida continua
  compartilhada.

Areas mantidas fora do escopo:

- storage real;
- router novo obrigatorio;
- PDF/share real;
- WhatsApp real;
- billing, assinatura, cotas, Supabase/RLS, permissoes e PMOC;
- CSS global, CSS legado, tema/tokens e design final novo;
- recomputacao historica complexa de status do equipamento antigo.

Testes executados:

- `npm test -- src/app-v2/service/serviceReportViewModel.test.ts --run`
  passou com 10 testes.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 17
  testes.
- `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/serviceReportViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 55 testes.

## 23. Proximo checkpoint recomendado

> Contrato documental de tecnico global no app-v2, sem storage real.

Motivo:

- a unica lacuna restante marcada como `fora desta etapa` no Registro de
  Servico e `Adicionar tecnico novo`;
- no v1, salvar registro pode alimentar a lista de tecnicos;
- no app-v2 ainda nao existe lista global de tecnicos nem storage real;
- a fatia segura e documentar o contrato desejado antes de qualquer estado
  global, storage, permissao ou UX nova.

## 24. Checkpoint concluido - Contrato documental de tecnico global

O contrato de tecnico global do app-v2 foi definido em
`docs/rewrite/contrato-tecnico-global-app-v2.md`.

Decisoes registradas:

- a paridade segura com v1 deve comecar por lista mockada `tecnicos: string[]`;
- concluir ou editar Registro de Servico pode adicionar tecnico nao vazio ao
  mock local;
- deduplicacao inicial deve ser por texto apos `trim`, preservando a primeira
  grafia cadastrada;
- autocomplete, UI de lista, storage real, Supabase/RLS, permissoes, perfil,
  migracao e PDF/share ficam fora do escopo.

## 25. Proximo checkpoint recomendado

> Tecnico global fase 1 mockada: acumular tecnico informado em lista mockada no
> app-v2 durante criacao e edicao de Registro de Servico, sem UI nova e sem
> storage real.

## 26. Checkpoint concluido - Tecnico global fase 1 mockada

O app-v2 passou a cobrir a paridade segura de adicionar tecnico novo no mock
local:

- `AppV2MockData` possui `tecnicos: string[]`;
- `createAppV2MockSnapshot` clona a lista mockada de tecnicos;
- `completeService` adiciona o tecnico informado ao mock local quando ainda nao
  existe;
- `updateServiceRecord` tambem adiciona o tecnico editado ao mock local;
- a regra usa `trim`, ignora nomes vazios e nao duplica nomes existentes;
- nao houve UI nova, autocomplete, storage real, Supabase/RLS, permissoes,
  perfil, PDF/share ou WhatsApp.

Testes executados:

- `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 20 testes.

## 27. Proximo checkpoint recomendado

> Definir contrato controlado para prompt de proxima preventiva pos-salvamento
> no app-v2, sem implementar UX nova.

Motivo:

- a matriz ainda marca o prompt de proxima preventiva como parcial;
- o app-v2 ja cria compromisso mockado quando a data e informada durante o
  fluxo;
- reproduzir o prompt pos-salvamento do v1 exige decisao de UX;
- a unica fatia segura sem decisao visual e documentar o contrato e limites
  antes de qualquer UI nova.

## 28. Checkpoint concluido - Contrato de proxima preventiva pos-salvamento

O contrato para evoluir o prompt de proxima preventiva foi documentado em
`docs/rewrite/contrato-proxima-preventiva-pos-salvamento-app-v2.md`.

Decisoes registradas:

- o app-v2 ja cobre agendamento mockado quando `nextMaintenanceDate` e
  informado durante o fluxo;
- prompt pos-salvamento futuro deve evitar compromisso duplicado;
- confirmar, alterar ou recusar proxima preventiva depende de decisao de UX;
- UI nova, modal/drawer, storage real, notificacao/calendario real, PDF/share,
  WhatsApp, billing, Supabase/RLS, permissoes e PMOC ficam fora do escopo.

## 29. Proximo checkpoint recomendado

> Decisao humana de UX para prompt de proxima preventiva pos-salvamento, ou
> aprovar explicitamente manter apenas o campo `Proxima manutencao` dentro do
> fluxo como comportamento final do app-v2.

## 30. Decisao complementar - UX funcional v1 com UI minima v2

A decisao de produto aprovada separa UX funcional de design visual:

- o v1 continua sendo fonte de verdade para comportamento operacional,
  sequencia de uso, campos, validacoes, estados vazios, edicao, historico,
  relatorio, reabertura, fallback, side effects mockados e mensagens
  funcionais;
- o app-v2 continua sendo fonte de verdade para shell, estrutura, componentes
  e UI minima neutra;
- CSS, layout, componentes visuais, modais antigos, prompts problematicos,
  PDF/share, WhatsApp real, storage real e acoplamentos do v1 nao devem ser
  copiados.

Com essa decisao, o prompt de proxima preventiva pos-salvamento deixa de ser
pendencia funcional obrigatoria. A capacidade util do v1 fica coberta por
substituicao v2: o tecnico informa `Proxima manutencao` dentro do fluxo de
Registro de Servico, e o app-v2 cria compromisso mockado no fechamento.

Status atualizado:

- `Prompt de proxima preventiva apos salvar`: `coberto por substituição v2`.
- PDF/share real, WhatsApp real, notificacoes, calendario real e recorrencia
  avancada continuam como integracoes sensiveis futuras.

## 31. Matriz geral de UX funcional v1 -> app-v2

| Fluxo                                 | Comportamento v1 util                                                                                                                          | Fontes v1 analisadas                                                                                     | Equivalente v2 atual                                                                                              | Lacunas                                                    | Decisao v2                                                        | Escopo permitido       | Escopo proibido                                   | Testes necessarios                   | Status                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------- | ------------------------------------------------- | ------------------------------------ | --------------------------- |
| Registro de Servico                   | Criar, validar, concluir, editar, alimentar historico, relatorio e proxima preventiva                                                          | `src/features/registro/save/*`, `src/ui/views/registro.js`                                               | Fluxo progressivo app-v2 com mock local, edicao e relatorio local                                                 | PDF/WhatsApp real fora                                     | Preservar fluxo por etapas e substituir prompt por campo interno  | app-v2/mock/testes     | storage, PDF/share, WhatsApp, PMOC                | action, view model, shell, relatorio | coberto                     |
| Historico de Servicos                 | Listar registros, consultar por equipamento/cliente e abrir relatorio/registro                                                                 | `src/features/historico/*`, `src/ui/viewModels/historicoViewModel.js`                                    | `Servicos > Registros` lista recentes, permite busca local e permite editar/reabrir relatorio por caminhos locais | filtros por periodo/cliente dedicados ainda limitados      | Evoluir dentro de Servicos, sem aba global nova                   | view model e UI minima | router novo, storage real, PMOC                   | view model + shell                   | parcial                     |
| Relatorios                            | Gerar visao por registros, filtrar e reabrir documento                                                                                         | `src/ui/views/relatorio.js`, `src/ui/viewModels/relatorioViewModel.js`                                   | `Servicos > Relatorios` com busca, KPIs, preview e print local                                                    | PDF/share/WhatsApp real fora                               | Relatorio local cobre leitura; integracoes ficam sensiveis        | relatorio local/mock   | PDF/share real, WhatsApp real                     | relatorio + shell                    | parcial                     |
| Equipamentos                          | Listar, consultar detalhe, status, cliente/local, criar/editar e iniciar servico                                                               | `src/ui/viewModels/equipamentosViewModel.js`, `src/features/equipamentos/*`                              | Area Equipamentos com lista, detalhe, cliente/local, criar/editar mockado e iniciar servico                       | estado vazio/onboarding e campos avancados ainda limitados | Preservar equipamento como centro operacional                     | mock/local/UI minima   | storage real, Supabase/RLS                        | equipment action + shell             | parcial                     |
| Clientes                              | Listar, abrir detalhe, ver equipamentos vinculados, consultar servicos relacionados, criar e editar cadastro basico                            | `src/core/clientes.js`, `src/ui/viewModels/clientes*`, `src/ui/viewModels/equipamentosViewModel.js`      | Clientes como subvisao de Equipamentos com detalhe, equipamentos vinculados, servicos relacionados e CRUD mockado | relatorio/filtro dedicado por cliente limitados            | Cliente continua subvisao forte, nao aba global                   | mock/local/UI minima   | storage real, PMOC, Supabase/RLS                  | clients action + shell               | parcial                     |
| Alertas e proximas acoes              | Priorizar status critico, falta de historico critico, preventiva vencida/proxima, reincidencia corretiva, criticidade e prioridade operacional | `src/domain/maintenance.js`, `src/domain/constants/alerts.js`, `src/ui/viewModels/dashboardViewModel.js` | Home operacional consome `buildHomeAlerts`, prioriza alerta critico, exibe contador e lista curta de alertas      | notificacao/calendario real fora; regras avancadas futuras | Migrar como dominio puro/mock antes de integracoes reais          | dominio puro + mock    | notificacao real, calendario real, storage        | home priority tests + shell          | coberto por substituicao v2 |
| Orcamentos                            | Acompanhar pipeline, vincular cliente/equipamento/registro e resumir valores                                                                   | `src/ui/viewModels/orcamentosViewModel.js`, `src/domain/orcamentoFollowUp.js`                            | Subvisao `Servicos > Orcamentos` com lista mockada e KPIs locais                                                  | criar/editar/assinar/baixar/enviar fora                    | Primeira fase so acompanha mock local                             | view model + UI minima | billing, assinatura, PDF/share, WhatsApp, storage | view model + shell                   | parcial                     |
| Configuracoes operacionais simples    | Atalhos e preferencias operacionais                                                                                                            | `src/ui/views/configuracoes.js`                                                                          | `Conta` com atalhos locais, preferencias em memoria, microcopy, estados locais e ajustes de acessibilidade        | perfil real, persistencia, billing e PMOC fora             | Encerrar ciclo mock/local e manter integracoes em etapas proprias | doc/view model/shell   | billing, assinatura, storage real, Supabase, PMOC | shell/account tests                  | coberto por substituicao v2 |
| Estados vazios e onboarding funcional | Orientar primeiro cadastro/primeiro atendimento                                                                                                | `src/ui/viewModels/dashboardViewModel.js`, `src/features/equipamentos/*`                                 | Estado vazio de Servicos orienta criacao e inicia registro apos primeiro equipamento mockado                      | onboarding completo ainda limitado                         | Usar mensagens locais e CTA contextual                            | UI minima              | redesign final                                    | shell                                | parcial                     |
| Pos-salvamento local                  | Oferecer saidas apos salvar e fallback                                                                                                         | `src/features/registro/save/postSave.js`                                                                 | Done state com relatorio local, proxima manutencao no fluxo e historico atualizado                                | orcamento a partir do fechamento ainda nao implementado    | Substituir prompts por saidas v2 progressivas                     | mock/local             | PDF/share real, WhatsApp real                     | shell + action                       | parcial                     |

## 32. Checkpoint concluido - Orcamentos mockados dentro de Servicos

O app-v2 passou a cobrir a primeira fatia segura de Orçamentos:

- `Servicos` ganhou subvisao `Orcamentos` sem virar aba principal global;
- `servicesQuotesViewModel` lista orcamentos mockados com numero, titulo,
  cliente, equipamento, status e total;
- a subvisao exibe KPIs locais de ativos, aprovados e pipeline;
- o estado vazio orienta apenas etapa mock/local futura;
- dados mockados incluem um orcamento de exemplo vinculado a cliente,
  equipamento e registro;
- nenhuma acao sensivel de PDF/share, WhatsApp, assinatura, billing, storage
  real, Supabase/RLS ou PMOC foi implementada.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 20 testes.

## 33. Proximo checkpoint recomendado

> Historico de Servicos fase 1: adicionar busca/filtro local simples em
> `Servicos > Registros` por equipamento, cliente, tecnico e texto do registro,
> sem router novo, sem storage real e sem copiar UI do historico legado.

## 34. Checkpoint concluido - Historico de Servicos fase 1 busca local

O app-v2 passou a cobrir a primeira fatia segura de consulta do Historico dentro
de `Servicos > Registros`:

- `buildServicesHomeViewModel` aceita query local opcional;
- a busca normaliza acentos e filtra por equipamento, cliente, local, tipo,
  tecnico, diagnostico, acoes, observacoes, pecas e custos;
- a tela `Servicos > Registros` ganhou input simples `Buscar registros`;
- quando a busca nao encontra resultados, exibe mensagem local
  `Nenhum registro encontrado.`;
- nao houve router novo, storage real, filtros avancados, tela de historico
  legada, CSS legado ou integracao sensivel.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 28 testes.

## 35. Proximo checkpoint recomendado

> Clientes fase 2: exibir servicos relacionados no detalhe de Cliente usando
> registros mockados existentes, sem PMOC, sem storage real, sem router novo e
> sem criar design novo.

## 36. Checkpoint concluido - Clientes fase 2 servicos relacionados mockados

O app-v2 passou a cobrir a consulta local de servicos relacionados no detalhe de
Cliente:

- `buildEquipmentClientDetailViewModel` deriva registros de servico a partir dos
  equipamentos vinculados ao cliente;
- os servicos relacionados sao ordenados por data mais recente;
- cada item exibe equipamento, tipo, data, status e resumo tecnico;
- o detalhe de Cliente ganhou secao simples `Servicos relacionados`, usando
  componentes ja existentes do app-v2;
- o estado vazio permanece local e mockado;
- nao houve PMOC, storage real, router novo, PDF/share, WhatsApp real, billing,
  Supabase/RLS, CSS legado ou design novo.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 23 testes.

## 37. Proximo checkpoint recomendado

> Alertas e proximas acoes fase 1: mapear na matriz as regras v1 de alertas de
> cliente, preventiva vencida/proxima e criticidade contra a Home operacional
> atual do app-v2, antes de implementar qualquer nova UI.

## 38. Checkpoint concluido - Alertas e proximas acoes fase 1 mapeamento

Mapeamento funcional concluido sem alteracao de codigo:

- v1 usa `buildMaintenanceAlerts` em `src/domain/maintenance.js` para gerar
  alertas por equipamento;
- a ordenacao v1 considera `ALERT_SEVERITY_WEIGHT`, `sortScore`, criticidade,
  prioridade operacional, score de saude e dias de atraso;
- alertas v1 cobertos no mapeamento: equipamento fora de operacao, equipamento
  critico/alta prioridade sem historico, preventiva vencida, preventiva
  proxima e acompanhamento por reincidencia de ocorrencias/corretivas;
- `src/ui/viewModels/dashboardViewModel.js` compoe contexto de cliente/setor,
  KPIs, recencia e acoes de dashboard a partir desses sinais;
- app-v2 hoje cobre apenas a fatia de Home operacional em
  `src/app-v2/domain/homePriority.ts` e `src/app-v2/home/homeViewModel.ts`:
  compromissos vencidos/hoje, equipamento sem primeiro servico, fila curta e
  contadores locais;
- a lacuna segura restante e portar a priorizacao de alertas para dominio puro
  do app-v2, usando mocks existentes, antes de qualquer nova UI.

Areas mantidas fora do escopo:

- notificacao real, calendario real, storage real, Supabase/RLS, PMOC,
  PDF/share, WhatsApp real, billing, assinatura, router novo, CSS legado e
  design novo.

Validacao executada neste checkpoint documental:

- `npm run format:check`
- `git diff --check`

## 39. Proximo checkpoint recomendado

> Alertas e proximas acoes fase 2: criar dominio puro/testado no app-v2 para
> priorizar alertas mockados por status critico, preventiva vencida/proxima,
> falta de historico em equipamento critico e reincidencia corretiva, sem nova
> UI, sem storage real e sem notificacoes/calendario reais.

## 40. Checkpoint concluido - Alertas e proximas acoes fase 2 dominio puro

O app-v2 passou a ter uma primeira regra pura de alertas mockados:

- `buildHomeAlerts` gera alertas por equipamento a partir de equipamentos,
  compromissos, registros e data atual;
- cobre status critico, compromisso vencido, compromisso proximo, equipamento
  critico/alta prioridade sem historico e reincidencia corretiva;
- ordena por severidade e score operacional local;
- mantem `pickNextHomeAction` sem regressao;
- nao conecta UI, storage real, notificacao real, calendario real, PMOC,
  PDF/share, WhatsApp real, billing, assinatura, Supabase/RLS ou router.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/domain/homePriority.test.ts --run`
  passou com 6 testes.

## 41. Proximo checkpoint recomendado

> Alertas e proximas acoes fase 3: consumir `buildHomeAlerts` no view model da
> Home para alimentar indicadores/estado operacional com os alertas mockados,
> reaproveitando UI atual e sem criar novo layout.

## 42. Checkpoint concluido - Alertas e proximas acoes fase 3 Home view model

A Home do app-v2 passou a consumir os alertas puros:

- `buildHomeTodayViewModel` chama `buildHomeAlerts`;
- o resumo rapido e o resumo lateral contam alertas ativos, nao apenas
  compromissos vencidos;
- `critical_status` passa a comandar a proxima acao quando houver equipamento
  fora de operacao;
- a fila curta de compromissos continua intacta;
- alertas criticos nao duplicam alerta de compromisso do mesmo equipamento;
- nao houve layout novo, CSS novo, storage real, notificacao real, calendario
  real, PMOC, PDF/share, WhatsApp real, billing, assinatura ou Supabase/RLS.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/domain/homePriority.test.ts --run`
  passou com 9 testes.

## 43. Proximo checkpoint recomendado

> Alertas e proximas acoes fase 4: exibir uma lista curta de alertas ativos na
> Home usando componentes existentes, sem criar design final, sem notificacoes
> reais e sem storage real.

## 44. Checkpoint concluido - Alertas e proximas acoes fase 4 lista curta

A Home do app-v2 passou a exibir a primeira UX funcional de alertas ativos:

- `HomeTodayViewModel` expoe uma lista curta de alertas ativos;
- `HomeToday` renderiza `Alertas ativos` no aside atual, usando componentes
  existentes;
- cada alerta mostra titulo, equipamento, detalhe e status;
- clique no alerta reaproveita abertura de detalhe de equipamento;
- testes de shell confirmam a renderizacao sem PMOC;
- a prioridade de inicio de servico foi atualizada para equipamento critico
  quando houver `critical_status`.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/domain/homeAlerts.test.ts src/app-v2/home/homeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 28 testes.

## 45. Proximo checkpoint recomendado

> Equipamentos fase 1: mapear criar/editar equipamento mockado do v1 contra o
> app-v2 e implementar a menor fatia segura de formulario/dominio local, sem
> storage real, sem Supabase/RLS e sem design final.

## 46. Checkpoint concluido - Equipamentos fase 1 criar/editar mock local

O app-v2 passou a cobrir a primeira fatia segura de criacao/edicao de
Equipamentos:

- `saveEquipment` cria equipamento no snapshot mockado com nome, local, tipo,
  tag, cliente, status e campos operacionais basicos;
- nome e local sao obrigatorios e retornam mensagens locais amigaveis;
- edicao atualiza por `id`, preserva `id` e nao duplica a lista;
- edicao minima preserva campos operacionais existentes que a UI simples nao
  edita;
- `Equipamentos` ganhou `Novo equipamento` com formulario neutro usando
  primitives do app-v2;
- detalhe de Equipamento ganhou `Editar equipamento` reaproveitando o mesmo
  formulario;
- nenhuma integracao sensivel foi tocada: storage real, Supabase/RLS, router
  novo, upload/fotos, billing, PMOC, PDF/share e WhatsApp real ficaram fora.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 30 testes.

## 47. Proximo checkpoint recomendado

> Equipamentos fase 2: mapear e implementar estado vazio/onboarding funcional
> de primeiro equipamento conectado ao fluxo de Registro de Servico, usando o
> mesmo formulario mockado, sem storage real, sem router novo e sem design
> final.

## 48. Checkpoint concluido - Equipamentos fase 2 onboarding do primeiro equipamento

O estado vazio de Registro de Servico foi conectado ao cadastro mockado do
primeiro equipamento:

- ao iniciar registro sem equipamentos, o usuario continua vendo a orientacao
  para ir a Equipamentos;
- se esse caminho foi usado, salvar o primeiro equipamento abre
  automaticamente o Registro de Servico desse equipamento;
- a criacao normal pela area Equipamentos continua apenas adicionando o item na
  lista;
- o fluxo usa somente estado/mock local e reaproveita `saveEquipment` e
  `startServiceFromEquipment`;
- nao houve router novo, storage real, Supabase/RLS, PMOC, PDF/share,
  WhatsApp real, billing, upload/fotos, CSS legado ou design final.

Testes executados neste checkpoint:

- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/equipment/equipmentActions.test.ts --run`
  passou com 31 testes.

## 49. Proximo checkpoint recomendado

> Clientes fase 3: criar/editar Cliente mockado com UI minima dentro de
> Equipamentos > Clientes, preservando subvisao atual, sem storage real,
> Supabase/RLS, PMOC, router novo ou design final.

## 50. Checkpoint concluido - Clientes fase 3 criar/editar mock local

O app-v2 passou a cobrir a primeira fatia segura de criacao/edicao de Clientes:

- `saveClient` cria cliente no snapshot mockado com nome e campos cadastrais
  opcionais;
- nome e obrigatorio e retorna mensagem local amigavel;
- edicao atualiza por `id`, preserva `id` e nao duplica a lista;
- `Equipamentos > Clientes` ganhou `Novo cliente` com formulario neutro usando
  primitives do app-v2;
- detalhe de Cliente ganhou `Editar cliente` reaproveitando o mesmo formulario;
- nenhuma integracao sensivel foi tocada: storage real, Supabase/RLS, router
  novo, PMOC, PDF/share, WhatsApp real, billing, upload e CSS legado ficaram
  fora.

Validacao executada neste checkpoint:

- `npm run typecheck -- --pretty false` passou.
- `npm run build` passou com warnings Vite/chunk conhecidos.
- `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

Validacao bloqueada neste ambiente:

- `npm test -- src/app-v2/equipment/clientActions.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  falhou isoladamente antes de executar testes porque o Vite/esbuild retornou
  `Error: spawn EPERM`; a suite completa dentro de `npm run check` carregou e
  passou.

## 51. Proximo checkpoint recomendado

> Clientes fase 4: vincular cliente recem-criado ao formulario de Equipamento
> com UX minima, mantendo tudo mock/local e sem storage real, Supabase/RLS,
> PMOC, router novo ou design final.

## 52. Checkpoint concluido - Clientes fase 4 vinculo com equipamento

O app-v2 passou a reduzir a friccao entre cadastro de Cliente e cadastro de
Equipamento:

- detalhe de Cliente ganhou `Criar equipamento para este cliente`;
- o shell abre `Novo equipamento` com o Cliente selecionado no formulario;
- o equipamento salvo fica vinculado ao Cliente recem-criado no mock local;
- o fluxo reaproveita `EquipmentForm` e `saveEquipment`;
- nenhuma integracao sensivel foi tocada: storage real, Supabase/RLS, router
  novo, PMOC, PDF/share, WhatsApp real, billing, upload e CSS legado ficaram
  fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque o
  botao `Criar equipamento para este cliente` ainda nao existia.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 29
  testes.
- Validacao focada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/equipment/clientActions.test.ts src/app-v2/equipment/equipmentActions.test.ts --run`
  passou com 39 testes.
- Validacao geral:
  `npm run format`, `npm run typecheck -- --pretty false`,
  `npm run format:check`, `git diff --check`, `npm run build` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 53. Proximo checkpoint recomendado

> Clientes fase 5: mapear filtros/consulta dedicada por Cliente ou relatorio
> local por Cliente antes de qualquer nova UI, sem PMOC, storage real,
> Supabase/RLS, router novo, PDF/share ou WhatsApp real.

## 54. Checkpoint concluido - Clientes fase 5 consulta e relatorio local

O app-v2 passou a cobrir a fatia segura de consulta operacional por Cliente:

- contrato documental criado em
  `docs/rewrite/clientes-fase-5-consulta-relatorio-local.md`;
- `Equipamentos > Clientes` ganhou busca local por Cliente, documento, contato,
  endereco, equipamento vinculado e texto de servico relacionado;
- filtros locais adicionados: todos, com pendencia, criticos e sem primeiro
  servico;
- detalhe de Cliente ganhou `Resumo local do cliente` com equipamentos,
  servicos, pendencias e ultimo servico;
- Cliente continua subvisao forte dentro de Equipamentos, sem virar quinta area
  global;
- nenhuma integracao sensivel foi tocada: PMOC, storage real, Supabase/RLS,
  migrations, PDF/share, WhatsApp real, billing, upload e CSS legado ficaram
  fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts --run`
  falhou por ausencia de `query`, filtros e `localReport`.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  de `client-search` e do resumo local.
- GREEN:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts --run`
  passou com 6 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 31
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/equipment/equipmentClientsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 37 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 55. Proximo checkpoint recomendado

> Historico/filtros em `Servicos > Registros`, ainda mock/local, sem storage
> real, PMOC, PDF/share ou WhatsApp real.

## 56. Checkpoint concluido - Servicos Registros filtros locais

O app-v2 passou a cobrir a fatia segura de filtros locais do historico de
servicos:

- contrato documental criado em
  `docs/rewrite/servicos-registros-filtros-app-v2.md`;
- `servicesHomeViewModel` filtra registros por periodo, cliente, equipamento,
  tipo/status e busca textual;
- `ServicesHome` exibe controles simples para esses filtros dentro de
  `Servicos > Registros`;
- as opcoes de cliente/equipamento sao derivadas do snapshot mockado atual;
- nenhuma integracao sensivel foi tocada: storage real, Supabase/RLS,
  migrations, PMOC, PDF/share real, WhatsApp real, billing, assinatura e quotas
  ficaram fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts --run` falhou
  por ausencia do contrato de filtros.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  dos selects de filtro.
- GREEN:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts --run` passou
  com 10 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 32
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/service/servicesHomeViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 42 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 57. Proximo checkpoint recomendado

> Relatorios locais consolidados por periodo/equipamento/cliente, ainda
> mock/local, sem PDF/share real, storage real, Supabase/RLS, PMOC ou WhatsApp
> real.

## 58. Checkpoint concluido - Relatorios consolidados locais

O app-v2 passou a cobrir a fatia segura de relatorios consolidados locais:

- contrato documental criado em
  `docs/rewrite/relatorios-consolidados-locais-app-v2.md`;
- `servicesReportsViewModel` aceita filtros por periodo, cliente e equipamento;
- `ServiceReportsHome` exibe controles simples para esses filtros dentro de
  `Servicos > Relatorios`;
- o resumo consolidado local reflete somente o recorte filtrado;
- preview e impressao local por registro foram preservados;
- nenhuma integracao sensivel foi tocada: PDF/share real, WhatsApp real,
  storage real, Supabase/RLS, migrations, PMOC, billing, assinatura e quotas
  ficaram fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/service/servicesReportsViewModel.test.ts --run`
  falhou porque o view model ainda tratava filtros como string de busca.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  dos selects de filtro em Relatorios.
- GREEN:
  `npm test -- src/app-v2/service/servicesReportsViewModel.test.ts --run`
  passou com 8 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 33
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/service/servicesReportsViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 41 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 59. Proximo checkpoint recomendado

> Orcamentos mock/action a partir do fechamento de servico, ainda local e sem
> billing, assinatura, PDF/share real, WhatsApp real, storage real ou Supabase.

## 60. Checkpoint concluido - Orcamentos mock/action pos-fechamento

O app-v2 passou a cobrir a primeira acao mockada de orcamento a partir do
fechamento de servico:

- contrato documental criado em
  `docs/rewrite/orcamentos-mock-action-pos-fechamento-app-v2.md`;
- `createQuoteFromServiceRecord` cria orcamento local em rascunho a partir de
  registro concluido;
- o orcamento fica vinculado a registro, equipamento e cliente quando
  disponiveis;
- o total inicial soma custos locais de pecas e mao de obra;
- `Servico concluido` ganhou CTA `Criar orcamento mockado`;
- apos criar, o shell abre `Servicos > Orcamentos` com o novo item no pipeline
  local;
- nenhuma integracao sensivel foi tocada: billing, assinatura, PDF/share real,
  WhatsApp real, storage real, Supabase/RLS, migrations e PMOC ficaram fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `createQuoteFromServiceRecord` ainda nao existia.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  do botao `Criar orcamento mockado`.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 21 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 34
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 67 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 61. Proximo checkpoint recomendado

> Orcamentos fase 2: edicao local basica do rascunho mockado, ainda sem
> billing, assinatura, PDF/share real, WhatsApp real, storage real,
> Supabase/RLS, PMOC ou migrations.

## 62. Checkpoint concluido - Orcamentos fase 2 edicao local basica

O app-v2 passou a cobrir a edicao local basica de rascunho de orcamento:

- contrato documental criado em
  `docs/rewrite/orcamentos-fase-2-edicao-local-app-v2.md`;
- `updateQuoteDraft` atualiza titulo, total e status de um orcamento local em
  `rascunho`;
- a action rejeita orcamento inexistente, titulo vazio e orcamento que ja nao
  esteja em `rascunho`;
- `servicesQuotesViewModel` passou a indicar quais itens podem ser editados;
- `Servicos > Orcamentos` ganhou formulario minimo para editar rascunhos locais;
- nenhuma integracao sensivel foi tocada: billing, assinatura, PDF/share real,
  WhatsApp real, storage real, Supabase/RLS, migrations e PMOC ficaram fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `updateQuoteDraft` ainda nao existia.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  do botao `Editar orcamento`.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 22 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 35
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 69 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 63. Proximo checkpoint recomendado

> Orcamentos fase 3: itens locais simples do rascunho mockado, ainda sem
> billing, assinatura, PDF/share real, WhatsApp real, storage real,
> Supabase/RLS, PMOC ou migrations.

## 64. Checkpoint concluido - Orcamentos fase 3 itens locais simples

O app-v2 passou a cobrir itens locais simples em rascunho de orcamento:

- contrato documental criado em
  `docs/rewrite/orcamentos-fase-3-itens-locais-app-v2.md`;
- `Orcamento` passou a aceitar `itens` locais simples no contrato mockado;
- `updateQuoteDraft` normaliza descricao, quantidade, valor unitario e total do
  item;
- o total do rascunho passa a ser recalculado pela soma dos itens quando houver
  itens;
- `servicesQuotesViewModel` expõe contagem e itens formatados para a UI;
- `Servicos > Orcamentos` permite adicionar item local no formulario de edicao
  de rascunho;
- testes de shell de Orcamentos foram separados em
  `src/app-v2/shell/AppV2ShellQuotes.test.tsx` para manter
  `AppV2Shell.test.tsx` abaixo de 1000 linhas;
- nenhuma integracao sensivel foi tocada: billing, assinatura, PDF/share real,
  WhatsApp real, storage real, Supabase/RLS, migrations e PMOC ficaram fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` falhou porque
  `updateQuoteDraft` ainda ignorava `items` e nao recalculava o total.
- RED:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts --run`
  falhou porque o view model ainda nao expunha `itemsLabel`.
- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou por ausencia
  dos inputs de item local.
- GREEN:
  `npm test -- src/app-v2/data/appV2Flow.test.ts --run` passou com 23 testes.
- GREEN:
  `npm test -- src/app-v2/service/servicesQuotesViewModel.test.ts --run`
  passou com 2 testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 36
  testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/data/appV2Flow.test.ts src/app-v2/service/serviceFlowViewModel.test.ts src/app-v2/service/servicesQuotesViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 71 testes.
- Validacao geral:
  `npm run typecheck -- --pretty false`, `git diff --check` e
  `npm run check` passaram. `npm run check` manteve 1 warning ESLint conhecido
  em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 65. Proximo checkpoint recomendado

> Configuracoes/Conta fase 1: mapear preferencias operacionais simples e
> documentar contrato mock/local antes de implementar a UI, ainda sem billing,
> assinatura, storage real, Supabase/RLS, PMOC, PDF/share ou migrations.

## 66. Checkpoint concluido - Configuracoes/Conta fase 1 contrato local

O app-v2 passou a ter contrato documental para a primeira evolucao segura de
`Conta`:

- contrato criado em
  `docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`;
- v1 `src/ui/views/configuracoes.js` foi usado apenas como referencia funcional;
- atalhos locais permitidos foram mapeados para fluxos app-v2 ja existentes:
  registro, `Equipamentos > Clientes`, `Servicos > Orcamentos` e Home/alertas;
- preferencias futuras foram limitadas a estado em memoria: densidade visual,
  tela inicial e lembrete visual local;
- ajuda futura foi limitada a texto local, sem suporte externo ou feedback real;
- PMOC, billing, assinatura, perfil real, storage real, Supabase/RLS,
  migrations, PDF/share e WhatsApp real ficaram fora.

Validacao executada neste checkpoint:

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`
  executado.
- `git diff --check` passou.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-1-contrato-local.md`
  passou.

## 67. Proximo checkpoint recomendado

> Configuracoes/Conta fase 2: implementar view model e UI minima dos atalhos e
> preferencias mock/local definidos na fase 1, ainda sem billing, assinatura,
> perfil real, storage real, Supabase/RLS, PMOC, PDF/share, WhatsApp real ou
> migrations.

## 68. Checkpoint concluido - Configuracoes/Conta fase 2 UI local

O app-v2 passou a cobrir a primeira UI funcional de `Conta`:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-2-ui-local.md`;
- `accountViewModel` mapeia atalhos, preferencias e ajuda local;
- `AccountHome` substitui o placeholder de `Conta`;
- atalhos locais abrem fluxos app-v2 ja existentes: registro, `Equipamentos >
Clientes`, `Servicos > Orcamentos` e Home/alertas;
- preferencias de densidade, tela inicial e lembrete visual permanecem somente
  em memoria;
- nenhuma area sensivel foi tocada: billing, assinatura, perfil real, storage
  real, Supabase/RLS, migrations, PMOC, PDF/share real e WhatsApp real ficaram
  fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` falhou porque
  `accountViewModel` ainda nao existia.
- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  `Conta` ainda era placeholder.
- GREEN:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` passou com 1
  teste.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou com 3
  testes.
- Validacao focada pos-formatacao:
  `npm test -- src/app-v2/account/accountViewModel.test.ts src/app-v2/shell/AppV2ShellAccount.test.tsx src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 40 testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao geral:
  `npm run check` passou. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 69. Proximo checkpoint recomendado

> Configuracoes/Conta fase 3: aplicar preferencias locais em comportamento
> visivel limitado, ainda somente em memoria e sem billing, assinatura, perfil
> real, storage real, Supabase/RLS, PMOC, PDF/share, WhatsApp real ou
> migrations.

## 70. Checkpoint concluido - Configuracoes/Conta fase 3 preferencias visiveis

O app-v2 passou a aplicar preferencias locais de `Conta` em comportamento
visivel limitado:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-3-preferencias-visiveis.md`;
- `accountViewModel` expoe densidade visual, acao de tela inicial e banner de
  lembrete local;
- `AccountHome` aplica densidade local por atributo testavel e classe escopada;
- lembrete visual local aparece apenas quando ativado;
- botao de tela inicial abre `Hoje`, `Equipamentos` ou `Servicos > Registros`
  sem criar router novo;
- preferencias permanecem somente em memoria;
- nenhuma area sensivel foi tocada: billing, assinatura, perfil real, storage
  real, Supabase/RLS, migrations, PMOC, PDF/share real e WhatsApp real ficaram
  fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` falhou porque
  os efeitos visiveis ainda nao existiam.
- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  a UI ainda nao aplicava densidade/banner/atalho de tela inicial.
- GREEN:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` passou com 2
  testes.
- Validacao focada:
  `npm test -- src/app-v2/account/accountViewModel.test.ts src/app-v2/shell/AppV2ShellAccount.test.tsx --run`
  passou com 6 testes.
- Validacao focada ampliada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 36 testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao geral:
  `npm run format`, `npm run build` e `npm run check` passaram. Manteve 1
  warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings
  Vite/chunk conhecidos.

## 71. Proximo checkpoint recomendado

> Configuracoes/Conta fase 4: consolidar microcopy e estados vazios locais da
> aba `Conta` dentro das regras de UI do app-v2, ainda sem design final amplo,
> persistencia, billing, assinatura, perfil real, Supabase/RLS, PMOC,
> PDF/share, WhatsApp real ou migrations.

## 72. Checkpoint concluido - Configuracoes/Conta fase 4 microcopy e estados locais

O app-v2 passou a consolidar microcopy e estados locais da aba `Conta`:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-4-microcopy-estados-locais.md`;
- `accountViewModel` expoe estado vazio local e limite local generico;
- `AccountHome` renderiza os blocos locais sem iniciar integracao real;
- microcopy visivel removeu linguagem de mock da aba `Conta`;
- preferencias permanecem somente em memoria;
- nenhuma area sensivel foi tocada: billing, assinatura, perfil real, storage
  real, Supabase/RLS, migrations, PMOC, PDF/share real e WhatsApp real ficaram
  fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` falhou porque
  a microcopy local e os blocos de estado ainda nao existiam.
- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  a UI ainda exibia a microcopy antiga e nao renderizava estado vazio/limite
  local.
- GREEN:
  `npm test -- src/app-v2/account/accountViewModel.test.ts --run` passou com 2
  testes.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou com 4
  testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 73. Proximo checkpoint recomendado

> Configuracoes/Conta fase 5: revisar acessibilidade e responsividade local da
> aba `Conta` com checagem de textos longos, foco e layout mobile/desktop,
> ainda sem design final amplo, persistencia, billing, assinatura, perfil real,
> Supabase/RLS, PMOC, PDF/share, WhatsApp real ou migrations.

## 74. Checkpoint concluido - Configuracoes/Conta fase 5 acessibilidade e responsividade local

O app-v2 passou a cobrir ajustes locais de acessibilidade e responsividade da
aba `Conta`:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-5-a11y-responsividade-local.md`;
- selects de preferencias passaram a ter descricoes associadas por
  `aria-describedby`;
- botao de lembrete visual passou a informar estado por `aria-pressed`;
- atalhos locais receberam atributo testavel e quebra segura de texto;
- textos locais passaram a usar quebra segura em pontos com maior risco de
  overflow;
- preferencias permanecem somente em memoria;
- nenhuma area sensivel foi tocada: billing, assinatura, perfil real, storage
  real, Supabase/RLS, migrations, PMOC, PDF/share real e WhatsApp real ficaram
  fora.

Testes executados neste checkpoint:

- RED:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` falhou porque
  os atributos de acessibilidade ainda nao existiam.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2ShellAccount.test.tsx --run` passou com 5
  testes.
- Validacao parcial:
  `npm run typecheck -- --pretty false` passou.
- Validacao focada ampliada:
  `npm test -- src/app-v2/account/accountViewModel.test.ts src/app-v2/shell/AppV2ShellAccount.test.tsx src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellQuotes.test.tsx --run`
  passou com 43 testes.
- Validacao geral:
  `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 75. Proximo checkpoint recomendado

> Configuracoes/Conta fase 6: consolidar encerramento documental do ciclo local
> de Conta e recalcular impacto na matriz/auditoria funcional v1-v2 sem iniciar
> persistencia, billing, assinatura, perfil real, Supabase/RLS, PMOC,
> PDF/share, WhatsApp real ou migrations.

## 76. Checkpoint concluido - Configuracoes/Conta fase 6 encerramento documental

O ciclo local de `Conta` foi encerrado documentalmente:

- contrato documental criado em
  `docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`;
- fases 1 a 5 foram consolidadas como cobertura mock/local de `Conta`;
- a matriz geral reclassificou `Configuracoes operacionais simples` de
  placeholder para `coberto por substituicao v2`;
- a auditoria funcional recalculou a cobertura geral estimada de 74% para 76%;
- Registro de Servico permanece em aproximadamente 97%;
- perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations,
  PMOC, PDF/share real e WhatsApp real seguem fora do escopo.

Validacao documental deste checkpoint:

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`
  executado.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/configuracoes-conta-fase-6-encerramento-documental.md`
  passou.
- `git diff --check` passou.

## 77. Proximo checkpoint recomendado

> Design System/UI fase 1 documental: criar regras de design do app-v2 em
> `docs/rewrite/` antes de qualquer refinamento visual amplo, sem alterar CSS,
> componentes, primitives, storage, Supabase/RLS, PMOC, PDF/share, WhatsApp,
> billing, assinatura ou migrations.

## 78. Checkpoint concluido - Design System/UI fase 1 documental

A primeira fase documental de Design System/UI foi consolidada:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`;
- `docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md` foi confirmado como
  fonte normativa inicial;
- checkpoints visuais futuros devem declarar area unica, componentes afetados,
  tokens/classes esperados, estados de validacao e escopo proibido antes de
  editar codigo;
- nenhum CSS, token, componente, primitive, layout runtime ou integracao
  sensivel foi alterado.

Validacao documental deste checkpoint:

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`
  executado.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-1-regras-app-v2.md`
  passou.
- `git diff --check` passou.

## 79. Proximo checkpoint recomendado

> Design System/UI fase 2: escolher uma unica area candidata para refinamento
> visual controlado, preferencialmente Home Hoje, e criar plano/checklist antes
> de alterar qualquer CSS, token ou componente.

## 80. Checkpoint concluido - Design System/UI fase 2 Home Hoje checklist

A fase 2 escolheu a primeira area candidata para refinamento visual controlado:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`;
- Home Hoje foi escolhida como area unica inicial;
- arquivos candidatos foram mapeados sem alterar runtime;
- checklist futuro exige validacao de mobile 390px, desktop 1366px, desktop
  largo 1920px, texto longo, estado sem alertas, muitos itens e foco de teclado;
- nenhum CSS, token, componente, primitive, layout runtime ou integracao
  sensivel foi alterado.

Validacao documental deste checkpoint:

- `npx prettier --write docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`
  executado.
- `npm run format:check -- docs/app-v2-goal.md docs/rewrite/matriz-paridade-v1-v2.md docs/rewrite/auditoria-ux-funcional-v1-v2.md docs/rewrite/etapa-10-regras-design-system-ui-app-v2.md docs/rewrite/design-system-ui-fase-2-home-hoje-checklist.md`
  passou.
- `git diff --check` passou.

## 81. Proximo checkpoint recomendado

> Design System/UI fase 3: executar QA visual inicial da Home Hoje em browser e,
> somente com evidencia de problema concreto, aplicar um refinamento pequeno em
> Home Hoje com testes e validacao visual.

## 82. Checkpoint concluido - Design System/UI fase 3 QA visual Home Hoje

O QA visual inicial da Home Hoje foi executado:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-3-qa-visual-home-hoje.md`;
- evidencias geradas em
  `docs/rewrite/qa-design-system-ui-fase-3-home-hoje/`;
- mobile 390px, desktop 1366px e desktop 1920px ficaram sem overflow
  horizontal;
- a navegacao respeitou breakpoints: bottom nav no mobile, sidebar no desktop;
- texto longo injetado temporariamente nao gerou overflow horizontal;
- botoes de alerta da coluna auxiliar receberam `tw-border-0` para remover
  borda nativa preta;
- nenhum fluxo, dado, token, shell, storage ou integracao sensivel foi alterado.

Validacao deste checkpoint:

- RED/GREEN focado em `src/app-v2/shell/AppV2Shell.test.tsx`;
- validacao focada ampliada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/home/homeViewModel.test.ts --run`
  passou com 35 testes;
- `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 83. Proximo checkpoint recomendado

> Design System/UI fase 4: revisar Home Hoje no browser apos a correcao e
> decidir se ha outro problema visual concreto. Se nao houver, encerrar o ciclo
> visual da Home e escolher o proximo fluxo por matriz/auditoria, sem ampliar
> para redesign geral.

## 84. Checkpoint concluido - Design System/UI fase 4 fechamento Home Hoje

A revisao pos-correcao da Home Hoje foi executada:

- contrato documental criado em
  `docs/rewrite/design-system-ui-fase-4-fechamento-home-hoje.md`;
- evidencias geradas em
  `docs/rewrite/qa-design-system-ui-fase-4-home-hoje/`;
- mobile 390px, desktop 1366px e desktop 1920px ficaram sem overflow
  horizontal;
- cenarios de texto longo ficaram sem overflow horizontal;
- navegacao respeitou breakpoints: bottom nav no mobile e sidebar no desktop;
- botoes de `Alertas ativos` permaneceram sem risco de borda nativa;
- divisor de `Alertas ativos` recebeu cor explicita `tw-divide-[#E5EAF0]`;
- ciclo visual da Home Hoje foi encerrado sem iniciar redesign geral.

Validacao deste checkpoint:

- RED/GREEN focado em `src/app-v2/shell/AppV2Shell.test.tsx`;
- QA visual pos-correcao com `failed: []` em
  `docs/rewrite/qa-design-system-ui-fase-4-home-hoje/metrics.json`;
- validacao focada ampliada:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/home/homeViewModel.test.ts --run`
  passou com 35 testes;
- `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 85. Proximo checkpoint recomendado

> Equipamentos avancados fase 1 documental: decidir contrato mock/local para
> setores, fotos e delecao antes de qualquer UI, sem upload/storage real,
> Supabase/RLS, migrations, PMOC, billing, assinatura, PDF/share, WhatsApp real
> ou design geral.

## 86. Checkpoint concluido - Equipamentos avancados fase 1 contrato local

A fase documental de Equipamentos avancados foi executada:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-1-contrato-local.md`;
- setores, fotos e delecao do v1 foram mapeados contra o contrato atual do
  app-v2;
- setores foram separados como proxima fatia mock/local possivel;
- fotos foram mantidas fora por upload/storage, regra de plano e fallback;
- delecao foi mantida fora por risco de remover registros, historico,
  relatorios e orcamentos;
- nenhuma UI, runtime, storage, Supabase/RLS, migrations, PMOC, billing,
  assinatura, PDF/share, WhatsApp real ou CSS foi alterado nesta fase.

Validacao documental deste checkpoint:

- `npm run format` executado;
- `npm run build` passou com warnings Vite/chunk conhecidos;
- `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos;
- `git diff --check` passou.

## 87. Proximo checkpoint recomendado

> Equipamentos avancados fase 2: implementar setores mock/local basicos no
> app-v2, sem fotos, sem delecao, sem billing real, sem assinatura real, sem
> storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

## 88. Checkpoint concluido - Equipamentos avancados fase 2 setores mock/local

A primeira fatia de setores mock/local foi implementada no app-v2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-2-setores-mock-local.md`;
- `SetorEquipamento` foi adicionado ao contrato do app-v2;
- snapshot mockado passou a carregar `setores`;
- `Equipamento` passou a aceitar `setorId`;
- `saveEquipment` preserva setor mock/local;
- formulario de equipamento permite escolher setor;
- lista e detalhe exibem setor;
- lista de equipamentos permite filtro local por setor;
- fotos, upload, storage real, Supabase/RLS, migrations, billing real,
  assinatura real, delecao, PMOC, PDF/share, WhatsApp e redesign geral ficaram
  fora.

Validacao deste checkpoint:

- RED/GREEN focado em `equipmentActions`, `equipmentViewModel` e `AppV2Shell`;
- validacao focada:
  `npm test -- src/app-v2/equipment/equipmentActions.test.ts src/app-v2/equipment/equipmentViewModel.test.ts src/app-v2/shell/AppV2Shell.test.tsx --run`
  passou com 49 testes;
- `npm run format`, `npm run build`, `npm run check` e `git diff --check`
  passaram. Manteve 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.

## 89. Proximo checkpoint recomendado

> Equipamentos avancados fase 3: ampliar setores mock/local com criacao/edicao
> simples de setor no app-v2, ainda sem delecao, sem fotos, sem billing real,
> sem assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem
> PMOC e sem redesign geral.

## 90. Checkpoint concluido - Equipamentos avancados fase 3 setores CRUD local

A segunda fatia de setores mock/local foi implementada no app-v2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-3-setores-crud-local.md`;
- `saveEquipmentSector` cria e edita setor no snapshot mockado;
- `AppV2Shell` preserva `serviceDraft` ao salvar setor local;
- `EquipmentList` ganhou painel minimo para criar e editar setor;
- filtros e exibicao de equipamentos refletem setores criados/editados
  localmente;
- validacao focada passou com 45 testes em `equipmentActions` e `AppV2Shell`.

Nao foram alterados storage real, Supabase/RLS, migrations, billing, assinatura,
PMOC, fotos/upload, delecao, PDF/share, WhatsApp, router global, CSS legado ou
design geral.

## 91. Proximo checkpoint recomendado

> Equipamentos avancados fase 4: revisar delecao de equipamento e setor como
> contrato documental antes de qualquer UI, avaliando impactos em registros,
> relatorios, orcamentos, filtros e historico local, ainda sem fotos, sem
> billing real, sem assinatura real, sem storage real, sem Supabase/RLS, sem
> migrations, sem PMOC e sem redesign geral.

## 92. Checkpoint concluido - Equipamentos avancados fase 4 delecao contrato local

A etapa documental de delecao foi executada sem alterar runtime:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-4-delecao-contrato-local.md`;
- delecao de equipamento v1 foi mapeada em
  `src/features/equipamentos/ui/deleteEquip.js`;
- delecao de setor v1 foi mapeada em
  `src/features/equipamentos/setor/setorPersist.js`;
- delecao de equipamento foi classificada como destrutiva porque remove
  equipamento e registros vinculados;
- delecao de setor foi classificada como remocao de agrupamento porque remove o
  setor e limpa `setorId` dos equipamentos;
- app-v2 atual foi confirmado sem action/UI de delecao;
- decisao recomendada: implementar primeiro delecao mock/local de setor e manter
  delecao/arquivamento de equipamento para etapa propria.

Nao foram alterados `src/`, testes, storage real, Supabase/RLS, migrations,
billing, assinatura, PMOC, fotos/upload, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 93. Proximo checkpoint recomendado

> Equipamentos avancados fase 5: implementar somente delecao mock/local de setor
> no app-v2, com confirmacao, limpando `setorId` dos equipamentos e preservando
> equipamentos, registros, relatorios e orcamentos, ainda sem delecao de
> equipamento, sem fotos, sem billing real, sem assinatura real, sem storage
> real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

## 94. Checkpoint concluido - Equipamentos avancados fase 5 delecao setor local

A delecao mock/local de setor foi implementada no app-v2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-5-delecao-setor-local.md`;
- `deleteEquipmentSector` remove setor do snapshot local;
- `deleteEquipmentSector` bloqueia `__sem_setor__`;
- equipamentos vinculados ao setor removido permanecem sem `setorId`;
- registros e orcamentos permanecem preservados;
- `AppV2Shell` ganhou handler local de delecao de setor;
- `EquipmentList` ganhou fluxo de confirmacao antes de remover setor;
- validacao focada passou com 48 testes em `equipmentActions` e `AppV2Shell`.

Nao foram alterados storage real, Supabase/RLS, migrations, billing, assinatura,
PMOC, fotos/upload, delecao de equipamento, PDF/share, WhatsApp, router global,
CSS legado ou design geral.

## 95. Proximo checkpoint recomendado

> Equipamentos avancados fase 6: decidir contrato de arquivamento versus delecao
> de equipamento no app-v2 antes de qualquer action ou UI, avaliando impacto em
> registros, relatorios, orcamentos, compromissos, filtros e historico, ainda
> sem fotos, sem billing real, sem assinatura real, sem storage real, sem
> Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

## 96. Checkpoint concluido - Equipamentos avancados fase 6 contrato arquivamento equipamento

A decisao documental de equipamento foi executada sem alterar runtime:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-6-contrato-arquivamento-equipamento.md`;
- delecao destrutiva do v1 foi revisada como remocao de equipamento e registros
  vinculados;
- app-v2 foi mapeado como dependente de `equipamentoId` em registros,
  relatorios, orcamentos, compromissos, filtros e historico;
- arquivamento local foi escolhido como contrato recomendado para a proxima
  fatia de runtime;
- delecao destrutiva ficou bloqueada para etapa futura propria com politica de
  retencao/auditoria.

Nao foram alterados `src/`, testes, storage real, Supabase/RLS, migrations,
billing, assinatura, PMOC, fotos/upload, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 97. Proximo checkpoint recomendado

> Equipamentos avancados fase 7: implementar somente arquivamento mock/local de
> equipamento no app-v2, com confirmacao, preservando registros, relatorios,
> orcamentos e compromissos, ocultando arquivados da lista operacional por
> padrao e mantendo resolucao de historico, ainda sem fotos, sem billing real,
> sem assinatura real, sem storage real, sem Supabase/RLS, sem migrations, sem
> PMOC e sem redesign geral.

## 98. Checkpoint concluido - Equipamentos avancados fase 7 arquivamento equipamento local

O arquivamento mock/local de equipamento foi implementado no app-v2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-7-arquivamento-equipamento-local.md`;
- `Equipamento` ganhou metadado opcional `archivedAt`;
- `archiveEquipment` marca equipamento como arquivado sem remover a entidade;
- registros, compromissos e orcamentos vinculados permanecem preservados;
- lista operacional de Equipamentos oculta arquivados por padrao;
- detalhe do equipamento arquivado continua resolvendo historico e mostra estado
  arquivado;
- `AppV2Shell` ganhou handler local de arquivamento com confirmacao no detalhe;
- validacao focada passou com 61 testes em `equipmentActions`,
  `equipmentViewModel` e `AppV2Shell`.

Nao foram alterados storage real, Supabase/RLS, migrations, billing, assinatura,
PMOC, fotos/upload, delecao destrutiva, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 99. Proximo checkpoint recomendado

> Equipamentos avancados fase 8: decidir contrato local de desarquivamento e/ou
> tratamento de compromissos futuros de equipamento arquivado antes de qualquer
> persistencia real, ainda sem fotos, sem billing real, sem assinatura real, sem
> storage real, sem Supabase/RLS, sem migrations, sem PMOC e sem redesign geral.

## 100. Checkpoint concluido - Equipamentos avancados fase 8 contrato desarquivamento e compromissos

A decisao documental de desarquivamento e compromissos foi executada sem alterar
runtime:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-8-contrato-desarquivamento-compromissos.md`;
- Home, alertas, fila e proxima acao foram mapeados como consumidores de
  compromissos `agendado`;
- Servicos, Relatorios e Orcamentos foram preservados como consumidores
  historicos de `equipamentoId`;
- ficou definido que equipamento arquivado deve sair da operacao ativa sem
  perder historico;
- ficou definido que compromissos `agendado` vinculados ao equipamento
  arquivado devem ser preservados como registros, mas convertidos localmente
  para `cancelado` na proxima fatia de runtime;
- ficou definido que desarquivar remove `archivedAt`, mas nao reabre
  compromissos cancelados automaticamente.

Nao foram alterados `src/`, testes, storage real, Supabase/RLS, migrations,
billing, assinatura, PMOC, fotos/upload, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 101. Proximo checkpoint recomendado

> Equipamentos avancados fase 9: implementar somente runtime mock/local do
> contrato da fase 8, cancelando compromissos `agendado` ao arquivar
> equipamento, criando `unarchiveEquipment`, impedindo que arquivados alimentem
> Home/fila e mantendo historico em Servicos/Relatorios, ainda sem fotos, sem
> billing real, sem assinatura real, sem storage real, sem Supabase/RLS, sem
> migrations, sem PMOC e sem redesign geral.

## 102. Checkpoint concluido - Equipamentos avancados fase 9 runtime desarquivamento e compromissos

O runtime mock/local do contrato da fase 8 foi implementado no app-v2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-9-runtime-desarquivamento-compromissos.md`;
- `archiveEquipment` cancela compromissos `agendado` do equipamento arquivado,
  preservando os registros de compromisso;
- `unarchiveEquipment` remove `archivedAt` sem reabrir compromissos cancelados;
- detalhe de equipamento arquivado exibe acao local para desarquivar;
- Home, alertas, fila e proxima acao ignoram equipamentos arquivados;
- escolha operacional de Servicos oculta arquivados;
- inicio direto de servico para equipamento arquivado fica bloqueado;
- historico em Servicos/Relatorios permanece preservado por `equipamentoId`.

Nao foram alterados storage real, Supabase/RLS, migrations, billing, assinatura,
PMOC, fotos/upload, delecao destrutiva, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 103. Proximo checkpoint recomendado

> Equipamentos avancados fase 10: decidir contrato local para fotos/anexos de
> equipamento sem upload/storage real, separando placeholder/mock local,
> permissoes, limites e futura persistencia, ainda sem billing real, sem
> assinatura real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share e
> sem redesign geral.

## 104. Checkpoint concluido - Equipamentos avancados fase 10 contrato fotos e anexos

A decisao documental de fotos/anexos foi executada sem alterar runtime:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-10-contrato-fotos-anexos.md`;
- fotos do v1 foram mapeadas como fluxo sensivel por misturar gate Plus/Pro,
  editor, upload, storage, fallback offline e capa visual;
- app-v2 foi confirmado sem contrato atual de fotos/anexos;
- ficou definido que a primeira fatia futura deve usar apenas
  `EquipmentAttachment` mock/local, sem `File`, `Blob`, `dataUrl` grande, path
  de bucket, signed URL ou userId real;
- ficou definido limite inicial de ate 3 itens visuais por equipamento no mock;
- ficou definido que upload/storage real, billing/gates reais, Supabase/RLS e
  migrations exigem etapas proprias.

Nao foram alterados `src/`, testes, storage real, Supabase/RLS, migrations,
billing, assinatura, PMOC, upload real, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 105. Proximo checkpoint recomendado

> Equipamentos avancados fase 11: implementar somente anexos/fotos placeholder
> mock/local no app-v2 usando o contrato da fase 10, com no maximo 3 itens,
> exibicao no detalhe/card e preservacao em criar/editar/arquivar/desarquivar,
> sem input real de arquivo, sem upload, sem storage real, sem billing real, sem
> assinatura real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share e
> sem redesign geral.

## 106. Checkpoint concluido - Equipamentos avancados fase 11 anexos placeholder local

A fatia runtime mock/local de fotos/anexos foi implementada no app-v2:

- contrato documental criado em
  `docs/rewrite/equipamentos-avancados-fase-11-anexos-placeholder-local.md`;
- `Equipamento` passou a aceitar `anexos?: EquipmentAttachment[]`;
- `saveEquipmentAttachment` adiciona/edita anexo local com limite de 3 itens;
- metadados de arquivo, URL, bucket, signed URL e storage real sao bloqueados;
- card e detalhe exibem capa/anexos locais;
- shell adiciona placeholder local sem input real de arquivo;
- editar, arquivar e desarquivar preservam os anexos locais.

Nao foram alterados storage real, Supabase/RLS, migrations, billing, assinatura,
PMOC, upload real, PDF/share, WhatsApp, router global, CSS legado ou design
geral.

## 107. Proximo checkpoint recomendado

> Equipamentos avancados fase 12: reauditar a area de Equipamentos apos anexos
> placeholder locais, atualizar a porcentagem/estado de paridade UX v1-v2 e
> decidir documentalmente se o restante deve ir para design, backlog sensivel ou
> etapas proprias, sem implementar storage real, Supabase/RLS, migrations, PMOC,
> PDF/share, billing real, assinatura real ou redesign geral.

## 108. Checkpoint concluido - Equipamentos avancados fase 12 reauditoria de paridade

A reauditoria documental de Equipamentos foi executada:

- relatorio criado em
  `docs/rewrite/equipamentos-avancados-fase-12-reauditoria-paridade.md`;
- `Equipamentos: setores/fotos/delecao` foi atualizado na auditoria para
  refletir setores, arquivamento/desarquivamento e anexos placeholder locais;
- a porcentagem geral estimada permanece **76%**, porque o item continua
  `parcial` pelo metodo de peso e as lacunas restantes sao sensiveis ou exigem
  etapa propria;
- PMOC foi mantido excluido deste ciclo e deve ser refeito em nova etapa
  propria;
- o restante foi separado entre design, backlog sensivel e etapa propria de
  delecao destrutiva.

Nao foram alterados `src/`, runtime, storage real, Supabase/RLS, migrations,
billing, assinatura, PMOC, upload real, PDF/share, WhatsApp, router global, CSS
legado ou design geral.

## 109. Proximo checkpoint recomendado

> Design System/UI fase 5: auditoria visual documental de Equipamentos app-v2
> apos a cobertura mock/local, cobrindo lista, card, detalhe, estados vazios,
> anexos locais, mobile/desktop, rolagem e texto longo, sem alterar runtime, sem
> storage real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share, sem
> billing real e sem redesign amplo.

## 110. Checkpoint concluido - Design System/UI fase 5 auditoria visual Equipamentos

A auditoria visual documental de Equipamentos foi executada sem alterar runtime:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-5-equipamentos-auditoria-visual.md`;
- lista, card, detalhe, estados vazios, anexos locais, mobile/desktop, rolagem
  e texto longo foram classificados como criterios obrigatorios da proxima
  fase visual;
- riscos de densidade, excesso de cards, truncamento, diferenca entre vazio real
  e filtro sem resultado, e interpretacao de anexo placeholder como upload real
  foram documentados;
- matriz minima de QA visual futura foi definida para mobile 390, desktop 1366
  e desktop 1920;
- PMOC foi mantido fora do ciclo e deve ser refeito em etapa propria futura.

Nao foram alterados `src/`, runtime, CSS, tokens, primitives, componentes,
testes, storage real, Supabase/RLS, migrations, billing, assinatura, PMOC,
upload real, PDF/share, WhatsApp, router global, seguranca, React Doctor ou
redesign amplo.

## 111. Proximo checkpoint recomendado

> Design System/UI fase 6: executar QA visual real de Equipamentos app-v2 em
> browser com screenshots mobile 390, desktop 1366 e desktop 1920, incluindo
> texto longo, estado vazio e detalhe com anexos, e somente depois decidir se
> existe ajuste visual pequeno; sem runtime funcional, storage real,
> Supabase/RLS, migrations, PMOC, PDF/share, billing real ou redesign amplo.

## 112. Checkpoint concluido - Design System/UI fase 6 QA visual Equipamentos

O QA visual real de Equipamentos foi executado em browser:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-6-equipamentos-qa-visual.md`;
- evidencias salvas em
  `docs/rewrite/qa-design-system-ui-fase-6-equipamentos/`;
- foram capturados 12 screenshots em mobile 390, desktop 1366 e desktop 1920;
- lista, filtro sem resultado, texto longo e detalhe com 3 anexos locais foram
  validados;
- nao houve overflow horizontal da pagina em nenhum cenario;
- estado vazio por filtro sem resultado apareceu corretamente;
- detalhe com 3 anexos locais permaneceu legivel;
- texto longo foi truncado sem quebrar layout;
- achado visual controlado: no mobile 390, o chip `Sem primeiro servico` fica
  parcialmente cortado dentro da faixa de filtros rolavel.

Nao foram alterados runtime, storage real, Supabase/RLS, migrations, billing,
assinatura, PMOC, upload real, PDF/share, WhatsApp, router global, seguranca,
React Doctor ou redesign amplo.

## 113. Proximo checkpoint recomendado

> Design System/UI fase 7: ajustar somente a faixa de filtros de Equipamentos no
> mobile para evitar chip parcialmente cortado, preferindo quebra de linha ou
> comportamento equivalente sem overflow horizontal de pagina; validar novamente
> mobile 390, desktop 1366 e desktop 1920; sem storage real, Supabase/RLS,
> migrations, PMOC, PDF/share, billing real ou redesign amplo.

## 114. Checkpoint concluido - Design System/UI fase 7 filtros mobile Equipamentos

O ajuste visual pequeno da faixa de filtros de Equipamentos foi executado:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-7-equipamentos-filtros-mobile.md`;
- `src/app-v2/equipment/EquipmentList.tsx` passou a usar `tw-flex-wrap` na
  faixa de filtros;
- a rolagem horizontal do rail de filtros foi removida;
- evidencias pos-ajuste foram salvas em
  `docs/rewrite/qa-design-system-ui-fase-7-equipamentos-filtros/`;
- os 12 cenarios de lista, filtro sem resultado, texto longo e detalhe com
  anexos foram recapturados em mobile 390, desktop 1366 e desktop 1920;
- todos os cenarios ficaram sem overflow horizontal de pagina e sem elementos
  visiveis fora da viewport.

Nao foram alterados storage real, Supabase/RLS, migrations, billing,
assinatura, PMOC, upload real, PDF/share, WhatsApp, router global, seguranca,
React Doctor ou redesign amplo.

## 115. Proximo checkpoint recomendado

> Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de
> Equipamentos, para escolher o proximo fluxo do app-v2 por lacuna funcional ou
> visual ainda nao sensivel; manter PMOC, Supabase/RLS, migrations, storage
> real, billing real, PDF/share, WhatsApp e security hardening em etapas
> proprias.

## 116. Checkpoint concluido - Reauditoria matriz UX v1-v2 pos Equipamentos visual

A reauditoria documental da matriz UX v1-v2 foi executada apos o fechamento
visual local de Equipamentos:

- relatorio criado em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-equipamentos-design.md`;
- Equipamentos foi confirmado como visualmente fechado para lista, filtros,
  estado vazio, texto longo e detalhe com anexos locais;
- a estimativa geral permanece **76%**, porque a fase visual nao altera peso
  funcional e as lacunas restantes de Equipamentos sao sensiveis ou de etapa
  propria;
- PMOC foi mantido excluido deste ciclo e deve ser refeito em nova etapa
  propria;
- Supabase/RLS e migrations foram mantidos em etapa propria futura, incluindo a
  possibilidade de refazer migrations se necessario;
- acoes pos-salvamento, filtros de Registros, Relatorios consolidados e
  Orcamentos mock/local foram reconhecidos como checkpoints ja existentes, sem
  reabertura;
- o proximo fluxo nao sensivel foi definido como auditoria visual documental de
  `Servicos`.

Nao foram alterados runtime, CSS, tokens, componentes, testes, storage real,
Supabase/RLS, migrations, billing, assinatura, PMOC, upload real, PDF/share,
WhatsApp, router global, seguranca, React Doctor ou redesign amplo.

## 117. Proximo checkpoint recomendado

> Design System/UI fase 8: auditoria visual documental de `Servicos` no
> app-v2, cobrindo Registros, Relatorios e Orcamentos locais apos os
> checkpoints funcionais ja existentes, sem alterar runtime, sem PDF/share real,
> WhatsApp real, storage real, Supabase/RLS, migrations, PMOC, billing real,
> assinatura, router novo ou redesign amplo.

## 118. Checkpoint concluido - Design System/UI fase 8 auditoria visual Servicos

A auditoria visual documental de `Servicos` foi executada sem alterar runtime:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-8-servicos-auditoria-visual.md`;
- Registros, Relatorios e Orcamentos foram auditados como uma area unica de
  `Servicos`;
- riscos de subvisao horizontal, densidade de filtros, lista operacional,
  preview imprimivel, cards de orcamento e edicao local foram documentados;
- matriz minima de QA visual futura foi definida para mobile 390, desktop 1366
  e desktop 1920;
- PMOC, PDF/share real, WhatsApp real, storage real, Supabase/RLS, migrations,
  billing real e assinatura foram mantidos fora do ciclo.

Nao foram alterados `src/`, runtime, CSS, tokens, primitives, componentes,
testes, storage real, Supabase/RLS, migrations, billing, assinatura, PMOC,
PDF/share, WhatsApp, router global, seguranca, React Doctor ou redesign amplo.

## 119. Proximo checkpoint recomendado

> Design System/UI fase 9: executar QA visual real de `Servicos` app-v2 em
> browser com screenshots mobile 390, desktop 1366 e desktop 1920, cobrindo
> Registros, Relatorios, Orcamentos, estados vazios, texto longo, preview de
> relatorio e edicao local de orcamento; somente depois decidir se existe ajuste
> visual pequeno; sem runtime funcional, storage real, Supabase/RLS, migrations,
> PMOC, PDF/share real, WhatsApp real, billing real ou redesign amplo.

## 120. Checkpoint concluido - Design System/UI fase 9 QA visual Servicos

O QA visual real de `Servicos` foi executado em browser:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-9-servicos-qa-visual.md`;
- evidencias salvas em `docs/rewrite/qa-design-system-ui-fase-9-servicos/`;
- foram capturados 27 screenshots em mobile 390, desktop 1366 e desktop 1920;
- Registros, Relatorios, Orcamentos, estados vazios, texto tecnico, preview de
  relatorio, edicao de orcamento e item local longo foram validados;
- a primeira captura encontrou overflow horizontal de 2px em
  `Servicos > Registros` no mobile 390;
- `src/app-v2/service/ServicesHome.tsx` recebeu somente `tw-box-border` no input
  `Buscar registros`;
- a recaptura completa ficou sem overflow horizontal de pagina e sem elementos
  visiveis fora da viewport nos 27 cenarios.

Nao foram alterados storage real, Supabase/RLS, migrations, billing,
assinatura, PMOC, PDF/share real, WhatsApp, router global, seguranca, React
Doctor ou redesign amplo.

## 121. Proximo checkpoint recomendado

> Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de
> `Servicos`, para escolher o proximo fluxo do app-v2 por lacuna funcional ou
> visual ainda nao sensivel; manter PMOC, Supabase/RLS, migrations, storage
> real, billing real, PDF/share, WhatsApp e security hardening em etapas
> proprias.

## 122. Checkpoint concluido - Reauditoria matriz UX v1-v2 pos Servicos visual

A reauditoria documental da matriz UX v1-v2 foi executada apos o fechamento
visual local de `Servicos`:

- relatorio criado em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-servicos-design.md`;
- `Servicos` foi confirmado como visualmente fechado para Registros,
  Relatorios e Orcamentos nos 27 cenarios cobertos pela fase 9;
- a estimativa geral permanece **76%**, porque esta etapa nao cria nova
  paridade funcional e as lacunas restantes de `Servicos` pertencem a
  integracoes sensiveis ou etapas proprias;
- Home Hoje, Equipamentos e Servicos foram reconhecidos como ciclos visuais ja
  executados, sem reabertura sem novo achado objetivo;
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria;
- Supabase/RLS e migrations permanecem em etapa propria futura, com
  possibilidade de refazer migrations se necessario;
- o proximo fluxo recomendado foi definido como auditoria visual documental de
  `Conta`.

Nao foram alterados runtime, CSS, tokens, componentes, testes, storage real,
Supabase/RLS, migrations, billing, assinatura, PMOC, PDF/share, WhatsApp, perfil
real, seguranca, React Doctor ou redesign amplo.

## 123. Proximo checkpoint recomendado

> Design System/UI fase 10: auditoria visual documental de `Conta` no app-v2,
> cobrindo atalhos locais, preferencias em memoria, lembrete local, ajuda,
> estados locais, texto longo, foco, mobile/desktop e densidade compacta, sem
> alterar runtime, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC,
> sem billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem perfil real
> e sem redesign amplo.

## 124. Checkpoint concluido - Design System/UI fase 10 auditoria visual Conta

A auditoria visual documental de `Conta` foi executada sem alterar runtime:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-10-conta-auditoria-visual.md`;
- atalhos locais, preferencias em memoria, lembrete local, ajuda, estados
  locais, texto longo, foco, mobile/desktop e densidade compacta foram
  classificados como criterios obrigatorios da proxima fase visual;
- riscos de densidade compacta em mobile, atalhos com texto longo, selects em
  grid, lembrete condicional, termos sensiveis proximos e excesso de blocos
  foram documentados;
- matriz minima de QA visual futura foi definida para mobile 390, desktop 1366
  e desktop 1920;
- perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations,
  PMOC, PDF/share, WhatsApp e suporte real foram mantidos fora do ciclo.

Nao foram alterados `src/`, runtime, CSS, tokens, primitives, componentes,
testes, storage real, localStorage, Supabase/RLS, migrations, billing,
assinatura, PMOC, PDF/share, WhatsApp, perfil real, seguranca, React Doctor ou
redesign amplo.

## 125. Proximo checkpoint recomendado

> Design System/UI fase 11: executar QA visual real de `Conta` app-v2 em browser
> com screenshots mobile 390, desktop 1366 e desktop 1920, cobrindo estado
> default, densidade compacta, lembrete ativo, foco em controle, texto longo
> local e preferencias; somente depois decidir se existe ajuste visual pequeno;
> sem runtime funcional novo, sem storage real, sem localStorage, sem
> Supabase/RLS, sem migrations, sem PMOC, sem billing real, sem assinatura, sem
> PDF/share, sem WhatsApp, sem perfil real e sem redesign amplo.

## 126. Checkpoint concluido - Design System/UI fase 11 QA visual Conta

O QA visual real de `Conta` foi executado em browser:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-11-conta-qa-visual.md`;
- evidencias salvas em `docs/rewrite/qa-design-system-ui-fase-11-conta/`;
- foram capturados 13 screenshots em mobile 390, desktop 1366 e desktop 1920;
- default, densidade compacta, lembrete ativo, foco em atalho, texto local e
  preferencias foram validados;
- a captura ficou sem overflow horizontal de pagina, sem elementos visiveis fora
  da viewport e sem termos sensiveis visiveis nos 13 cenarios;
- nao houve ajuste visual porque nao houve achado objetivo.

Nao foram alterados storage real, localStorage, Supabase/RLS, migrations,
billing, assinatura, PMOC, PDF/share real, WhatsApp, perfil real, router global,
seguranca, React Doctor ou redesign amplo.

## 127. Proximo checkpoint recomendado

> Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de `Conta`,
> para escolher o proximo fluxo do app-v2 por lacuna funcional ou visual ainda
> nao sensivel; manter PMOC, Supabase/RLS, migrations, storage real, billing
> real, PDF/share, WhatsApp, perfil real e security hardening em etapas
> proprias.

## 128. Checkpoint concluido - Reauditoria matriz UX v1-v2 pos Conta visual

A reauditoria documental da matriz UX v1-v2 foi executada apos o fechamento
visual local de `Conta`:

- relatorio criado em
  `docs/rewrite/reauditoria-matriz-ux-v1-v2-pos-conta-design.md`;
- Home Hoje, Equipamentos, Servicos e Conta foram reconhecidos como areas com
  ciclos visuais recentes no recorte local;
- `Conta` foi confirmada como visualmente validada nos 13 cenarios cobertos pela
  fase 11;
- a porcentagem geral estimada permanece **76%**, porque esta etapa nao cria
  nova paridade funcional;
- PMOC permanece excluido deste ciclo e deve ser refeito em nova etapa propria;
- Supabase/RLS e migrations permanecem em etapa propria futura, com
  possibilidade de refazer migrations se necessario;
- o proximo checkpoint recomendado foi definido como fechamento documental da
  primeira passada visual do app-v2.

Nao foram alterados `src/`, runtime, CSS, tokens, primitives, componentes,
testes, storage real, localStorage, Supabase/RLS, migrations, billing,
assinatura, PMOC, PDF/share, WhatsApp, perfil real, seguranca, React Doctor ou
redesign amplo.

## 129. Proximo checkpoint recomendado

> Design System/UI fase 12: fechamento documental da primeira passada visual do
> app-v2, consolidando Home Hoje, Equipamentos, Servicos e Conta, evidencias de
> QA, criterios aceitos, limites do que nao foi coberto e gates para nao reabrir
> visual sem novo achado objetivo; sem alterar runtime, sem CSS, sem tokens, sem
> componentes, sem storage real, sem Supabase/RLS, sem migrations, sem PMOC, sem
> billing real, sem assinatura, sem PDF/share, sem WhatsApp, sem perfil real,
> sem security hardening e sem React Doctor.

## 130. Checkpoint concluido - Design System/UI fase 12 fechamento da primeira passada visual

O fechamento documental da primeira passada visual do app-v2 foi executado:

- relatorio criado em
  `docs/rewrite/design-system-ui-fase-12-fechamento-primeira-passada.md`;
- Home Hoje, Equipamentos, Servicos e Conta foram consolidados como primeira
  passada visual encerrada no recorte local;
- 76 screenshots de QA visual foram contabilizados nas pastas das fases 3, 4,
  6, 7, 9 e 11;
- os criterios aceitos foram registrados sem ampliar para design final ou
  paridade funcional completa;
- gates para reabrir visual foram definidos: overflow, elemento fora da
  viewport, texto cobrindo conteudo, foco invisivel, estado vazio ambigui,
  promessa de integracao real inexistente ou novo fluxo funcional;
- a porcentagem geral estimada permanece **76%**, porque esta etapa nao cria
  nova paridade funcional.

Nao foram alterados `src/`, runtime, CSS, tokens, primitives, componentes,
testes, storage real, localStorage, Supabase/RLS, migrations, billing,
assinatura, PMOC, PDF/share, WhatsApp, perfil real, seguranca, React Doctor ou
redesign amplo.

## 131. Proximo checkpoint recomendado

> Reauditoria funcional documental pos-fechamento visual: revisar a matriz UX
> v1-v2 e escolher uma unica proxima lacuna nao sensivel entre
> Historico/filtros, Relatorios locais, Orcamentos mock/action e Clientes
> filtros/relatorio local, sem implementar runtime nesta etapa e mantendo PMOC,
> Supabase/RLS, migrations, storage real, billing real, assinatura, PDF/share,
> WhatsApp, perfil real, security hardening e React Doctor em etapas proprias.

## 132. Checkpoint concluido - Reauditoria funcional pos-fechamento visual

A reauditoria funcional documental pos-fechamento visual foi executada:

- relatorio criado em
  `docs/rewrite/reauditoria-funcional-pos-fechamento-visual.md`;
- Historico/filtros foi reconhecido como fatia ja executada por
  `docs/rewrite/servicos-registros-filtros-app-v2.md`;
- Relatorios locais foi reconhecido como fatia ja executada por
  `docs/rewrite/relatorios-consolidados-locais-app-v2.md`;
- Orcamentos mock/action foi reconhecido como ciclo local ja executado pelas
  fases de orcamento;
- Clientes filtros/relatorio local foi reconhecido como fatia ja executada por
  `docs/rewrite/clientes-fase-5-consulta-relatorio-local.md`;
- a porcentagem geral estimada permanece **76%** ate recalculo documental
  completo dos 38 itens ponderados.

Nao foram alterados `src/`, runtime, CSS, tokens, primitives, componentes,
testes, storage real, localStorage, Supabase/RLS, migrations, billing,
assinatura, PMOC, PDF/share, WhatsApp, perfil real, seguranca, React Doctor ou
redesign amplo.

## 133. Proximo checkpoint recomendado

> Recalculo documental completo da matriz UX v1-v2 apos fechamento visual e
> candidatos nao sensiveis ja executados, revisando os 38 itens ponderados,
> atualizando status e percentual geral quando houver evidencia documental e de
> testes, sem alterar runtime e mantendo PMOC, Supabase/RLS, migrations, storage
> real, billing real, assinatura, PDF/share, WhatsApp, perfil real, security
> hardening e React Doctor em etapas proprias.

## 134. Checkpoint concluido - CP-Z matriz final de corte v1 -> v2

A matriz de corte para promover o app-v2 como entrada principal foi criada em:

- `docs/rewrite/app-v2-primary-cutover-matrix-cp-z.md`

Decisao registrada:

- o app-v2 ainda nao substitui o v1 porque `index.html` continua carregando
  `/src/app.js`;
- `preview.html` e `authenticated-preview.html` sao entrypoints de
  preview/harness, nao bootstrap de producao;
- o primeiro corte recomendado para v2 principal deve ser operacional minimo,
  cobrindo login/sessao, fallback, Hoje, Alertas, Clientes, Equipamentos,
  Registro de servico, Registros, Relatorios locais, Orcamentos locais, Conta,
  mobile/desktop, Cloudflare Pages preview e rollback;
- PDF/share real, WhatsApp real, billing/features pagas, upload/storage real,
  PMOC real, assinatura digital real e orcamento real ficam fora do primeiro
  corte se forem aprovados explicitamente como limitacoes;
- se houver sessao de teste disponivel, o proximo checkpoint recomendado e
  CP-Y, validacao real do `authenticated-preview.html`;
- se nao houver sessao de teste disponivel, o proximo checkpoint recomendado e
  CP-AA, bootstrap de producao `src/app-v2/main.tsx` sem trocar ainda
  `index.html`.

Nao foram alterados runtime, `index.html`, router, storage real, Supabase/RLS,
PDF/share, WhatsApp, billing, upload, PMOC, v1 ou configs.

## 135. Checkpoint concluido - CP-AA bootstrap principal app-v2

O bootstrap de producao app-v2 foi criado sem promover o app-v2 para a raiz:

- `src/app-v2/main.tsx`;
- `src/app-v2/main.test.tsx`;
- `docs/rewrite/app-v2-primary-bootstrap-cp-aa.md`.

Decisao registrada:

- `main.tsx` monta o app-v2 autenticado no root futuro `app-v2-root`;
- `index.html` continua carregando `/src/app.js`, portanto a producao segue no
  v1 ate a CP-AB;
- `preview.tsx` continua local/mockado;
- `authenticatedPreview.tsx` continua harness autenticado opt-in;
- a troca para v2 principal continua bloqueada por sessao real, router/deep
  links, smoke local/mobile/desktop, Cloudflare Pages preview e rollback.

Nao foram alterados `index.html`, v1/legado, router, storage real,
Supabase/RLS, PDF/share, WhatsApp, billing, upload, PMOC ou configs.

## 136. Checkpoint concluido - CP-AB corte local para app-v2 principal

O app-v2 foi promovido como entrada principal local por meio de `index.html`:

- `index.html`;
- `src/app-v2/primaryCutover.test.ts`;
- `docs/rewrite/app-v2-primary-cutover-cp-ab.md`.

Decisao registrada:

- `index.html` monta `app-v2-root`;
- `index.html` carrega `/src/app-v2/main.tsx`;
- `index.html` nao carrega mais `/src/app.js`;
- CSS global legado do v1 nao e carregado no entrypoint principal app-v2;
- rollback minimo esta documentado para voltar ao root `app` e `/src/app.js`.

O v1 segue no repositorio como baseline congelado e caminho de rollback, mas nao
e mais o entrypoint local desta branch.

Ainda nao e liberacao final para Cloudflare principal. Faltam sessao real,
escrita real minima, router/deep links, smoke mobile/desktop, Cloudflare Pages
preview e aprovacao explicita das areas fora do primeiro corte.

Nao foram alterados router, storage real amplo, Supabase/RLS, PDF/share,
WhatsApp, billing, upload, PMOC, orcamento real ou configs.

## 137. Checkpoint concluido - CP-AC smoke de preview de producao local

Foi criado e executado um smoke E2E para validar a entrada principal app-v2 em
ambiente equivalente a producao estatica:

- `e2e/specs/app-v2-primary-entrypoint.spec.js`;
- `docs/rewrite/app-v2-cloudflare-preview-smoke-cp-ac.md`.

Decisao registrada:

- o smoke roda contra `npm run preview` servindo `dist`;
- `/` renderiza `app-v2-root`;
- `/equipamentos` valida fallback SPA por rota nao-arquivo;
- o root legado `app` nao aparece;
- `/src/app.js` e CSS global legado nao voltam para o entrypoint principal;
- `dist/_redirects` e `dist/_headers` existem apos build.

Resultado:

- `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-primary-entrypoint.spec.js`
  passou com 2 testes contra `http://127.0.0.1:4173`.

Ainda nao e validacao externa do Cloudflare Pages. Falta URL de preview da
branch para reexecutar o mesmo smoke em ambiente publicado.

## 138. Checkpoint concluido - CP-AD rotas principais app-v2

Foi implementado o contrato minimo de rotas principais para o app-v2 como
entrada principal:

- `/` abre `Hoje`;
- `/equipamentos` abre `Equipamentos`;
- `/servicos` abre `Servicos`;
- `/conta` abre `Conta`.

Arquivos principais:

- `src/app-v2/navigation/appV2Routes.ts`;
- `src/app-v2/navigation/appV2Routes.test.ts`;
- `src/app-v2/shell/AppV2Shell.tsx`;
- `docs/rewrite/app-v2-primary-routes-cp-ad.md`.

Decisao registrada:

- somente as quatro areas principais viraram contrato publico de URL;
- subrotas, IDs e etapas de fluxo continuam fora;
- `popstate` sincroniza apenas a area principal;
- troca de area atualiza `history.pushState`;
- caminhos desconhecidos fazem fallback para `Hoje`.

Validacao focada:

- `npm test -- src/app-v2/navigation/appV2Routes.test.ts src/app-v2/shell/AppV2Shell.navigation.test.tsx --run`;
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`.

Nao foram alterados storage, Supabase/RLS, PDF/share, WhatsApp, billing,
upload, PMOC, router legado, subrotas com IDs ou persistencia de draft.

## 139. Checkpoint concluido - CP-AE smoke autenticado no root principal

Foi adicionado um smoke E2E para validar o app-v2 como entrada principal com
sessao Supabase fake no browser:

- `e2e/specs/app-v2-authenticated-primary.spec.js`;
- `e2e/fixtures/authedSession.js`;
- `docs/rewrite/app-v2-authenticated-primary-smoke-cp-ae.md`.

Decisao registrada:

- o teste abre `/equipamentos` pelo root principal;
- a fixture injeta usuario autenticado fake;
- a lista de Clientes carrega dados remotos interceptados da tabela
  `clientes`;
- o fluxo "Novo cliente" envia escrita para `clientes` com `user_id`
  autenticado;
- a fixture agora responde objeto unico quando o request Supabase usa
  `.single()`.

Validacao focada:

- `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-authenticated-primary.spec.js`.

Ainda nao e validacao real de Supabase/RLS nem Cloudflare externo. Faltam sessao
real, escrita real minima de cliente/equipamento, preview externo Cloudflare e
smoke mobile/desktop antes de tratar o v2 como versao principal publicada.

Nao foram alterados runtime do app-v2, `index.html`, router, storage real,
Supabase/RLS, PDF/share, WhatsApp, billing, upload, PMOC ou v1/legado.

## 140. Checkpoint concluido - CP-AF smoke autenticado de equipamento

Foi ampliado o smoke E2E autenticado do root principal para cobrir equipamento:

- `e2e/specs/app-v2-authenticated-primary.spec.js`;
- `docs/rewrite/app-v2-authenticated-equipment-smoke-cp-af.md`.

Decisao registrada:

- o teste abre `/equipamentos` pelo root principal;
- a fixture injeta usuario autenticado fake e cliente remoto;
- o fluxo "Novo equipamento" salva equipamento vinculado ao cliente remoto;
- o request `POST /rest/v1/equipamentos` inclui `user_id` autenticado e
  `cliente_id`;
- o equipamento salvo aparece na lista app-v2.

Evidencia de schema revisada:

- `supabase/migrations/20260411000000_baseline_core_tables.sql` define
  `public.equipamentos.id` como `text primary key`;
- o ID local `eq-shell-*` usado pelo app-v2 nao conflita com o tipo atual do
  schema.

Validacao focada:

- `npx playwright test -c e2e/playwright.config.js e2e/specs/app-v2-authenticated-primary.spec.js`.

Ainda nao e validacao real de Supabase/RLS, triggers, quotas nem Cloudflare
externo. Faltam sessao real, escrita real minima em ambiente real, preview
externo Cloudflare e smoke mobile/desktop antes de tratar o v2 como versao
principal publicada.

Nao foram alterados runtime do app-v2, `index.html`, router, storage real,
Supabase/RLS, PDF/share, WhatsApp, billing, upload, PMOC ou v1/legado.
