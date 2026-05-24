# Mudanca 16 - Stability geral / E2E / cache / Inventario inicial

## 1. Base

- Branch: `main`
- HEAD: `59e633b98fba1a5bfa5ce73e8022c118f31ae627`
- Data: `2026-05-09`
- Arquivos analisados:
  - `src/ui/views/equipamentos.js` (1155 LOC)
  - `src/ui/views/registro.js` (1828 LOC)
  - `src/ui/views/relatorio.js` (751 LOC)
  - `src/ui/views/historico.js` (1621 LOC)
  - `src/ui/views/dashboard.js` (1165 LOC)
  - `src/core/storage.js` (419 LOC)
  - `src/core/state.js` (69 LOC)
  - `src/core/router.js` (541 LOC)
  - `src/ui/controller/handlers/*.js`
  - `src/__tests__`, `src/features`, `e2e/specs`
  - documentos de stability checkpoints anteriores em `docs/migration`
- Scripts/validacoes inspecionados:
  - `npm run test`
  - `npm run format`
  - `npm run check`
  - `npm run build`
  - `npm run size`
  - `npm run test:e2e`
  - `npx playwright test -c e2e/playwright.config.js --reporter=list`

## 2. Objetivo

Mapear o estado geral de estabilidade do app antes de novos cortes profundos, cobrindo E2E, cache, armazenamento, offline/fallback, rotas criticas, warnings de lint/build, chunks grandes e lacunas de teste. Este CP nao autoriza alteracao de codigo de producao nem testes.

## 3. Estado geral por area

| Area                  | Estado atual                                                                                            | Testes existentes                                                                                                          | Risco atual | Proxima acao sugerida                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| Equipamentos          | Mudanca 11 encerrada; adapter ainda grande e fluxo de fotos/nameplate/paywall sensivel                  | Muitos testes em `src/__tests__/equipamentos*` e `src/features/equipamentos/__tests__`; E2E visual e legacy photos/paywall | Medio/alto  | Consolidar E2E minimo que atravesse equipamento real ate Registro |
| Registro              | Mudanca 12 encerrada; adapter ainda concentra save, edit, fotos, assinatura, checklist, PMOC e pos-save | `registro*`, lifecycle, regressions, save/signature/photos/checklist; E2E post-save parcialmente skipped                   | Alto        | Priorizar fluxo E2E Registro com fotos/assinatura/checklist       |
| Relatorio/PDF         | Mudanca 13 encerrada; `reportExportHandlers.js` ainda concentra quota, PDF, share e PMOC                | `reportExport*`, `pdf*`, `whatsapp*`, relatorio islands; E2E relatorio export/PMOC                                         | Medio/alto  | Mapear chunks e handlers de export antes de alterar               |
| Cover PDF             | Mudanca 14 encerrada; contratos de cover e checklist cursor existem                                     | `pdfCover*`, `pdfCoverChecklistCursor*`                                                                                    | Medio       | Manter contratos antes de qualquer ajuste visual PDF              |
| Historico             | Mudanca 15 encerrada; helpers seguros extraidos, adapter ainda 1621 LOC                                 | Contratos CP-B/CP-H/CP-L/CP-O, helper tests e E2E historico smoke                                                          | Medio       | Nao mexer antes de stability geral/cache/E2E                      |
| Dashboard             | React islands e legacy adapter ainda acima de 1000 LOC                                                  | `dashboard*`, view model, charts refresh, premium, islands, lifecycle E2E                                                  | Medio       | Cobrir dashboard KPIs em fluxo E2E com dados reais                |
| Clientes              | Pro/paywall, PMOC e offline fallback existem; acesso depende de plano/cache                             | `clientes*`, `clientes.offline`, `clientesRouteAccess`, PMOC tests                                                         | Medio       | Adicionar E2E cliente -> equipamento -> PMOC                      |
| Orcamentos            | Fluxo separado com assinatura/PDF e visual smoke E2E                                                    | `orcamentos*`, handlers e visual smoke                                                                                     | Medio       | Manter fora de cortes iniciais da Mudanca 16                      |
| PMOC                  | Espalhado entre Clientes, Registro, Relatorio/PDF e core                                                | `clientePmoc`, `pmocProgress`, `pmocReport`, `registroChecklistPmoc`, relatorio PMOC                                       | Alto        | Mapear fluxo PMOC mensal ponta a ponta antes de refatorar         |
| Storage/cache/offline | `core/storage.js`, state, userStorage, photo/signature queues, plan cache e filtros usam storage/cache  | `storage.integration`, `storage-shape`, `clientes.offline`, `photoStorage`, `signatureStorage`, plan/cache tests           | Alto        | Fazer checkpoint especifico de storage/cache/offline              |
| Rotas/navegacao       | Router tem guards, history, modal layers, popstate e rotas criticas                                     | `router.test`, `routes.test`, `router-error-boundary`, route lifecycle tests, Playwright navigation                        | Medio/alto  | Criar contrato/E2E minimo de rotas cruzadas                       |
| Auth/billing/plano    | Auth, OAuth pending, billing cache e paywalls usados por varias areas                                   | `auth.integration`, `clientesAccess`, premium/paywall tests, monetization tests                                            | Medio       | Mapear cache de plano e fallback de billing                       |
| E2E/Playwright        | Suite existe com 24 testes; CP-R passou com 15 passed / 9 skipped                                       | `e2e/specs/*.spec.js`                                                                                                      | Medio       | Definir smoke minimo obrigatorio e reduzir skips estrategicos     |
| Build/chunks          | Build passa, mas Vite aponta imports dinamicos/estaticos e chunks > 500 kB                              | `npm run check` / build                                                                                                    | Medio       | Mapear chunks e entradas duplicadas antes de mexer                |
| Lint/warnings         | Baseline recente: 30 warnings, 0 erros                                                                  | `npm run lint` dentro de `check`                                                                                           | Medio       | Limpar warnings por grupo sem misturar comportamento              |

