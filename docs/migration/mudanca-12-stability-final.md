# Mudanca 12 - Registro / Stability final

## 1. Base

- Branch: main
- HEAD: 3c5cf497ef1e8a0a9120d2813aa9d575d59ae4b9
- Data: 2026-05-09
- Adapter analisado: `src/ui/views/registro.js`
- LOC atual de src/ui/views/registro.js: 1828

## 2. Objetivo

Consolidar o checkpoint final da Mudanca 12 / Registro, registrando estado final do adapter, modulos extraidos, contratos, validacoes, riscos remanescentes e decisao formal de encerramento.

## 3. Estado final dos blocos trabalhados

| Bloco/fluxo                      | Estado final                                  | Arquivo principal                                                              | Teste existente                                                                                  | Risco atual | Observacao                                                                        |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------- |
| Contratos/selectors Registro     | Preservados e cobertos                        | `src/ui/viewModels/registroContracts.js`                                       | `src/__tests__/contracts/registroSelectors.test.js`, `src/__tests__/contracts/selectors.test.js` | Baixo       | IDs/actions/classes continuam como contrato publico.                              |
| Contrato registroId PDF/WhatsApp | Preservado e coberto                          | `src/domain/pdf`, `src/ui/views/registro.js`                                   | `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`                                   | Baixo/medio | Fluxos legados ainda passam pelo adapter e handlers.                              |
| Contrato Checklist/PMOC          | Preservado e coberto                          | `src/ui/views/registro.js`, `src/features/registro/checklist/pmocChecklist.js` | `src/__tests__/registroChecklistPmoc.contract.test.js`                                           | Medio       | Estado e DOM/gate seguem no adapter.                                              |
| Contrato lifecycle               | Preservado e coberto                          | `src/ui/views/registro.js`                                                     | `src/__tests__/registroLifecycle.contract.test.js`                                               | Medio       | Orquestradores continuam no adapter por side effects.                             |
| Payload/validacao                | Extraido para feature save                    | `src/features/registro/save/payload.js`                                        | `src/features/registro/__tests__/save/payload.test.js`                                           | Baixo       | Helpers puros com cobertura propria.                                              |
| Fotos/evidencias                 | Extraido parcialmente para feature save       | `src/features/registro/save/photos.js`                                         | `src/features/registro/__tests__/save/photos.test.js`                                            | Medio       | Bridge/DOM e `Photos` continuam no adapter.                                       |
| Assinatura                       | Extraida parcialmente para feature save       | `src/features/registro/save/signature.js`                                      | `src/features/registro/__tests__/save/signature.test.js`                                         | Medio       | Hint/draft/remount continuam no adapter.                                          |
| Persistencia/state               | Extraida para feature save                    | `src/features/registro/save/persistence.js`                                    | `src/features/registro/__tests__/save/persistence.test.js`                                       | Baixo/medio | Mutacao de state ficou testada; aplicacao ainda orquestrada no adapter.           |
| Post-save/share                  | Extraido para feature save                    | `src/features/registro/save/postSave.js`                                       | `src/features/registro/__tests__/save/postSave.test.js`                                          | Medio       | Toast, router e callbacks entram por DI.                                          |
| reportShare PDF/WhatsApp         | Extraido para feature save                    | `src/features/registro/save/reportShare.js`                                    | `src/features/registro/__tests__/save/reportShare.test.js`                                       | Medio       | PDF/WhatsApp domain ainda tem acoplamentos maiores fora desta mudanca.            |
| Checklist/PMOC helpers           | Helpers seguros extraidos                     | `src/features/registro/checklist/pmocChecklist.js`                             | `src/features/registro/__tests__/checklist/pmocChecklist.test.js`                                | Medio       | DOM/state/gate ficaram no adapter.                                                |
| Lifecycle helpers                | Helpers seguros extraidos                     | `src/features/registro/lifecycle/helpers.js`                                   | `src/features/registro/__tests__/lifecycle/helpers.test.js`                                      | Baixo/medio | Somente helpers puros/baixo risco foram movidos.                                  |
| `saveRegistro`                   | Permanece no adapter como orquestrador legado | `src/ui/views/registro.js`                                                     | Contratos Registro/save e suites relacionadas                                                    | Alto        | Ainda coordena DOM, state, fotos, assinatura, checklist, persistence e post-save. |
| `initRegistro`                   | Permanece no adapter                          | `src/ui/views/registro.js`                                                     | `src/__tests__/registroLifecycle.contract.test.js`                                               | Medio/alto  | Root, bridges React, binds, defaults e Profile continuam acoplados.               |
| `clearRegistro`                  | Permanece no adapter                          | `src/ui/views/registro.js`                                                     | `src/__tests__/registroLifecycle.contract.test.js`, regressions                                  | Medio/alto  | Reset visual/media/signature/checklist continua com side effects.                 |
| `loadRegistroForEdit`            | Permanece no adapter                          | `src/ui/views/registro.js`                                                     | `src/__tests__/registroLifecycle.contract.test.js`, regressions                                  | Medio/alto  | Preenchimento DOM, guard e contexto visual continuam no adapter.                  |
| Relatorio/PDF domain             | Fora do corte de extracao principal           | `src/ui/views/relatorio.js`, `src/domain/pdf*`                                 | `relatorio*`, `reportModel.registroId`, `pdfGenerator.registroId`                                | Medio/alto  | Recomendado como proxima mudanca tecnica.                                         |
| Historico                        | Preservado, nao refatorado nesta mudanca      | `src/ui/views/historico.js`                                                    | `historico*`                                                                                     | Medio       | Consome registros e links de edicao; deve ser tratado separadamente.              |
| React islands de Registro        | Preservadas                                   | `src/react/pages/Registro*.jsx`                                                | `registro*Island`, legacy render tests, Playwright                                               | Medio       | Bridges/mount/unmount continuam no adapter.                                       |

