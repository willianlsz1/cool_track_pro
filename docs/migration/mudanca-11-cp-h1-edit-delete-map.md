# Mudanca 11 / CP-H.1 - Mapeamento de deleteEquip e openEditEquip

## 1. Base

- Branch: `main`
- HEAD: `6a4a53d6e42f52e4c1b0e72f9af6ce8a10650f7d`
- Data: `2026-05-08`
- Adapter analisado: `src/ui/views/equipamentos.js`
- LOC atual de `src/ui/views/equipamentos.js`: `1440`

## 2. Objetivo

Mapear em modo read-only os fluxos `deleteEquip` e `openEditEquip` ainda implementados no adapter legado de Equipamentos, preparando um CP posterior de pre-split in-place sem alterar codigo de producao, testes ou contratos DOM.

## 3. Mapeamento de deleteEquip

| Etapa do deleteEquip            | Responsabilidade                                      | Dependencias                                                   | Side effects                                               | Risco                         | Pode virar helper?                                  |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------- | --------------------------------------------------- |
| Assinatura publica              | `export async function deleteEquip(id)`               | Chamadores em `equipmentHandlers.js`; contratos `delete-equip` | API publica do adapter                                     | Medio                         | Nao isolado; manter export ate mover fluxo completo |
| Leitura de registros            | Captura `registros` para achar historico vinculado    | `getState()`                                                   | Nenhum direto                                              | Baixo                         | Sim, `resolveLinkedRegistroIds`                     |
| Calculo de registros vinculados | Filtra registros por `equipId === id` e mapeia ids    | Shape de `registros`                                           | Nenhum direto                                              | Medio, por remocao cascateada | Sim                                                 |
| Marcacao de exclusao            | Marca equipamento e registros para persistencia/sync  | `Storage.markEquipDeleted(id, linkedRegistros)`                | Queue/remocao local/remota conforme storage                | Alto                          | Sim, mas com DI de `Storage`                        |
| Mutacao de estado               | Remove equipamento e registros do state               | `setState`                                                     | Atualiza `equipamentos` e `registros` em memoria           | Alto                          | Sim, `removeEquipFromState`                         |
| Fechamento de modal detail      | Fecha `modal-eq-det`                                  | dynamic import `../../core/modal.js`                           | `Modal.close('modal-eq-det')`                              | Medio                         | Sim, `closeDeletedEquipDetailModal`                 |
| Tratamento de erro de modal     | Mantem remocao mesmo se modal falhar                  | `handleError`, `ErrorCodes.NETWORK_ERROR`                      | Warning com contexto `equipamentos.deleteEquip.closeModal` | Medio                         | Sim                                                 |
| Refresh da lista                | Re-renderiza equipamentos                             | `renderEquip`                                                  | Atualiza lista/header/list bridges indiretamente           | Alto                          | Injetar no futuro                                   |
| Refresh global header           | Atualiza shell global                                 | `updateGlobalHeader`                                           | Atualiza contadores/header                                 | Medio                         | Injetar no futuro                                   |
| Feedback final                  | Mostra sucesso                                        | `Toast.info`                                                   | Toast "Equipamento removido."                              | Baixo                         | Sim                                                 |
| Comportamento silencioso        | Nao valida existencia do equipamento antes de remover | `id` recebido                                                  | Mesmo id inexistente passa por storage/state/render/toast  | Medio                         | Documentar antes de alterar                         |

## 4. Mapeamento de openEditEquip