## 4. Validacoes disponiveis e resultado atual

| Validacao               | Comando                                                           | Resultado esperado                | Resultado atual     | Observacao                                                 |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------- | ------------------- | ---------------------------------------------------------- |
| Testes unit/integration | `npm run test -- src/__tests__ --reporter=dot`                    | Exit 0                            | Passou              | Mantem warnings conhecidos de Supabase/JSDOM/React act     |
| Formatacao              | `npm run format`                                                  | Exit 0                            | Passou              | Prettier processou o novo doc; diff continuou restrito     |
| Check completo          | `npm run check`                                                   | Exit 0                            | Passou              | Lint 0 erros / 30 warnings; format:check, test e build OK  |
| Build isolado           | `npm run build`                                                   | Exit 0                            | Coberto por `check` | Nao rodado isoladamente; build passou dentro do `check`    |
| Size limit              | `npm run size`                                                    | Exit 0 se `size-limit` disponivel | Falhou por ambiente | `size-limit` nao foi reconhecido; nenhuma dependencia nova |
| Playwright              | `npx playwright test -c e2e/playwright.config.js --reporter=list` | Exit 0                            | Passou              | 15 passed / 9 skipped em 24 testes                         |
| Lint especifico         | `npm run lint`                                                    | 0 erros                           | Coberto por `check` | Baseline atual: 30 warnings, 0 erros                       |
| CSS dead check          | `npm run lint:css:dead`                                           | Inventario auxiliar               | Nao rodado neste CP | Docs anteriores indicam dependencia ausente para purgecss  |

## 5. Warnings e dividas baseline