## 4. Itens restantes no adapter

| Item restante no registro.js                | Tipo                  | Responsabilidade                                                                                    | Motivo para permanecer                                 | Risco      | Recomendacao futura                                        |
| ------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------- | ---------------------------------------------------------- |
| `saveRegistro`                              | Orquestrador publico  | Salvar, editar, compartilhar, validar, persistir, limpar e pos-save                                 | Ainda integra muitos side effects e contratos publicos | Alto       | So mover apos novo mapa/contrato de orquestracao.          |
| `initRegistro`                              | API publica lifecycle | Montar tela, roots React, defaults, binds e contexto inicial                                        | Depende de DOM, Profile, PlanCache, Photos e bridges   | Medio/alto | Manter ate corte dedicado com DI estreita.                 |
| `clearRegistro`                             | API publica lifecycle | Reset de formulario, edicao, fotos, assinatura, checklist e UI                                      | Reset visual e storage/estado local ficam acoplados    | Medio/alto | Separar helpers com side effects por grupo antes de mover. |
| `loadRegistroForEdit`                       | API publica lifecycle | Restaurar registro em modo edicao                                                                   | Usa DOM, sessionStorage, guard, checklist e labels     | Medio/alto | Extrair apenas apos proteger detalhes visuais restantes.   |
| Helpers DOM/form                            | Adapter local         | Ler/preencher campos, progress, details e visibilidade                                              | Dependem de IDs e `Utils`                              | Medio      | Manter como composition root ate reduzir DOM API.          |
| Wrappers Toast/focus                        | Adapter local         | Avisos, foco e UX final                                                                             | Side effects de UI direta                              | Medio      | Injetar por callback se houver nova extracao.              |
| Wrappers setState                           | Adapter/local state   | Aplicar mutacoes de registros/equipamentos                                                          | Integram `getState`/`setState` e reconciliacao         | Medio      | Preservar ate mapa de state orchestration.                 |
| Profile/sessionStorage                      | Adapter local         | Defaults, ultimo cliente/tecnico e modo edicao                                                      | Storage global e route guard                           | Medio      | Mover somente com interface de storage testada.            |
| Bridge/mount/unmount React                  | Adapter local         | Montar/desmontar header, checklist, fotos e assinatura                                              | Composition root da tela                               | Medio/alto | Manter no adapter; mover exige arquitetura de bridge.      |
| Wrappers DOM/state/gate Checklist/PMOC      | Adapter local         | Gate Pro, render, updates, reset e restore                                                          | DOM, PlanCache e `_currentChecklist`                   | Medio/alto | Futuro CP dedicado, sem misturar com save.                 |
| Wrappers fotos/assinatura presos ao adapter | Adapter local         | Render visual, hint, draft e pending photos                                                         | Componentes legados e bridge UI                        | Medio      | Extrair somente partes puras adicionais.                   |
| Helpers grandes restantes                   | Adapter local         | Contexto, hero, cliente fork, templates e progress                                                  | Misturam UI, state e contratos                         | Medio/alto | Mapear por dominio antes de mover.                         |
| Exports publicos restantes                  | API publica           | `initRegistro`, `saveRegistro`, `clearRegistro`, `loadRegistroForEdit`, checklist/signature helpers | Usados por routes, handlers e testes legados           | Medio      | Preservar ate nova mudanca.                                |

## 5. Validacao de arquitetura