| Etapa do openEditEquip     | Responsabilidade                                                                | Dependencias                                                                                                                                | Side effects                                                  | Risco | Pode virar helper?                                  |
| -------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----- | --------------------------------------------------- |
| Assinatura publica         | `export async function openEditEquip(id, opts = {})`                            | Chamadores em `equipmentHandlers.js`; contratos `edit-equip`                                                                                | API publica do adapter                                        | Medio | Nao isolado; manter export ate mover fluxo completo |
| Resolucao do equipamento   | Busca por id                                                                    | `findEquip(id)`                                                                                                                             | Retorna silenciosamente se nao existir                        | Medio | Sim, `resolveEditableEquip`                         |
| Estado de edicao           | Define id em edicao                                                             | `setEditingEquipId`                                                                                                                         | State compartilhado de save/edit                              | Alto  | Sim, mas junto de fluxo de form                     |
| Resolucao de foco          | Normaliza `opts.focusField`                                                     | `opts`                                                                                                                                      | Nenhum direto                                                 | Baixo | Sim                                                 |
| Preenchimento base do form | Preenche nome/local/tag/tipo/fluido/modelo/criticidade/prioridade/periodicidade | `Utils.setVal`                                                                                                                              | Mutacao de inputs do `modal-add-eq`                           | Alto  | Sim, `populateEditEquipBaseFields`                  |
| Visibilidade de componente | Sincroniza wrapper de componente por tipo                                       | `syncComponenteVisibility`                                                                                                                  | Oculta/limpa `eq-componente` se tipo nao usa componente       | Medio | Reusar helper existente                             |
| Dados de placa             | Restaura dados fixos da placa                                                   | `restoreDadosPlaca`                                                                                                                         | Mutacao dos inputs de etiqueta                                | Alto  | Sim, helper dedicado                                |
| Extras/nameplate metadata  | Semeia extras e metadata                                                        | `setCamposExtrasState`, `setNameplateMetadata`                                                                                              | Atualiza UI/estado do review de placa; catch silencioso       | Alto  | Sim, preservar fallback                             |
| Periodicidade manual       | Marca input como manual                                                         | `Utils.getEl('eq-periodicidade')`                                                                                                           | `dataset.manual = '1'`                                        | Medio | Sim                                                 |
| Painel tecnico             | Abre `eq-step-2`                                                                | DOM `eq-step-2`                                                                                                                             | `display = block`, `aria-hidden=false`                        | Medio | Sim                                                 |
| Billing/gates              | Busca plano, quota e gate de nameplate                                          | `Promise.all`, `fetchMyProfileBilling`, `hasProAccess`, `hasPlusAccess`, `getMonthlyUsageSnapshot`, `supabase`, `applyNameplateCtaGate`     | Popula setor, aplica estado active/trial/locked               | Alto  | Sim, mas exige DI/isolamento cuidadoso              |
| Fallback billing/gate      | Mantem UI funcional se imports/billing falharem                                 | `populateSetorSelect(false)`, dynamic import `nameplateCapture`                                                                             | Gate locked/fallback; catch silencioso                        | Alto  | Sim, preservar exatamente                           |
| Setor salvo                | Aplica `eq.setorId` no select                                                   | `Utils.setVal('eq-setor')`                                                                                                                  | Mutacao do select                                             | Medio | Sim                                                 |
| Cliente salvo              | Agenda set do cliente apos populate externo                                     | `requestAnimationFrame`, `document.getElementById('eq-cliente')`                                                                            | Mutacao assíncrona do select                                  | Alto  | Sim, documentar timing                              |
| Textos/CTAs do modal       | Troca titulo, label primario e oculta botoes secundarios                        | `Utils.getEl`, `document.getElementById`, `setEquipActionButtonVisible`, `setEquipActionTrayButtonLabel`, `setEquipActionFooterHintVisible` | Muda UI do footer/action tray                                 | Alto  | Sim                                                 |
| Troca de modal             | Fecha detail e abre form                                                        | dynamic import `../../core/modal.js`                                                                                                        | `Modal.close('modal-eq-det')`, `Modal.open('modal-add-eq')`   | Alto  | Sim, com DI                                         |
| Erro de modal              | Trata falha ao abrir edicao                                                     | `handleError`, `ErrorCodes.NETWORK_ERROR`                                                                                                   | Reporta erro e retorna antes do foco                          | Medio | Sim                                                 |
| Foco opcional              | Foca campo solicitado pelo detail                                               | `_focusEditField`                                                                                                                           | Expande accordions, scroll/focus/highlight com RAF/setTimeout | Alto  | Manter separado                                     |