| Warning/divida                          | Origem               | Evidencia                                                                                                   | Impacto                                          | Prioridade  | Tratamento sugerido                                          |
| --------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------- | ------------------------------------------------------------ |
| 30 warnings lint baseline               | `npm run check` CP-R | Unused vars, restricted imports e `renderSummaryCard` sem uso                                               | Ruido em validacao e risco de mascarar regressao | Alta        | CP dedicado para limpar warnings por grupos                  |
| Restricted imports                      | ESLint / arquitetura | `core/storage/*` importando `domain`, `domain/pdf/shareReport.js` importando UI, componente importando view | Acoplamento reverso e barreiras fracas           | Alta        | Corrigir em grupos pequenos com contratos                    |
| Unused vars                             | ESLint               | `app.js`, PDF, onboarding, report handlers, historico                                                       | Ruido e possivel codigo morto                    | Media       | Remover/renomear somente com testes verdes                   |
| Dynamic/static import no mesmo chunk    | Vite build           | Warnings para router, modal, planos, historico, equipamentos, handlers                                      | Code splitting perde efeito e chunks crescem     | Alta        | Mapear entradas e imports antes de mudar                     |
| Chunks grandes > 500 kB                 | Vite build           | Warning de chunk size no build                                                                              | Performance e carregamento inicial               | Alta        | CP de chunk audit/manualChunks/import strategy               |
| `size-limit` indisponivel               | `npm run size`       | CP-R: comando nao reconheceu binario                                                                        | Sem gate de bundle local                         | Media       | Corrigir ambiente/script em CP proprio sem instalar neste CP |
| JSDOM navigation                        | Vitest/JSDOM         | Warnings conhecidos em testes de navegacao                                                                  | Ruido de teste                                   | Baixa/media | Isolar ou documentar helper de navigation mock               |
| Supabase Multiple GoTrueClient          | Vitest/Auth          | Warnings conhecidos em testes                                                                               | Ruido e possivel interferencia futura            | Media       | Mapear lifecycle de mocks Supabase                           |
| React `act(...)`                        | Tests React          | Warnings em testes de landing/a11y                                                                          | Pode esconder updates assíncronos reais          | Media       | Corrigir por arquivo de teste em CP proprio                  |
| Layout sem pixel-test                   | UI visual            | Contratos focam DOM/semantica; poucos pixel checks                                                          | Regressao visual silenciosa                      | Media       | Definir smoke visual Playwright por rotas criticas           |
| Cache/session/localStorage side effects | Storage/adapters     | Historico, Registro, Relatorio, Auth/plano e signatures usam storage                                        | Estado invisivel e regressao cruzada             | Alta        | Checkpoint cache/storage/offline                             |

## 6. Fluxos E2E sugeridos

| Fluxo E2E sugerido                                         | Areas envolvidas                                           | Risco que cobre                                                        | Dados necessarios                                                       | Prioridade |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| Criar equipamento -> registrar servico -> Historico -> PDF | Equipamentos, Registro, Historico, Relatorio/PDF           | Quebra cruzada de state/storage/rotas/export                           | Fixture de usuario autenticado, equipamento minimo, registro preventivo | Alta       |
| Registro com fotos/assinatura/checklist -> PDF/WhatsApp    | Registro, photoStorage, signatureStorage, PDF, WhatsApp    | Midia, assinatura, checklist e share divergirem                        | Fotos mockadas, assinatura data URL, checklist PMOC                     | Alta       |
| Historico edit/delete -> Registro/state                    | Historico, Registro, Storage, Router                       | Editar/deletar registro errado ou stale state                          | Dois registros/equipamentos, confirm mockado                            | Alta       |
| Filtros Historico + export PDF/WhatsApp                    | Historico, reportExportHandlers, PDF/share                 | `data-registro-id` ou `filters.registroId` perdidos com filtros ativos | Registros de cliente/equip/setor diferentes                             | Alta       |
| Equipamentos detail/edit/delete                            | Equipamentos, setores, fotos, nameplate, dashboard refresh | Status/card/lista divergirem apos CRUD                                 | Equipamentos com setores e placa/fotos mockadas                         | Alta       |
| PMOC mensal/relatorio                                      | Clientes, Equipamentos, Registro checklist, Relatorio PMOC | PMOC formal inconsistente entre areas                                  | Cliente Pro, equipamentos, registros do mes                             | Media/alta |
| Offline/cache/fallback                                     | Storage, clientes, fotos, assinatura, sync queue           | Dados locais perdidos ou sync inconsistente                            | Supabase mock offline, localStorage persistente                         | Alta       |
| Login/auth/plano                                           | Auth, billing, plan cache, paywall                         | Plano/cache divergente bloqueando fluxos                               | Sessao mockada, billing free/plus/pro                                   | Media      |
| Dashboard KPIs                                             | Dashboard, Equipamentos, Registro, Alerts                  | KPIs stale apos CRUD                                                   | Equipamentos e registros com datas/status variados                      | Media      |

