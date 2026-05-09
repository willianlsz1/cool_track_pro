# Mudanca 16 / CP-C - Checkpoint cache/storage/offline

## 1. Base

- Branch: `main`
- HEAD: `4aa386eb5c012eea35fc382153116fe98ac3cbf5`
- Data: `2026-05-09`
- Arquivos analisados:
  - `src/core/storage.js` (469 LOC)
  - `src/core/state.js` (80 LOC)
  - `src/core/supabase.js` (32 LOC)
  - `src/core/photoStorage.js` (547 LOC)
  - `src/core/signatureStorage.js` (301 LOC)
  - `src/core/plans/planCache.js` (105 LOC)
  - `src/domain/pdf/shareReport.js` (344 LOC)
  - `src/ui/views/registro.js` (2099 LOC)
  - `src/ui/views/historico.js` (1807 LOC)
  - `src/__tests__/storage.integration.test.js`
  - `src/__tests__/photoStorage.test.js`
  - `src/__tests__/signatureStorage.test.js`
  - `src/__tests__/signatureResolver.test.js`
  - `src/__tests__/clientes.offline.test.js`
  - `src/__tests__/clientesAccess.test.js`
  - `src/__tests__/historicoRegistroIntegration.contract.test.js`
  - `src/__tests__/historicoFilters.contract.test.js`
  - `src/__tests__/criticalFlow.contract.test.js`

## 2. Objetivo

Mapear e validar, sem alterar producao, os fluxos de cache, storage e offline do app antes de qualquer ajuste estrutural. O foco e identificar donos de persistencia, fallbacks, filas, tombstones, riscos e lacunas contratuais para orientar os proximos CPs da Mudanca 16.

## 3. Areas cache/storage/offline

