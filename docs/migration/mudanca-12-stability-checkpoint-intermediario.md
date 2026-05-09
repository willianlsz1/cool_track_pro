# Mudanca 12 / CP-R - Stability checkpoint intermediario de Registro

## 1. Base

- Branch: `main`
- HEAD: `fe51d0696e7f6bd8308e085d08a2ddd18bb41695`
- Data: 2026-05-09
- Adapter analisado: `src/ui/views/registro.js`
- LOC atual de `src/ui/views/registro.js`: 1752

## 2. Objetivo

Checkpoint documental e de validacao depois da sequencia CP-D..CP-Q de Registro. O objetivo foi confirmar estado dos blocos extraidos, riscos remanescentes, arquitetura de imports e matriz de testes sem alterar `src/` nem testes.

## 3. Estado atual dos blocos extraidos

| Bloco/fluxo                      | Estado atual              | Arquivo principal                                                   | Teste existente                                                   | Risco atual | Observacao                                                                    |
| -------------------------------- | ------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| Contratos/selectors Registro     | Preservado                | `src/ui/viewModels/registroContracts.js`                            | `src/__tests__/contracts/registroSelectors.test.js`               | Baixo       | IDs, actions, classes, roots e fields seguem congelados.                      |
| Contrato registroId PDF/WhatsApp | Preservado                | `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`      | `src/__tests__/registroPdfWhatsappRegistroId.contract.test.js`    | Baixo/medio | Protege save/share, CTAs, fallback e filtros `registroId`.                    |
| Payload/validacao                | Extraido                  | `src/features/registro/save/payload.js`                             | `src/features/registro/__tests__/save/payload.test.js`            | Baixo       | `saveRegistro` ainda orquestra o uso.                                         |
| Fotos/evidencias                 | Extraido com DI           | `src/features/registro/save/photos.js`                              | `src/features/registro/__tests__/save/photos.test.js`             | Medio       | Upload/fallback/offline ainda sensivel, mas isolado de DOM.                   |
| Assinatura                       | Extraida com DI           | `src/features/registro/save/signature.js`                           | `src/features/registro/__tests__/save/signature.test.js`          | Medio       | Modal/storage/fallback preservados; comportamento real de `CANCELED` mantido. |
| Persistencia/state               | Helpers seguros extraidos | `src/features/registro/save/persistence.js`                         | `src/features/registro/__tests__/save/persistence.test.js`        | Medio       | Aplicacao de `setState` e side effects fortes continuam no adapter.           |
| Post-save/share                  | Helpers movidos com DI    | `src/features/registro/save/postSave.js`                            | `src/features/registro/__tests__/save/postSave.test.js`           | Medio       | Orquestradores de create/edit seguem explicitos.                              |
| ReportShare PDF/WhatsApp         | Helpers seguros extraidos | `src/features/registro/save/reportShare.js`                         | `src/features/registro/__tests__/save/reportShare.test.js`        | Baixo/medio | Nao importa relatorio/domain/handlers; usa DI.                                |
| `saveRegistro`                   | Legado/orquestrador       | `src/ui/views/registro.js`                                          | Testes legacy de Registro/save                                    | Alto        | Ainda concentra ordem do fluxo completo.                                      |
| Helpers restantes no adapter     | Parcialmente extraidos    | `src/ui/views/registro.js`                                          | Testes legacy/contratos                                           | Medio/alto  | DOM, React bridges, checklist, Profile e state continuam juntos.              |
| Relatorio/PDF                    | Nao alterado              | `src/ui/views/relatorio.js`, `src/domain/pdf.js`                    | `relatorio*`, `pdfGenerator.registroId`, `reportModel.registroId` | Alto        | Domain ainda tem dependencia conhecida de UI signature.                       |
| Historico                        | Nao alterado              | `src/ui/views/historico.js`                                         | `historico*`                                                      | Medio       | Consome assinatura/fotos e rotas legadas.                                     |
| Checklist/PMOC                   | No adapter                | `src/ui/views/registro.js`, `src/domain/pmoc/checklistTemplates.js` | `registroChecklist*`, `checklistTemplates`, `pmoc*`               | Medio/alto  | Gating Pro e estado React/legacy ainda acoplados ao adapter.                  |
| React islands de Registro        | Nao alteradas             | `src/react/pages/Registro*.jsx`                                     | `registro*Island`, legacy render tests                            | Medio       | Bridges/mounts continuam no adapter.                                          |
| Storage de fotos                 | Nao alterado              | `src/core/photoStorage.js`                                          | `photoStorage`, regressions photo                                 | Alto        | Supabase/offline/fallback sensivel.                                           |
| Storage de assinatura            | Nao alterado              | `src/core/signatureStorage.js`                                      | `signatureStorage`, `signatureFlush`, `signatureResolver`         | Alto        | Upload/fila/cache usados por PDF/historico.                                   |