## 7. Cache/storage/offline

| Area cache/storage     | Arquivo                                                    | Responsabilidade                                       | Risco                                 | Teste existente                                    | Proximo tratamento             |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------- | -------------------------------------------------- | ------------------------------ |
| State global           | `src/core/state.js`                                        | Estado em memoria e notificacoes                       | Mutacao cruzada entre telas           | Indireto em muitos testes                          | Mapear subscribers e resets    |
| Storage principal      | `src/core/storage.js` e `src/core/storage/*`               | Save/load local, remote sync, deletions e normalizacao | Divergencia local/remoto e tombstones | `storage.integration`, `storage-shape`             | CP de checkpoint storage/cache |
| `localStorage` geral   | Varios adapters/core                                       | Persistencia local de estado, plano, usuario, filtros  | Estado invisivel entre rotas/sessoes  | Varios testes com mocks                            | Inventariar chaves e donos     |
| `sessionStorage`       | Registro/Historico                                         | Edit mode, filtros e contexto temporario               | Edit mode ou filtro preso             | Historico filters, Registro lifecycle/regressions  | Contrato por chaves criticas   |
| Filas pending/offline  | `signatureStorage`, `photoStorage`, storage sync           | Upload pendente e retry                                | Perda de midia ou duplicidade         | `photoStorage`, `signatureStorage`                 | E2E/mocks de offline           |
| Fotos/evidencias       | `src/core/photoStorage.js`                                 | Upload, refs, fallback legacy base64                   | PDF sem midia ou payload grande       | `photoStorage`, Registro photos tests              | Fluxo E2E com foto mockada     |
| Assinatura             | `src/core/signatureStorage.js`, UI signature               | Upload/cache/queue e resolver PDF/viewer               | Assinatura perdida no PDF/historico   | `signatureStorage`, Registro signature tests       | Fluxo E2E assinatura           |
| Deletes tombstone      | `core/storage/syncState.js`, `Storage.markRegistroDeleted` | Evitar ressurreicao remota                             | Delete local/remoto inconsistente     | `storage.integration`, Historico Registro contract | Teste E2E delete confirmado    |
| Supabase/fallback      | `src/core/supabase.js`, storage/clientes/orcamentos        | Backend e fallback offline                             | Estado parcial se rede falha          | Auth/clientes offline/storage tests                | Mapear falhas por area         |
| Cache de plano/billing | `src/core/plans/*`                                         | Plan cache, monetization, paywall                      | Bloqueio indevido ou acesso indevido  | `clientesAccess`, premium, monetization            | CP de auth/plano/cache         |
| Cache de filtros       | Historico/Relatorio adapters                               | Preservar filtros e view mode                          | Filtros invisiveis ou stale           | Historico filters contract, Relatorio tests        | Incluir em checkpoint cache    |

## 8. Riscos principais

- Regressao entre areas por fluxos cruzados ainda concentrados em adapters e handlers.
- Cache/storage com fontes multiplas (`localStorage`, `sessionStorage`, state, queues e Supabase).
- E2E ainda insuficiente para cobrir todos os caminhos de midia, assinatura, PDF/WhatsApp e offline.
- Chunks grandes e imports dinamicos/estaticos duplicados continuam sem tratamento dedicado.
- Warnings baseline podem mascarar regressao nova.
- Offline/fallback depende de mocks e filas locais que precisam de inventario proprio.
- Auth/plano/cache pode bloquear ou liberar areas erradas.
- Fluxo PMOC cruza Clientes, Equipamentos, Registro, Relatorio e PDF.
- Layout visual ainda nao tem pixel-test sistematico por rota critica.

## 9. Sequencia recomendada da Mudanca 16