| Area                         | Arquivo principal                                                                     | Responsabilidade                                                        | Persistencia                                                               | Fallback/offline                                                                  | Teste existente                                                        | Risco                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| Storage central              | `src/core/storage.js`, `src/core/storage/*`                                           | Snapshot local, sync Supabase, normalizacao e tombstones                | `localStorage` em `STORAGE_KEY`, metadata de sync/deletions/cache owner    | Offline-first: salva local, agenda sync, cai para cache local quando remoto falha | `storage.integration.test.js`, `storage-shape.test.js`                 | Alto: divergencia local/remoto e sync concorrente     |
| State                        | `src/core/state.js`                                                                   | Estado em memoria e subscribers                                         | Memoria; persistencia indireta via Storage                                 | Sem fallback proprio; depende de Storage e render adapters                        | Indireto em Registro/Historico/Dashboard/Storage                       | Medio: mutacao cruzada e rehidratacao stale           |
| `localStorage` geral         | Core, views e components                                                              | Snapshot app, plano, user scoped keys, assinaturas legacy, preferencias | Chaves globais e `ct:<uid>:*`                                              | Try/catch em pontos sensiveis; alguns consumidores toleram storage bloqueado      | `auth.integration`, `storage.integration`, `signatureStorage`, filtros | Alto: estado invisivel entre sessoes/usuarios         |
| `sessionStorage`             | Registro, Historico, init/theme helpers                                               | Edit mode, filtros temporarios, contexto de rota                        | Chaves temporarias por sessao                                              | Fallback por leitura nula/try-catch conforme adapter                              | `registroLifecycle`, regressions, `historicoFilters.contract`          | Medio: edit mode/filtro preso                         |
| Fotos/evidencias             | `src/core/photoStorage.js`                                                            | Normalizar, subir data URL, gerar signed URL, migrar fotos legacy       | Supabase Storage refs; fallback inline/pending                             | Mantem fallback inline/pending quando upload falha                                | `photoStorage.test.js`, Registro photos tests                          | Alto: PDF sem midia, payload grande ou fila sem flush |
| Assinatura                   | `src/core/signatureStorage.js`, `src/ui/components/signature/signature-storage.js`    | Upload, signed URL, queue local, resolver legacy/remoto                 | Supabase Storage refs e `cooltrack-sig-*` legacy/pending                   | Queue `cooltrack-sig-pending-upload`, resolver via localStorage                   | `signatureStorage`, `signatureResolver`, Registro signature tests      | Alto: assinatura perdida ou duplicada                 |
| Registro save/edit           | `src/ui/views/registro.js`, `src/features/registro/save/*`                            | Montar payload, fotos, assinatura, checklist e persistir                | State + Storage + session edit context                                     | Contratos mockam paths de save/share; storage real fica em Storage                | `registroLifecycle`, save/photos/signature/reportShare tests           | Alto: payload parcial ou edit stale                   |
| Historico delete/tombstone   | `src/ui/views/historico.js`, `src/features/historico/delete/*`                        | Remover registro, marcar tombstone, recalcular equipamento, refresh     | State + `Storage.markRegistroDeleted`                                      | Tombstone em queue local para flush remoto posterior                              | `historicoRegistroIntegration.contract`, `deleteHelpers`               | Alto: ressurreicao remota ou delete errado            |
| Relatorio/PDF/share fallback | `src/ui/controller/handlers/reportExportHandlers.js`, `src/domain/pdf/shareReport.js` | Gerar PDF, share WhatsApp, upload/download fallback                     | Blob local, upload opcional, metadata share                                | Fallback para download local quando upload/share falha                            | `reportExportContracts`, `shareReport`, `criticalFlow`                 | Medio/alto: divergencia PDF vs WhatsApp               |
| Plano/billing/cache          | `src/core/plans/planCache.js`, `src/core/plans/monetization.js`, `clientesAccess.js`  | Cache de plano, acesso e quotas                                         | `cooltrack-cached-plan`, billing cache                                     | Nao bloqueia cedo se billing ainda nao hidratou; erro deixa unresolved            | `clientesAccess`, monetization, premium/paywall tests                  | Medio/alto: acesso indevido ou bloqueio indevido      |
| Filtros Historico            | `src/ui/views/historico.js`, `src/features/historico/filters/*`                       | Filtros DOM/cache/session e view model                                  | `_histFilterValues`, `_clienteFilter`, session/DOM                         | Contrato preserva fallback e data-registro-id                                     | `historicoFilters.contract`, filters helper tests                      | Medio: filtro invisivel/stale                         |
| Filas pending/offline        | `storage.js`, `signatureStorage.js`, `photoStorage.js`                                | Sync pendente, deletions, assinaturas e fotos pending                   | `cooltrack-sync-*`, `cooltrack-sig-pending-upload`, metadata photo pending | Drain quando online/load; queue melhor esforco                                    | `storage.integration`, `signatureStorage`, `photoStorage`              | Alto: fila crescer, duplicar ou nao drenar            |
| Supabase fallback            | `src/core/supabase.js`, Storage/clientes/share                                        | Backend remoto, auth e storage                                          | Remoto + cache local                                                       | Fallback local para storage/clientes; download local para share                   | `storage.integration`, `clientes.offline`, `shareReport`               | Alto: falha remota silenciosa ou estado parcial       |

## 4. Fluxos criticos