## 4. Itens restantes no adapter

| Item restante no registro.js          | Tipo                   | Responsabilidade                                                     | Motivo para permanecer                                                  | Risco      | Recomendacao                                      |
| ------------------------------------- | ---------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| `saveRegistro`                        | Export/orquestrador    | Fluxo create/edit completo                                           | Mantem ordem legada entre payload, fotos, assinatura, state e post-save | Alto       | Manter ate mapear wrappers restantes.             |
| `initRegistro`                        | Export/orquestrador UI | Inicializacao DOM, route params, binds, React islands                | Alto acoplamento com DOM/route/bridges                                  | Medio/alto | Mapear antes de mover qualquer parte.             |
| `clearRegistro`                       | Export/side effect     | Reset form, checklist, assinatura, fotos e UI                        | Toca DOM/state visual                                                   | Medio      | Pre-split futuro com testes de reset.             |
| `loadRegistroForEdit`                 | Export/side effect     | Recarrega registro para edicao e popula UI                           | DOM, state, checklist, assinatura/fotos                                 | Alto       | Mapear fluxo edit antes de mexer.                 |
| Helpers de leitura DOM                | Helper local           | `getRegistroFormElements`, `readRegistroFormValues`, context reads   | Dependem de IDs publicos e focus                                        | Medio      | Manter no adapter ou criar wrappers com contrato. |
| Wrappers de validacao com Toast/focus | Helper local           | Validacao operacional e feedback                                     | Acoplados a Toast/focus                                                 | Medio      | So mover com DI e teste de erro/focus.            |
| Wrappers de state/setState            | Helper local           | Aplicar mutacoes edit/create                                         | Side effects fortes                                                     | Medio/alto | Manter ate CP especifico.                         |
| Wrappers Profile/sessionStorage       | Helper local           | Tecnico e ultimo cliente                                             | Storage/profile local                                                   | Medio      | Mover apenas com DI clara.                        |
| Wrappers amplos de post-save          | Helper local           | `runRegistroEditPostSaveEffects`, `runRegistroCreatePostSaveEffects` | Ordem Toast/reset/share/prompt                                          | Medio      | Manter como orquestradores por enquanto.          |
| Handlers de assinatura/hint           | Export/helper          | Capture/open/remove e hint React                                     | Modal, safe URL, draft cache                                            | Medio      | Mapear/mover wrappers de UI se necessario.        |
| Checklist/PMOC                        | Export/helpers         | Render, tri-state, medidas, gating                                   | Estado local + React island + plano                                     | Alto       | CP dedicado para checklist/PMOC.                  |
| Bridge/mount das ilhas React          | Helpers locais         | Header, checklist, photos, signature                                 | Dynamic import + generation guards                                      | Medio      | CP dedicado se objetivo for reduzir adapter.      |
| `applyQuickTemplate`                  | Export/DOM             | Preenche formulario e checklist rapido                               | DOM + rules de tipo                                                     | Medio      | Mapear junto com form helpers.                    |
| `_resolveRegistroClientFork`          | Helper async UI        | Escolha de cliente/destinatario                                      | Sheet/modal e contexto                                                  | Medio      | Manter no adapter ate CP de client fork.          |

## 5. Validacao de arquitetura