| Ordem | CP                                             | Objetivo                                             | Escopo permitido                | Risco       | Criterio de aprovacao                                                |
| ----: | ---------------------------------------------- | ---------------------------------------------------- | ------------------------------- | ----------- | -------------------------------------------------------------------- |
|     1 | CP-A - inventario geral                        | Mapear estabilidade, E2E, cache e warnings           | Documentacao e validacao        | Baixo       | Inventario criado, validacoes registradas, proximo CP definido       |
|     2 | CP-B - contrato/rota E2E minimo critico        | Fortalecer contrato cruzado principal                | Teste integrado Vitest + docs   | Medio       | Fluxo equipamento -> registro -> historico -> PDF/WhatsApp protegido |
|     3 | CP-C - cache/storage/offline checkpoint        | Mapear chaves, queues, fallback e sync               | Documentacao + validacao        | Baixo/medio | Donos de cache e riscos documentados                                 |
|     4 | CP-D - contratos cache/storage criticos        | Travar chaves e fallback de storage/cache            | Testes apenas                   | Medio       | Contratos de storage/cache passam sem producao alterada              |
|     5 | CP-E - limpar warnings lint baseline por grupo | Reduzir ruido sem comportamento novo                 | Codigo/testes por grupo pequeno | Medio       | Warnings reduzidos e `check` passa                                   |
|     6 | CP-F - mapear chunks/dynamic import            | Inventariar entradas duplicadas e chunks grandes     | Documentacao + build analysis   | Baixo/medio | Plano de chunking com riscos e alvos                                 |
|     7 | CP-G - ajuste seguro de chunks                 | Ajustar imports/manual chunks se mapeamento permitir | Build config/codigo minimo      | Medio/alto  | Build passa e sem regressao E2E smoke                                |
|     8 | CP-H - stability final Mudanca 16              | Consolidar resultados e decidir encerramento         | Documentacao e validacao        | Baixo       | Checkpoint final com working tree limpa                              |

## 10. CP-B aplicado

- Tipo de teste escolhido: contrato integrado Vitest em `src/__tests__/criticalFlow.contract.test.js`.
- Justificativa: Playwright existe, mas parte da suite ainda depende de skips/dados de navegador; o contrato Vitest protege a costura critica sem login, rede real ou Supabase.
- Fluxo coberto:
  - fixture de equipamento `eq-critical-1` vinculada ao registro `reg-critical-1`;
  - render real da timeline/card do Historico;
  - preservacao de `data-id` para edit/delete;
  - preservacao de `data-registro-id` para `export-pdf` e `whatsapp-export`;
  - chamada de `exportPdfFlow` via handler registrado com `filters.registroId`;
  - chamada de `shareWhatsAppFlow`/`shareReportPdf` com o mesmo `registroId`;
  - fallback sem fotos, assinatura e checklist mantendo actions principais.
- Lacunas remanescentes:
  - nao exercita browser real nem CSS/layout;
  - nao cria registro via formulario real;
  - nao usa Supabase/cache real;
  - nao cobre midia/assinatura/checklist com payload completo neste CP.
- Validacoes rodadas:
  - `npm run test -- src/__tests__/criticalFlow.contract.test.js --reporter=dot`;
  - bateria relacionada de Historico/Registro/PDF/WhatsApp;
  - `npm run test -- src/__tests__ --reporter=dot`;
  - `npm run format`;
  - `npm run check`.

## 11. CP-C aplicado

- Checkpoint criado em `docs/migration/mudanca-16-cache-storage-offline-checkpoint.md`.
- Escopo: documental + validacoes existentes; nenhum teste novo foi necessario neste CP.
- Areas mapeadas:
  - Storage central, state, `localStorage`, `sessionStorage`;
  - fotos/evidencias e assinatura;
  - Registro save/edit e Historico delete/tombstone;
  - PDF/WhatsApp fallback;
  - plano/billing/cache;
  - filtros Historico;
  - filas pending/offline e Supabase fallback.
- Lacunas principais:
  - E2E real de save/reload com foto, assinatura e checklist;
  - bootstrap completo com cache local legado e remoto indisponivel;
  - inventario completo de chaves de storage;
  - drain de fila de fotos pendentes;
  - multiusuario/multiaba para cache owner e plano.