| Fluxo cache/storage/offline | Entrada                                                     | Arquivos envolvidos                                                          | Side effects                                                              | Teste existente                                                                      | Lacuna                                                       |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Criar/editar registro       | Save Registro com equipamento, fotos, assinatura, checklist | `registro.js`, `features/registro/save/*`, `storage.js`                      | Atualiza state/storage, pode subir fotos/assinatura, pode abrir share/PDF | Registro lifecycle/save/photos/signature/reportShare; `criticalFlow` para identidade | Nao ha E2E real salvando formulario completo                 |
| Deletar registro            | Action `delete-reg`/`deleteReg`                             | `historico.js`, `deleteHelpers`, `storage.js`                                | Remove state, limpa assinatura local, queue tombstone, refresh Historico  | `historicoRegistroIntegration.contract`, `storage.integration`                       | Sem E2E browser confirmando delete offline                   |
| Deletar equipamento         | Delete Equipamentos                                         | `equipmentHandlers`, `features/equipamentos/ui/deleteEquip.js`, `storage.js` | Remove equipamento/registros, marca tombstones                            | Equipamentos delete tests + storage tombstones                                       | Fluxo cruzado equipamento -> registros tombstone nao tem E2E |
| Fotos pendentes             | Data URL de foto no registro/equipamento                    | `photoStorage.js`, `storage.js`, Registro features                           | Upload Supabase Storage ou fallback pending/inline                        | `photoStorage.test.js`, Registro photos, exploratory payload                         | Fila de fotos pending nao tem checkpoint proprio de drain    |
| Assinatura local/remota     | Data URL/localStorage/ref remoto                            | `signatureStorage.js`, signature resolver                                    | Upload, signed URL, queue pending, update remoto fire-and-forget          | `signatureStorage`, `signatureResolver`, Registro signature                          | Migração fire-and-forget depende de microtasks/mocks         |
| PDF/WhatsApp fallback       | Export/share action                                         | `reportExportHandlers.js`, `shareReport.js`, `pdf.js`                        | Blob, upload, download fallback, quota/usage                              | `reportExportContracts`, `shareReport`, `criticalFlow`                               | Web Share/upload real fica fora do contrato                  |
| Cache de plano/billing      | Auth/billing/profile                                        | `planCache.js`, `monetization.js`, `clientesAccess.js`                       | Lê/escreve plan cache e gating                                            | `clientesAccess`, monetization, premium tests                                        | Falhas multiaba/cache antigo nao cobertas em E2E             |
| Filtros sessionStorage      | Filtros Historico/Relatorio                                 | `historico.js`, filters helpers, report handlers                             | DOM/session/cache local influenciam view e export                         | `historicoFilters.contract`, `historicoPdfWhatsappIntegration`                       | Limpeza de sessionStorage em browser real nao coberta        |
| Supabase falha              | Falha select/upsert/upload                                  | `storage.js`, `clientes.js`, `photoStorage.js`, `shareReport.js`             | Fallback local/pending/toast/download                                     | `storage.integration`, `clientes.offline`, `photoStorage`, `shareReport`             | Taxonomia de erro offline vs servidor ainda espalhada        |
| Corrupcao JSON              | JSON invalido em localStorage                               | `storage.js`, `signatureStorage.js`                                          | Retorna null/lista vazia e evita crash                                    | `storage.integration`, `signatureStorage`                                            | Outras chaves JSON do app nao estao todas inventariadas      |
| Rehidratacao state          | Load local/remoto no bootstrap                              | `storage.js`, `state.js`, routes/views                                       | Substitui snapshot, normaliza e renderiza consumidores                    | `storage.integration` + contratos por area                                           | Sem teste end-to-end de bootstrap completo com cache legado  |

## 5. Testes existentes e lacunas

| Teste                                           | O que cobre                                                                                                                               | O que nao cobre                               | Importancia | Observacao                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------- | ------------------------------------- |
| `storage.integration.test.js`                   | Save local imediato, normalizacao, JSON corrompido, migracao, quota, conflito local/remoto, fallback remoto, tombstones, temp IDs offline | Browser real, multiaba, service worker        | Alta        | Principal contrato do storage central |
| `photoStorage.test.js`                          | Normalizacao, upload, signed URL, fallback pending, migracao legacy                                                                       | Drain completo de fila de fotos em app real   | Alta        | Cobre upload/fallback sem rede real   |
| `signatureStorage.test.js`                      | Upload, normalizacao, signed URL, pending queue, JSON invalido                                                                            | Flush integrado com Storage em navegador real | Alta        | Cobre limite FIFO e invalidos         |
| `signatureResolver.test.js`                     | Resolver legacy/remoto, localStorage, migracao on-demand, dedup                                                                           | Persistencia remota real                      | Alta        | Usa fire-and-forget com mocks         |
| `clientes.offline.test.js`                      | Upsert cliente local quando Supabase falha                                                                                                | Outros domínios offline                       | Media       | Bom padrao para fallback local        |
| `clientesAccess.test.js`                        | Cache plano e billing refresh/failure                                                                                                     | Multiusuario/multiaba                         | Media       | Protege gating Clientes               |
| `historicoRegistroIntegration.contract.test.js` | Delete com tombstone, state, refresh e assinatura local                                                                                   | Browser real confirm/delete                   | Alta        | Ponte Historico -> Storage            |
| `historicoFilters.contract.test.js`             | DOM roots, `_histFilterValues`, `_clienteFilter`, session/URL, data-registro-id                                                           | E2E real de limpeza de filtros                | Media       | Protege filtros invisiveis            |
| `criticalFlow.contract.test.js`                 | Identidade do registro ate PDF/WhatsApp                                                                                                   | Form/save real e storage real                 | Alta        | Complementa CP-B                      |