| Verificacao                                                       | Resultado | Evidencia                                                                                                      | Bloqueia avanco? |
| ----------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- | ---------------- |
| `features/registro` nao importa adapter principal                 | OK        | Grep encontrou apenas asserts em testes, nenhum import de producao                                             | Nao              |
| `saveRegistro` segue no adapter legado                            | OK        | Export em `src/ui/views/registro.js`                                                                           | Nao              |
| Features save nao importam DOM/React pages/handlers indevidamente | OK        | Modulos save usam DI; testes verificam ausencia de imports proibidos                                           | Nao              |
| Contratos CP-B preservados                                        | OK        | `registroSelectors.test.js` passou                                                                             | Nao              |
| Contrato registroId CP-O preservado                               | OK        | `registroPdfWhatsappRegistroId.contract.test.js` passou                                                        | Nao              |
| `postSave`/`reportShare` preservam `registroId`                   | OK        | `postSave.test.js`, `reportShare.test.js` e contrato CP-O passaram                                             | Nao              |
| Sem barrel `index.js` novo                                        | OK        | `find src/features/registro` lista apenas modulos save e testes                                                | Nao              |
| Sem `test.skip` novo                                              | OK        | Nenhum teste foi alterado neste CP                                                                             | Nao              |
| Sem alteracao em package/schema/CSS                               | OK        | Diff restrito a docs apos edicao                                                                               | Nao              |
| Warnings sao baseline ou ambiente                                 | OK        | 32 warnings lint ja existentes; Vite dynamic import/chunk warnings permanecem                                  | Nao              |
| `registro.js` LOC atual                                           | OK        | 1752 linhas                                                                                                    | Nao              |
| Modulos feature tem testes proprios                               | OK        | 6 modulos save e 6 testes feature presentes                                                                    | Nao              |
| Handlers publicos continuam apontando para APIs legadas           | OK        | `registroHandlers.js` chama `saveRegistro`/`clearRegistro`; routes chamam `initRegistro`/`loadRegistroForEdit` | Nao              |

## 6. Validacao de testes/build

| Validacao                    | Resultado           | Observacao                                                                                       |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| Bateria feature/contratos    | Passou              | 9 arquivos, 87 testes.                                                                           |
| Testes Registro relacionados | Passou              | `npm run test -- src/__tests__ --reporter=dot` passou; saida inclui warnings/stderr de baseline. |
| `npm run format`             | Passou              | Prettier executou sem alteracoes materiais.                                                      |
| `npm run check`              | Passou              | Lint + format:check + test + build passaram.                                                     |
| `npm run size`               | Falhou por ambiente | Script existe, mas `size-limit` nao esta disponivel no PATH local; nao foi instalado por escopo. |
| Playwright                   | Nao rodado          | Opcional; checkpoint ja cobriu suite Vitest ampla e `npm run check`.                             |

## 7. Warnings conhecidos

- `npm run check` manteve 32 warnings de lint, sem erro: unused vars/imports e regras de arquitetura ja existentes.
- Build manteve warnings Vite de dynamic import combinado com import estatico, incluindo `core/modal.js`, `core/router.js`, `core/auth.js`, `features/profile.js`, `PlanCache` e `ui/components/signature.js`.
- Suite ampla `src/__tests__` manteve stderr de baseline: JSDOM navigation not implemented, multiplas instancias Supabase `GoTrueClient`, logs de telemetry/route e warnings React `act(...)`.
- `npm run size` falhou por binario ausente (`size-limit`), sem alteracao de dependencias.

## 8. Riscos remanescentes

- `saveRegistro` ainda e o orquestrador legado central.
- Leitura DOM/form, Toast/focus e wrappers de validacao seguem no adapter.
- `setState`, Profile/sessionStorage e client fork continuam como side effects no adapter.
- Checklist/PMOC segue acoplado a gating de plano, React island e estado local.
- Relatorio/PDF domain ainda nao foi refatorado e tem acoplamento conhecido com UI signature.
- Historico consome fotos/assinatura e deve ser tratado com cuidado em qualquer corte futuro.
- Bridges/mount das ilhas React permanecem no adapter com dynamic imports.
- Lacunas restantes: ausencia de contrato unico por matriz quota/gating PDF vs WhatsApp e ausencia de validacao visual PDF.

## 9. Recomendacao final

**CP-S - mapear/mover wrappers restantes do saveRegistro.**

Justificativa: os blocos de save ja extraidos estao cobertos e sem import circular novo. O maior risco residual imediato esta nos wrappers que ainda cercam `saveRegistro` no adapter: DOM/form, Toast/focus, Profile/sessionStorage, setState e orquestradores amplos. Mapear esses wrappers antes de mexer em checklist/PMOC ou domain PDF reduz chance de regressao em fluxo central.