- Validacoes rodadas:
  - bateria storage/cache/offline;
  - bateria relacionada ampla;
  - `npm run test -- src/__tests__ --reporter=dot`;
  - `npm run format`;
  - `npm run check`.

## 12. CP-D aplicado

- Contrato criado em `src/__tests__/storageCacheOffline.contract.test.js`.
- Escopo: testes/docs; nenhum codigo de producao foi alterado.
- Caminhos cobertos:
  - nomes e shapes das chaves criticas `cooltrack_v3`, `cooltrack-sync-dirty-v1`, `cooltrack-sync-deletions-v1`, `cooltrack-cache-owner-v1`, `cooltrack-sig-pending-upload` e `cooltrack-cached-plan`;
  - parsing tolerante de tombstones/deletion queue com JSON invalido;
  - bootstrap com cache local valido e Supabase/remoto indisponivel para o mesmo owner;
  - isolamento de cache quando o owner local difere do usuario atual;
  - preservacao de tombstones e pending sync quando o drain remoto falha;
  - shape de foto pendente, assinatura legacy/pendente e cache de plano/hidratacao da sessao.
- Lacunas remanescentes:
  - nao cobre browser real, service worker, multiaba real ou rede real;
  - drain de fila de fotos segue coberto por helpers, sem E2E de flush completo;
  - inventario automatico de todas as chaves storage/session ainda pode ser formalizado em CP posterior.
- Validacoes rodadas:
  - `npm run test -- src/__tests__/storageCacheOffline.contract.test.js --reporter=dot`;
  - bateria relacionada storage/cache/offline;
  - `npm run test -- src/__tests__ --reporter=dot`;
  - `npm run format`;
  - `npm run check`.

## 13. CP-E aplicado

- Escopo: limpeza segura de warnings ESLint por grupo pequeno, sem mudanca funcional.
- Grupo atacado:
  - `no-unused-vars` em imports, variaveis locais, parametros privados e funcoes privadas sem uso;
  - `eslint-disable` obsoleto em helper de teste.
- Warning count:
  - antes: 30 warnings, 0 erros;
  - depois: 6 warnings, 0 erros;
  - delta: -24 warnings.
- Arquivos alterados:
  - `src/app.js`;
  - `src/core/photoStorage.js`;
  - `src/core/storage.js`;
  - `src/domain/pdf/orcamentoPdf.js`;
  - `src/domain/pdf/sections/cover.js`;
  - `src/ui/components/onboarding/profileModal.js`;
  - `src/ui/components/orcamentoModal.js`;
  - `src/ui/components/registroEquipPicker.js`;
  - `src/ui/controller/handlers/reportExportHandlers.js`;
  - `src/ui/views/historico.js`;
  - `src/__tests__/helpers/axe.js`.
- Warnings mantidos:
  - 6 warnings de `no-restricted-imports` em storage/domain/UI;
  - warnings Vite de dynamic/static import e chunks grandes no build.
- Motivo para manter:
  - restricted imports exigem corte arquitetural com contratos dedicados;
  - chunks exigem mapeamento antes de mexer em imports/build.
- Validacoes rodadas:
  - `npm run format`;
  - `npm run check`;
  - bateria focada de contratos recentes;
  - `npm run test -- src/__tests__ --reporter=dot`.

## 14. CP-F aplicado

- Escopo: limpeza de `no-restricted-imports` por grupo pequeno, sem mudanca funcional.
- Warnings analisados:
  - 4 imports de `src/core/storage/*` para `src/domain/maintenance.js`;
  - 1 import de `src/ui/components/nameplateCapture.js` para `src/ui/views/equipamentos/placaData.js`;
  - 1 import de `src/domain/pdf/shareReport.js` para `src/ui/components/onboarding/onboardingChecklist.js`.
- Warnings corrigidos:
  - storage passou a consumir normalizacao pura em `src/core/maintenanceNormalization.js`;
  - `src/domain/maintenance.js` reexporta os helpers para preservar API publica;
  - metadata do nameplate foi isolada em `src/ui/components/nameplateMetadata.js`, removendo o import de component para view.
