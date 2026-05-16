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

| Capacidade v1                                              | Evidencia v1                                                             | Equivalente v2 atual                                                   | Status           | Melhoria permitida                                                       | Validacao necessaria                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| Abrir registro direto a partir de equipamento              | `startServiceRegistration(params)` aceita `equipId`                      | `startServiceFromEquipment(state, equipmentId)`                        | coberto          | Manter entrada contextual com visual v2                                  | Teste shell + teste action              |
| Abrir registro sem equipamento com seletor/picker          | `startServiceRegistration` usa `openEquipPicker` quando nao ha `equipId` | escolha de equipamento no app-v2 antes de iniciar o fluxo              | coberto          | Criar escolha de equipamento dentro do fluxo v2 sem copiar picker legado | Teste shell para inicio sem equipamento |
| Orientar criacao de equipamento quando nao ha equipamentos | `mode: create-equipment`                                                 | estado vazio orienta ir para Equipamentos antes do registro            | coberto          | Estado vazio acionavel para criar equipamento antes do registro          | Teste de estado vazio                   |
| Validar equipamento existente                              | `validateRegistroPayloadDraftData` usa `existingEquipamentos`            | v2 lança erro se equipamento nao existe                                | parcial          | Validacao amigavel antes de concluir                                     | Teste de dominio/action                 |
| Validar data obrigatoria e valida                          | `validateRegistroPayload`                                                | v2 usa `today` mockado                                                 | parcial          | Manter data simples no fluxo, sem storage real                           | Teste de payload/action                 |
| Validar tipo de servico                                    | `tipo` obrigatorio e `Outro` customizado validado                        | v2 possui opcoes, mas `outro` nao tem texto customizado                | parcial          | Campo curto para detalhe de `Outro` quando selecionado                   | Teste view model + shell                |
| Validar tecnico obrigatorio                                | v1 exige `tecnico` no fluxo padrao                                       | v2 possui campo local de tecnico no draft e bloqueia revisao sem valor | coberto          | Campo local sem lista global nem storage real                            | Teste de conclusao                      |
| Registrar diagnostico/observacoes                          | `obs` vira `descricaoFinal`                                              | `diagnosis` e `actionsDone` viram `observacoes` concatenadas           | parcial          | Separar diagnostico, acoes e observacoes no contrato v2                  | Teste action + relatorio                |
| Registrar pecas                                            | `pecas` persistido                                                       | nao ha equivalente no draft v2                                         | regressao        | Campo opcional em etapa futura do fluxo                                  | Teste payload                           |
| Registrar custos                                           | `custoPecas` e `custoMaoObra` persistidos                                | nao ha equivalente no draft v2                                         | regressao        | Captura opcional sem virar orcamento real                                | Teste payload                           |
| Registrar proxima manutencao                               | `proxima` validado e persistido                                          | existe `scheduleNextCommitment`, mas nao esta integrado ao fechamento  | parcial          | Agendamento simples do proximo compromisso                               | Teste action + shell                    |
| Atualizar status do equipamento apos salvar                | `buildRegistroCreateStateMutation` atualiza `equipamentos.status`        | `completeService` atualiza status do equipamento                       | coberto          | Manter regra pura e testavel                                             | Teste action                            |
| Adicionar tecnico novo                                     | v1 atualiza `tecnicos` se tecnico novo nao existe                        | app-v2 snapshot nao possui lista de tecnicos                           | fora desta etapa | Decidir contrato de tecnico antes de storage real                        | Documento de contrato                   |
| Editar registro existente                                  | `buildRegistroEditStateMutation`                                         | app-v2 nao possui edicao de registro                                   | fora desta etapa | Planejar depois da criacao/conclusao ficar estavel                       | Matriz futura                           |
| Manter historico automaticamente                           | v1 adiciona registro em `state.registros`                                | `completeService` adiciona registro no mock                            | coberto          | Exibir historico consultavel por Servicos                                | Teste shell                             |
| Pos-salvamento com PDF/WhatsApp/toast/fallback             | `notifyRegistroCreateSaved` e `runRegistroDirectShareAfterSave`          | v2 tem preview/print simples e relatorios mockados                     | parcial          | Manter relatorio local; WhatsApp/PDF real em etapa sensivel              | Teste relatorio + plano sensivel        |
| Prompt de proxima preventiva apos salvar                   | `runRegistroPreventivaPromptAfterSave`                                   | nao integrado ao fluxo v2                                              | regressao        | Agendamento simples no fechamento                                        | Teste shell                             |

## 4. Lacunas prioritarias

1. Falta suporte a pecas, custos e `proxima` no contrato do draft.
2. `Outro` nao permite descricao customizada.
3. Agendamento de proximo compromisso existe como action, mas nao esta ligado ao
   fechamento do fluxo.
4. Pos-salvamento do v1 tinha WhatsApp/PDF/fallback; no v2 isso deve permanecer
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

## 8. Proximo checkpoint recomendado

Implementar apenas a proxima lacuna do Registro de Servico:

> Campo `Outro` deve permitir descricao customizada no Registro de Servico do
> app-v2, sem alterar storage real e sem copiar UI legado.

Escopo sugerido:

- app-v2 apenas;
- sem storage real;
- sem PDF/share;
- sem WhatsApp real;
- sem alterar package/config;
- testes focados em draft, revisao, conclusao e relatorio.

Esse checkpoint preserva paridade v1 sem abrir areas sensiveis.
