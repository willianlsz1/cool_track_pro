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

| Capacidade v1                                              | Evidencia v1                                                             | Equivalente v2 atual                                                      | Status           | Melhoria permitida                                                       | Validacao necessaria                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| Abrir registro direto a partir de equipamento              | `startServiceRegistration(params)` aceita `equipId`                      | `startServiceFromEquipment(state, equipmentId)`                           | coberto          | Manter entrada contextual com visual v2                                  | Teste shell + teste action              |
| Abrir registro sem equipamento com seletor/picker          | `startServiceRegistration` usa `openEquipPicker` quando nao ha `equipId` | escolha de equipamento no app-v2 antes de iniciar o fluxo                 | coberto          | Criar escolha de equipamento dentro do fluxo v2 sem copiar picker legado | Teste shell para inicio sem equipamento |
| Orientar criacao de equipamento quando nao ha equipamentos | `mode: create-equipment`                                                 | estado vazio orienta ir para Equipamentos antes do registro               | coberto          | Estado vazio acionavel para criar equipamento antes do registro          | Teste de estado vazio                   |
| Validar equipamento existente                              | `validateRegistroPayloadDraftData` usa `existingEquipamentos`            | `completeService` valida equipamento existente e shell mostra erro local  | coberto          | Validacao amigavel antes de concluir                                     | Teste de dominio/action + shell         |
| Validar data obrigatoria e valida                          | `validateRegistroPayload`                                                | `completeService` valida data simples do contrato mockado                 | coberto          | Manter data simples no fluxo, sem storage real                           | Teste de payload/action + shell         |
| Validar tipo de servico                                    | `tipo` obrigatorio e `Outro` customizado validado                        | v2 possui opcoes e descricao customizada local para `Outro`               | coberto          | Campo curto para detalhe de `Outro` quando selecionado                   | Teste view model + shell                |
| Validar tecnico obrigatorio                                | v1 exige `tecnico` no fluxo padrao                                       | v2 possui campo local de tecnico no draft e bloqueia revisao sem valor    | coberto          | Campo local sem lista global nem storage real                            | Teste de conclusao                      |
| Registrar diagnostico/observacoes                          | `obs` vira `descricaoFinal`                                              | registro mockado preserva diagnostico, acoes e `observacoes` compatível   | coberto          | Separar diagnostico, acoes e observacoes no contrato v2                  | Teste action + relatorio                |
| Registrar pecas                                            | `pecas` persistido                                                       | v2 possui campo opcional de pecas no draft, registro mockado e relatorio  | coberto          | Campo textual opcional sem custos, estoque ou orcamento real             | Teste view model + action + shell       |
| Registrar custos                                           | `custoPecas` e `custoMaoObra` persistidos                                | v2 possui custos opcionais no draft, registro mockado e relatorio         | coberto          | Captura opcional sem virar orcamento real                                | Teste payload + relatorio               |
| Registrar proxima manutencao                               | `proxima` validado e persistido                                          | v2 possui `proximaData` opcional e cria compromisso mockado no fechamento | coberto          | Agendamento simples do proximo compromisso                               | Teste action + shell                    |
| Atualizar status do equipamento apos salvar                | `buildRegistroCreateStateMutation` atualiza `equipamentos.status`        | `completeService` atualiza status do equipamento                          | coberto          | Manter regra pura e testavel                                             | Teste action                            |
| Adicionar tecnico novo                                     | v1 atualiza `tecnicos` se tecnico novo nao existe                        | app-v2 snapshot nao possui lista de tecnicos                              | fora desta etapa | Decidir contrato de tecnico antes de storage real                        | Documento de contrato                   |
| Editar registro existente                                  | `buildRegistroEditStateMutation`                                         | app-v2 nao possui edicao de registro                                      | fora desta etapa | Planejar depois da criacao/conclusao ficar estavel                       | Matriz futura                           |
| Manter historico automaticamente                           | v1 adiciona registro em `state.registros`                                | `completeService` adiciona registro no mock                               | coberto          | Exibir historico consultavel por Servicos                                | Teste shell                             |
| Pos-salvamento com PDF/WhatsApp/toast/fallback             | `notifyRegistroCreateSaved` e `runRegistroDirectShareAfterSave`          | v2 tem preview/print simples e relatorios mockados                        | parcial          | Manter relatorio local; WhatsApp/PDF real em etapa sensivel              | Teste relatorio + plano sensivel        |
| Prompt de proxima preventiva apos salvar                   | `runRegistroPreventivaPromptAfterSave`                                   | v2 cria compromisso mockado quando a data e informada, sem prompt legado  | parcial          | Agendamento simples no fechamento                                        | Teste shell                             |

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