- Warning mantido:
  - `src/domain/pdf/shareReport.js -> src/ui/components/onboarding/onboardingChecklist.js`;
  - motivo: corrigir com seguranca exige inverter o hook explicito de onboarding do fallback de download/share PDF; manter para CP dedicado evita mudar efeito colateral de PDF/WhatsApp neste corte.
- Warning count:
  - antes: 6 warnings, 0 erros;
  - depois: 1 warning, 0 erros;
  - delta: -5 warnings.
- Arquivos alterados:
  - `src/core/maintenanceNormalization.js`;
  - `src/core/storage/normalizers.js`;
  - `src/core/storage/remote.js`;
  - `src/core/storage/storageNormalizers.js`;
  - `src/core/storage/storageRemoteSync.js`;
  - `src/domain/maintenance.js`;
  - `src/ui/components/nameplateCapture.js`;
  - `src/ui/components/nameplateMetadata.js`;
  - `src/ui/views/equipamentos/placaData.js`.
- Validacoes rodadas:
  - `npm run check`;
  - `npm run format`;
  - bateria base de estabilidade;
  - bateria storage;
  - bateria completa `npm run test -- src/__tests__ --reporter=dot`.

## 15. CP-G aplicado

- Escopo: mapeamento read-only dos warnings Vite de dynamic/static import e chunks grandes.
- Documento criado:
  - `docs/rewrite/checkpoints-recentes-resumo.md`.
- Estado observado:
  - `npm run check` passou;
  - `npm run build` passou;
  - ESLint manteve 1 warning conhecido de `no-restricted-imports` em `src/domain/pdf/shareReport.js`;
  - Vite manteve warnings de dynamic/static import em 22 modulos;
  - chunks/assets principais registrados: `index.*.js` 960,519 B, `vendor-pdf.*.js` 776,011 B, `index.*.css` 544,286 B e `cooling-tech.*.png` 1,941,137 B.
- Causas mapeadas:
  - imports estaticos e dinamicos misturados em core (`utils`, `supabase`, `storage`, `state`, `modal`, `router`, `auth`);
  - views/rotas com imports mistos (`equipamentos`, `historico`, `clientes`, `dashboard`);
  - PDF/share/plano/perfil espalhados entre handlers e dominio;
  - islands React pequenas, mas entry principal ainda grande por infraestrutura compartilhada.
- Nenhum `src/`, teste, package, config, CSS ou schema foi alterado neste CP.

## 16. CP-H aplicado

- Escopo: correcao pequena e reversivel de warning Vite de static+dynamic import.
- Grupo escolhido: Clientes / `populateClienteSelect`.
- Arquivos alterados:
  - `src/ui/controller/handlers/clienteHandlers.js`;
  - `src/ui/controller/handlers/equipmentHandlers.js`;
  - `src/ui/controller/handlers/navigationHandlers.js`.
- Mudanca realizada:
  - removidos tres `import('../../views/clientes.js')` usados apenas para obter `populateClienteSelect`;
  - `populateClienteSelect` passou a vir de import estatico, porque `views/clientes.js` ja era importado estaticamente pelo bootstrap de rotas/handlers.
- Warning corrigido:
  - `src/ui/views/clientes.js` deixou de aparecer como modulo importado dinamica e estaticamente no build.
- Warning count Vite static+dynamic:
  - antes: 22 modulos;
  - depois: 21 modulos;
  - delta: -1 modulo.
- Chunks/top assets apos ajuste:
  - `index.*.js` 959,903 B;
  - `vendor-pdf.*.js` 776,011 B;
  - `index.*.css` 544,286 B;
  - `cooling-tech.*.png` 1,941,137 B.
- Warnings mantidos:
  - core transversal (`utils`, `supabase`, `storage`, `state`, `modal`, `router`, `auth`);
  - planos/usage (`subscriptionPlans`, `planCache`, `monetization`, `usageLimits`);
  - views/fluxos maiores (`equipamentos`, `historico`, `dashboard`, `orcamentoHandlers`, `signature`, `nameplateCapture`, `contextState`, `core/clientes`);
  - chunk size > 500 kB.