| Verificacao                                                    | Resultado | Evidencia                                                                                     | Bloqueia encerramento? |
| -------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| features/registro nao importam adapter principal               | OK        | `rg` encontrou apenas asserts de testes `not.toContain('ui/views/registro')`, sem import real | Nao                    |
| Adapter segue como composition root legado                     | OK        | Routes/handlers ainda importam `src/ui/views/registro.js`                                     | Nao                    |
| `saveRegistro` permanece no adapter por decisao consciente     | OK        | Export publico em `src/ui/views/registro.js`                                                  | Nao                    |
| `init/clear/edit` permanecem no adapter por decisao consciente | OK        | Exports publicos preservados no adapter                                                       | Nao                    |
| Contratos CP-B/CP-O/CP-U/CP-Y passam                           | OK        | Bateria feature/contratos passou: 13 arquivos, 108 testes                                     | Nao                    |
| Modulos feature tem testes proprios                            | OK        | Save, checklist e lifecycle possuem testes em `src/features/registro/__tests__`               | Nao                    |
| Sem barrel `index.js` novo                                     | OK        | Nenhum `index.js` novo criado em Registro neste CP                                            | Nao                    |
| Sem `test.skip` novo                                           | OK        | CP-AD nao alterou testes                                                                      | Nao                    |
| Sem alteracao package/schema/CSS                               | OK        | Diff restrito a docs neste CP                                                                 | Nao                    |
| Warnings sao baseline ou conhecidos                            | OK        | Lint: 32 warnings; Vitest/JSDOM/Supabase/React act; Vite dynamic import/chunk                 | Nao                    |
| Diff do CP e apenas documentacao                               | OK        | Somente docs permitidos foram alterados                                                       | Nao                    |
| Riscos remanescentes documentados                              | OK        | Secao 8 deste documento                                                                       | Nao                    |

## 6. Validacao de testes/build

| Validacao                                                                    | Resultado           | Observacao                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Bateria feature/contratos                                                    | Passou              | 13 arquivos, 108 testes.                                                                                   |
| Testes Registro/relatorio/historico/checklist/storage/lifecycle relacionados | Passou              | 39 arquivos, 292 testes.                                                                                   |
| `npm run test -- src/__tests__ --reporter=dot`                               | Passou              | Exit 0; saida longa com warnings conhecidos.                                                               |
| `npm run format`                                                             | Passou              | Executado depois das alteracoes documentais.                                                               |
| `npm run check`                                                              | Passou              | Lint/format/test/build com exit 0.                                                                         |
| `npm run size`                                                               | Falhou por ambiente | Script existe, mas `size-limit` nao foi encontrado; sem correcao neste CP.                                 |
| Playwright                                                                   | Passou              | `node_modules/.bin/playwright.cmd test -c e2e/playwright.config.js --reporter=list`: 15 passed, 9 skipped. |

## 7. Warnings conhecidos

- `npm run check` manteve 32 warnings de lint baseline, sem erros.
- Build/Vite manteve warnings conhecidos de dynamic import/chunk e chunk maior que 500 kB.
- Vitest amplo manteve logs/warnings conhecidos de JSDOM navigation not implemented, multiplas instancias Supabase GoTrueClient e React `act(...)` em testes existentes.
- `npm run size` nao rodou por falta do binario `size-limit` no ambiente local.
- Nenhum warning novo foi associado a alteracao de codigo, porque CP-AD alterou apenas documentacao.

## 8. Riscos remanescentes

- `saveRegistro` ainda permanece no adapter e segue como orquestrador de maior risco.
- `initRegistro`, `clearRegistro` e `loadRegistroForEdit` ainda permanecem no adapter por dependerem de DOM, storage, bridges React e estado visual.
- Wrappers DOM/state/gate de Checklist/PMOC ainda ficam no adapter.
- Relatorio/PDF domain ainda possui acoplamentos relevantes e deve virar nova mudanca tecnica.
- Historico ainda depende de fluxos legados de Registro e deve ser tratado separadamente.
- Bridges React de Registro seguem no adapter como composition root.
- Profile/sessionStorage/localStorage continuam como side effects no adapter.
- Possiveis lacunas de teste restantes estao concentradas em ordem visual detalhada e integracoes E2E nao executadas em ambiente CI real neste CP.
- Import circular novo nao foi identificado em `features/registro`.

## 9. Decisao final

**Encerrar Mudanca 12 e seguir para proxima mudanca.**

Proxima mudanca tecnica recomendada: **Mudanca 13 - relatorio/PDF domain**.

Justificativa: Registro ja teve contratos, save, payload, fotos, assinatura, persistencia, post-save, report/share, Checklist/PMOC e lifecycle estabilizados. Os riscos remanescentes mais relevantes agora estao fora do corte seguro de Registro e se concentram no dominio de relatorio/PDF, com acoplamentos entre `domain/`, `ui/`, handlers e export/WhatsApp.