## 5. Helpers acoplados

| Helper relacionado                              | Usado por                                  | Responsabilidade                                                | Acoplamento DOM/state                          | Risco | Candidato a CP |
| ----------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------- | ----- | -------------- |
| `clearEditingState`                             | save/open modal/reset                      | Reseta modo edicao, labels, fotos, nameplate e contexto forçado | Alto: state, DOM, `EquipmentPhotos`, nameplate | Alto  | CP-H.2/H.3     |
| `applyEquipModalExperience`                     | open modal handler                         | Aplica experiencia Free/Pro e CTA conforme contexto             | Alto: DOM, rota, plano, contexto               | Alto  | CP-H.3         |
| `clearForcedEquipContext`                       | reset/contexto                             | Limpa contexto cliente/setor travado                            | Alto: state + DOM                              | Medio | CP-H.3         |
| `lockEquipContext`                              | contexto vindo de cliente/setor            | Trava cliente/setor e dispara change                            | Alto: state + DOM/events                       | Alto  | CP-H.3         |
| `syncComponenteVisibility`                      | open/edit/save/reset                       | Mostra/oculta componente por tipo                               | Medio: DOM + `Utils`                           | Medio | CP-H.2         |
| `populateSetorSelect`                           | render/open edit/open modal                | Popula select Pro de setores                                    | Alto: state, DOM, plano via caller             | Medio | CP-H.2/H.3     |
| `populateEquipSelects`                          | outros fluxos                              | Popula selects de equipamento e datalist tecnico                | Alto: state + DOM                              | Medio | CP-H.4         |
| `_focusEditField`                               | `openEditEquip`                            | Expande accordions, scroll, foco e highlight                    | Alto: DOM, RAF, setTimeout                     | Alto  | CP-H.2         |
| `_closeSaveEquipModal`                          | save                                       | Fecha `modal-add-eq` com warning em falha                       | Medio: Modal + erro                            | Medio | CP-H.3         |
| `_resetSaveEquipForm`                           | save                                       | Limpa campos e reseta estado de edicao                          | Alto: DOM, dados de placa, componente          | Alto  | CP-H.3         |
| `_refreshSaveEquipViews`                        | save                                       | Atualiza dashboard/lista/header                                 | Alto: dynamic import + render global           | Alto  | CP-H.3         |
| `restoreDadosPlaca`                             | `openEditEquip`                            | Restaura campos da placa no form                                | Alto: form de placa                            | Alto  | CP-H.2         |
| `setCamposExtrasState` / `setNameplateMetadata` | `openEditEquip`                            | Semeia review UI e metadata da placa                            | Medio: componente nameplate                    | Alto  | CP-H.2         |
| `applyNameplateCtaGate`                         | `openEditEquip`                            | Gate da analise de placa                                        | Alto: plano, quota, UI                         | Alto  | CP-H.2         |
| `Modal.close/open`                              | `deleteEquip`, `openEditEquip`, save/setor | Fecha/abre modais legados                                       | Alto: side effect global                       | Alto  | CP-H.2/H.3     |

## 6. Testes existentes relacionados

- `src/__tests__/equipamentosLegacySetorDetailHandlers.test.js`: cobre handlers `edit-equip` e `delete-equip`, incluindo `focusField` e ids maliciosos, com `openEditEquip`/`deleteEquip` mockados.
- `src/__tests__/equipamentosReactHeaderLegacyHandlers.test.jsx`: cobre abertura do modal de equipamento em fluxos React/header e uso de `focusField`.
- `src/__tests__/equipamentosLegacyRender.test.js`: cobre presenca dos botoes `edit-equip` e `delete-equip` no detail legado.
- `src/features/equipamentos/__tests__/ui/detail.test.js`: cobre HTML extraido com `data-action="edit-equip"` e `data-action="delete-equip"`.
- `src/features/equipamentos/__tests__/utils/detail.test.js`: cobre CTAs acionaveis de risco/detail que apontam para `edit-equip`.
- `src/__tests__/equipamentosSaveEquip.test.js`: cobre save/reset/modal e mocks de `restoreDadosPlaca`, `markEquipDeleted` e nameplate; e indireto para helpers compartilhados.
- `src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js`: cobre gates de fotos/nameplate e mocks de `openEditEquip`/`deleteEquip`.
- `src/__tests__/storage.integration.test.js`: cobre `Storage.markEquipDeleted` em nivel de storage.
- `src/__tests__/contracts/selectors.test.js`: cobre contratos estaticos de `edit-equip`, `delete-equip` e `modal-add-eq`.