- Validacoes rodadas:
  - `npm run build`;
  - `npm run format`;
  - `npm run check`;
  - bateria base de estabilidade;
  - bateria focada de Clientes/Equipamentos;
  - bateria completa `npm run test -- src/__tests__ --reporter=dot`.

## 17. CP-I aplicado

- Escopo: correcao pequena de warning Vite de static+dynamic import, sem mexer em PDF/share/vendor/manualChunks.
- Grupo escolhido: Equipamentos setores / `domain/maintenance.js`.
- Arquivo de codigo alterado:
  - `src/ui/views/equipamentos/setores.js`.
- Mudanca realizada:
  - removido o `import('../../../domain/maintenance.js')` cacheado localmente em `setores.js`;
  - `evaluateEquipmentHealth` passou a vir de import estatico direto, porque `domain/maintenance.js` ja era inevitavelmente estatico no grafo por dashboard/equipamentos/relatorio e dominio.
- Warning corrigido:
  - `src/domain/maintenance.js` deixou de aparecer como modulo importado dinamica e estaticamente no build.
- Warning count Vite static+dynamic:
  - antes: 21 modulos;
  - depois: 20 modulos;
  - delta: -1 modulo.
- Chunks/top assets apos ajuste:
  - `index.*.js` 954,360 B;
  - `vendor-pdf.*.js` 775,020 B;
  - `index.*.css` 544,270 B;
  - `cooling-tech.*.png` 1,941,140 B.
- Warnings mantidos:
  - core transversal (`utils`, `supabase`, `storage`, `state`, `modal`, `router`, `auth`);
  - planos/usage (`subscriptionPlans`, `planCache`, `monetization`, `usageLimits`);
  - views/fluxos maiores (`equipamentos`, `historico`, `dashboard`, `orcamentoHandlers`, `signature`, `nameplateCapture`, `contextState`, `core/clientes`);
  - chunk size > 500 kB;
  - 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js`.
- Validacoes rodadas:
  - `npm run format`;
  - `npm run build`;
  - `npm run check`;
  - bateria focada de Equipamentos/manutencao.

## 18. CP-J aplicado

- Escopo: fechamento documental da Mudanca 16 e criacao de guardrails para agentes.
- Decisao:
  - encerrar a Mudanca 16 como base estavel operacional;
  - nao continuar removendo warnings Vite indefinidamente nesta fase;
  - tratar warnings remanescentes como backlog tecnico controlado.
- Base de referencia:
  - ultimo CP de codigo concluido: CP-I;
  - HEAD de referencia antes do CP-J: `28f846f731a3d0a51b1c69e9385ecebe6486130e`;
  - status aproximado da base: 98-99%.
- Estado conhecido ao encerrar:
  - `npm run build` passa;
  - `npm run check` passa;
  - testes focados dos CPs recentes passaram;
  - 20 warnings Vite static+dynamic permanecem como backlog tecnico controlado;
  - 1 warning ESLint arquitetural conhecido permanece em `src/domain/pdf/shareReport.js`.
- Documento de governanca criado:
  - `AGENTS.md`.
- Guardrails registrados:
  - regra de 99% de certeza para codigo, arquitetura, contratos publicos, seguranca, storage, permissoes, PDF/share e fluxos criticos;
  - preservacao das camadas `core/`, `domain/`, `ui/`, `features/`, `react/` e `docs/`;
  - contratos publicos que exigem CP dedicado;
  - regras para warnings Vite static+dynamic;
  - areas sensiveis que exigem CP proprio;
  - separacao explicita de Codex Security e React Doctor.
- Backlog controlado:
  - 20 warnings Vite static+dynamic remanescentes;
  - CP dedicado futuro para `src/domain/pdf/shareReport.js`;
  - React Doctor;
  - consolidacao visual/CSS quando aplicavel.

## 19. Proximo passo recomendado

**Mudanca 17 - Security hardening / Codex Security triage.**

Justificativa: a base operacional esta estavel o suficiente para parar a limpeza incremental de warnings e direcionar a proxima fase para seguranca. Codex Security deve ser tratado isoladamente, com triagem por severidade, sem misturar React Doctor, redesign, PDF/share ou refatoracao ampla.
