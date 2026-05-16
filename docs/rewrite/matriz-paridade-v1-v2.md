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

| Fluxo                                 | Comportamento v1 util                                                                                                                          | Fontes v1 analisadas                                                                                     | Equivalente v2 atual                                                                                              | Lacunas                                                    | Decisao v2                                                       | Escopo permitido       | Escopo proibido                                   | Testes necessarios                   | Status                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------- | ------------------------------------------------- | ------------------------------------ | --------------------------- |
| Registro de Servico                   | Criar, validar, concluir, editar, alimentar historico, relatorio e proxima preventiva                                                          | `src/features/registro/save/*`, `src/ui/views/registro.js`                                               | Fluxo progressivo app-v2 com mock local, edicao e relatorio local                                                 | PDF/WhatsApp real fora                                     | Preservar fluxo por etapas e substituir prompt por campo interno | app-v2/mock/testes     | storage, PDF/share, WhatsApp, PMOC                | action, view model, shell, relatorio | coberto                     |
| Historico de Servicos                 | Listar registros, consultar por equipamento/cliente e abrir relatorio/registro                                                                 | `src/features/historico/*`, `src/ui/viewModels/historicoViewModel.js`                                    | `Servicos > Registros` lista recentes, permite busca local e permite editar/reabrir relatorio por caminhos locais | filtros por periodo/cliente dedicados ainda limitados      | Evoluir dentro de Servicos, sem aba global nova                  | view model e UI minima | router novo, storage real, PMOC                   | view model + shell                   | parcial                     |
| Relatorios                            | Gerar visao por registros, filtrar e reabrir documento                                                                                         | `src/ui/views/relatorio.js`, `src/ui/viewModels/relatorioViewModel.js`                                   | `Servicos > Relatorios` com busca, KPIs, preview e print local                                                    | PDF/share/WhatsApp real fora                               | Relatorio local cobre leitura; integracoes ficam sensiveis       | relatorio local/mock   | PDF/share real, WhatsApp real                     | relatorio + shell                    | parcial                     |
| Equipamentos                          | Listar, consultar detalhe, status, cliente/local, criar/editar e iniciar servico                                                               | `src/ui/viewModels/equipamentosViewModel.js`, `src/features/equipamentos/*`                              | Area Equipamentos com lista, detalhe, cliente/local, criar/editar mockado e iniciar servico                       | estado vazio/onboarding e campos avancados ainda limitados | Preservar equipamento como centro operacional                    | mock/local/UI minima   | storage real, Supabase/RLS                        | equipment action + shell             | parcial                     |
| Clientes                              | Listar, abrir detalhe, ver equipamentos vinculados, consultar servicos relacionados, criar e editar cadastro basico                            | `src/core/clientes.js`, `src/ui/viewModels/clientes*`, `src/ui/viewModels/equipamentosViewModel.js`      | Clientes como subvisao de Equipamentos com detalhe, equipamentos vinculados, servicos relacionados e CRUD mockado | relatorio/filtro dedicado por cliente limitados            | Cliente continua subvisao forte, nao aba global                  | mock/local/UI minima   | storage real, PMOC, Supabase/RLS                  | clients action + shell               | parcial                     |
| Alertas e proximas acoes              | Priorizar status critico, falta de historico critico, preventiva vencida/proxima, reincidencia corretiva, criticidade e prioridade operacional | `src/domain/maintenance.js`, `src/domain/constants/alerts.js`, `src/ui/viewModels/dashboardViewModel.js` | Home operacional consome `buildHomeAlerts`, prioriza alerta critico, exibe contador e lista curta de alertas      | notificacao/calendario real fora; regras avancadas futuras | Migrar como dominio puro/mock antes de integracoes reais         | dominio puro + mock    | notificacao real, calendario real, storage        | home priority tests + shell          | coberto por substituicao v2 |
| Orcamentos                            | Acompanhar pipeline, vincular cliente/equipamento/registro e resumir valores                                                                   | `src/ui/viewModels/orcamentosViewModel.js`, `src/domain/orcamentoFollowUp.js`                            | Subvisao `Servicos > Orcamentos` com lista mockada e KPIs locais                                                  | criar/editar/assinar/baixar/enviar fora                    | Primeira fase so acompanha mock local                            | view model + UI minima | billing, assinatura, PDF/share, WhatsApp, storage | view model + shell                   | parcial                     |
| Configuracoes operacionais simples    | Atalhos e preferencias operacionais                                                                                                            | `src/ui/views/configuracoes.js`                                                                          | Conta placeholder sem acoes operacionais                                                                          | atalhos simples nao mapeados                               | Mapear antes de implementar                                      | doc/view model         | billing, assinatura, storage real                 | shell                                | pendente mock               |
| Estados vazios e onboarding funcional | Orientar primeiro cadastro/primeiro atendimento                                                                                                | `src/ui/viewModels/dashboardViewModel.js`, `src/features/equipamentos/*`                                 | Estado vazio de Servicos orienta criacao e inicia registro apos primeiro equipamento mockado                      | onboarding completo ainda limitado                         | Usar mensagens locais e CTA contextual                           | UI minima              | redesign final                                    | shell                                | parcial                     |
| Pos-salvamento local                  | Oferecer saidas apos salvar e fallback                                                                                                         | `src/features/registro/save/postSave.js`                                                                 | Done state com relatorio local, proxima manutencao no fluxo e historico atualizado                                | orcamento a partir do fechamento ainda nao implementado    | Substituir prompts por saidas v2 progressivas                    | mock/local             | PDF/share real, WhatsApp real                     | shell + action                       | parcial                     |

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