## 7. Riscos principais

- Modal: `openEditEquip` fecha `modal-eq-det` e abre `modal-add-eq`; `deleteEquip` fecha `modal-eq-det` mas continua mesmo se o close falhar.
- Estado de edicao: `setEditingEquipId(id)` precisa continuar alinhado com `saveEquip` e `clearEditingState`.
- Billing/gates: `Promise.all` de monetization/plans/nameplate/usageLimits e fallback nested com `supabase` mantem comportamento Free/Plus/Pro.
- Dados de placa: `restoreDadosPlaca`, extras e metadata precisam preservar fallback silencioso quando UI ainda nao montou.
- Fotos/evidencias: `clearEditingState` limpa `EquipmentPhotos`; `openEditEquip` nao manipula fotos diretamente desde V4.
- Refresh global: `deleteEquip` atualiza state, `renderEquip`, `updateGlobalHeader` e toast; alterar ordem muda a percepcao da UI.
- Import circular: nao ha import novo de feature para adapter; `features/equipamentos/utils/viewModels.js` ainda importa constantes/helpers em submodulos de `ui/views/equipamentos`, nao o adapter raiz.
- Delete remoto/local: `Storage.markEquipDeleted` recebe ids de registros vinculados; mudar esse calculo pode deixar historico orfao.
- Comportamento silencioso/fallback: `openEditEquip` retorna se nao encontra eq; varios catches sao intencionais e nao devem virar erro visivel.

## 8. Opcoes de proximo CP

| Opcao de proximo CP                            | Beneficio                                                | Risco                                  | Pre-requisitos                               | Recomendacao   |
| ---------------------------------------------- | -------------------------------------------------------- | -------------------------------------- | -------------------------------------------- | -------------- |
| CP-H.2 - pre-split in-place de `openEditEquip` | Reduz o maior bloco acoplado e prepara testes por helper | Alto, por billing/modal/nameplate/foco | Manter no adapter, preservar ordem e catches | Recomendado    |
| CP-H.2 - pre-split in-place de `deleteEquip`   | Corte pequeno e simples                                  | Pode gerar CP pouco valioso isolado    | Mapear storage/state/render                  | Nao principal  |
| CP-H.2 - pre-split conjunto edit/delete        | Resolve os dois exports                                  | Mistura riscos e aumenta diff          | Testes focados robustos                      | Nao recomendar |
| CP-H.2 - mover `renderFlatList`/list branch    | Continua limpeza do render                               | Desvia de edit/delete ja mapeados      | Novo mapeamento de lista                     | Adiar          |
| CP-H.2 - limpar helpers de modal/form          | Ataca dependencias comuns                                | Pode virar refactor amplo              | Pre-split de `openEditEquip` primeiro        | Adiar          |
| Stability checkpoint pos-Mudanca 11            | Aumenta confianca geral                                  | Nao reduz adapter                      | Suite/check recentes verdes                  | Apos CP-H.2    |

## 9. Recomendacao final

Proximo CP recomendado: **CP-H.2 - pre-split in-place de `openEditEquip`**.

Justificativa: `openEditEquip` e o fluxo mais longo e arriscado remanescente no adapter, concentra form, dados de placa, billing/gates, setor, modal e foco. Um pre-split local, sem mover arquivo, permite separar responsabilidades com diff revisavel antes de qualquer extracao. A confianca e superior a 90% porque o mapeamento identificou limites claros de helpers e testes relacionados que protegem contratos de action/modal/detail.