Lacunas criticas remanescentes:

- E2E real de salvar registro com foto, assinatura e checklist e reabrir apos reload.
- E2E ou contrato de bootstrap completo com cache local legado e remoto indisponivel.
- Inventario completo de todas as chaves `localStorage`/`sessionStorage` e seus donos.
- Contrato especifico para drain de fila de fotos pendentes.
- Cenario multiusuario/multiaba para cache owner, billing cache e userStorage.
- Separacao mais explicita entre erro offline e erro de servidor.

## 6. Warnings/logs baseline

| Warning/log                     | Origem                   | Quando aparece                                         | Impacto                                       | Tratamento sugerido                        |
| ------------------------------- | ------------------------ | ------------------------------------------------------ | --------------------------------------------- | ------------------------------------------ |
| Supabase Multiple GoTrueClient  | Supabase auth em testes  | Suites que importam auth/plans/storage sem reset total | Ruido e risco teorico de estado compartilhado | CP dedicado para mocks/lifecycle Supabase  |
| JSDOM navigation                | JSDOM                    | Testes que acionam links/navegacao real                | Ruido conhecido                               | Mockar navigation ou isolar helpers        |
| React `act(...)`                | React tests              | Landing/a11y com counters async                        | Ruido e possivel update nao observado         | Ajustar testes React em CP proprio         |
| Logs esperados de auth/fallback | Auth/storage/share tests | Cenarios negativos intencionais                        | Ruido, mas valida fallback                    | Manter documentado e reduzir onde possivel |
| Warnings storage/quota          | `storage.integration`    | Estados grandes/quota                                  | Esperado em teste                             | Manter como cobertura                      |
| Vite dynamic/static import      | Build/check              | `npm run check`                                        | Chunks nao otimizados                         | CP de chunks/dynamic import                |
| 30 warnings lint baseline       | ESLint                   | `npm run check`                                        | Ruido em validacao                            | CP de limpeza por grupos                   |

## 7. Riscos principais

- Divergencia local/remoto se sync pendente nao drenar ou remoto sobrescrever cache errado.
- Corrupcao de storage fora das chaves ja cobertas.
- Fila offline de fotos/assinaturas crescer ou duplicar em casos prolongados.
- Deletes/tombstones nao aplicarem no remoto e registro/equipamento ressurgir.
- Fotos/assinatura ficarem em formato legacy sem migracao efetiva.
- Fallback Supabase/local mascarar falha de servidor persistente.
- Cache de plano liberar/bloquear areas erradas quando billing falha.
- Filtros invisiveis em session/cache interferirem com Historico ou export.
- Rehidratacao state em bootstrap real ainda sem smoke completo.

## 8. Recomendacao final

**CP-D - cache/offline contratos adicionais.**

Justificativa: a bateria existente cobre bem os blocos principais, mas as lacunas de maior risco ainda sao contratuais: inventario de chaves, drain de filas pendentes, bootstrap com cache legado/remoto indisponivel e cenarios multiusuario/cache owner. E melhor fechar essas lacunas pequenas antes de limpar warnings ou mexer em chunks.
