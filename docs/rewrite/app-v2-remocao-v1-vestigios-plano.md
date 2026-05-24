# app-v2 - Plano de remocao do app v1 e vestigios

## 1. Objetivo

Remover o runtime legado/v1 e seus vestigios depois da confirmacao de que o
app-v2 esta como entrada principal da `main`, sem quebrar contratos ainda usados
por app-v2, Supabase, autenticacao ou validacoes.

PDF/share, assinatura, fotos, storage e PMOC nao devem ser reaproveitados do v1
para o app-v2. Essas areas passam a ter dois destinos separados: remover o
legado em checkpoints pequenos e recriar solucoes app-v2-native em etapas
proprias.

Este plano e uma etapa de preparacao. Ele nao executa delecoes de codigo.

## 2. Estado confirmado

- Branch base analisada: `main`.
- HEAD base analisado: `94a4ee63ef6362cbff48c3a50f3fce402b09479e`.
- `index.html` monta `src/app-v2/main.tsx`.
- O root principal da aplicacao e `app-v2-root`.
- `src/main.js` nao existe mais como entrada principal.
- O app-v2 permanece concentrado em `src/app-v2/`.

Atualizacao de continuidade em `codex/remove-v1-dashboard-last-service-react-cp3f`
apos os checkpoints CP-3x, CP-3y, CP-4a..CP-4d, CP-7b..CP-7c e CP-8a..CP-8j:

- `src/react/` nao existe mais.
- `src/app.js` nao existe mais.
- `e2e/specs/` contem apenas specs app-v2:
  - `app-v2-authenticated-primary.spec.js`;
  - `app-v2-primary-entrypoint.spec.js`;
  - `app-v2-service-layout.spec.js`.
- Superficies publicas ativas de billing/pricing/checkout/portal ja foram
  removidas; a migration `20260524010000_remove_stripe_billing_schema.sql`
  permanece como evidencia de remocao do schema Stripe.
- `src/app-v2/` nao importa `src/ui`, `src/features` ou `src/react`. As
  ocorrencias `../ui/*` dentro de `src/app-v2` apontam para
  `src/app-v2/ui/*`, nao para o runtime legado.
- `src/domain` e `src/core` nao importam `src/ui`, `src/features` ou
  `src/react` por caminho estatico direto no estado atual verificado.
- `src/features/profile.js` foi removido no CP-9c; consumidores agora importam
  `Profile` diretamente de `src/core/profile.js`.
- `src/features/relatorio/**` foi removido no CP-9d; o helper puro
  `buildWhatsAppSuccessCopy` foi reclassificado em
  `src/domain/reportExportHelpers.js`.
- `src/features/historico/**` foi removido no CP-9e; helpers foram
  co-localizados em `src/ui/views/historico/helpers/**` porque a view/rota v1 de
  Historico ainda cruza timeline, registro, PDF/share e WhatsApp.
- `src/features/equipamentos/state/**` foi removido no CP-9f; estado de
  cache/render da view legada foi co-localizado em
  `src/ui/views/equipamentos/state/**`.
- `src/features/equipamentos/bridges/**` foi removido no CP-9g; bridges de
  mount/unmount da view legada foram co-localizadas em
  `src/ui/views/equipamentos/bridges/**`.
- `src/features/equipamentos/utils/**` foi removido no CP-9h; helpers de detail
  e view-model da view legada foram co-localizados em
  `src/ui/views/equipamentos/utils/**`.
- `src/features/equipamentos/nameplate/**` foi removido no CP-9i; helper de
  coleta/erro de dados de placa da view legada foi co-localizado em
  `src/ui/views/equipamentos/nameplate/**`.
- `src/features/equipamentos/ui/listRenderer.js` foi removido no CP-9j; renderer
  DOM da lista de Equipamentos foi co-localizado em
  `src/ui/views/equipamentos/ui/listRenderer.js`.
- `src/features/equipamentos/ui/headerMount.js` foi removido no CP-9k; wrapper
  de roots DOM do header de Equipamentos foi co-localizado em
  `src/ui/views/equipamentos/ui/headerMount.js`.
- `src/features/equipamentos/ui/toolbar.js` foi removido no CP-9l; helper DOM da
  toolbar de Equipamentos foi co-localizado em
  `src/ui/views/equipamentos/ui/toolbar.js`.
- `src/features/equipamentos/ui/renderFlatList.js` foi removido no CP-9m;
  orquestrador da lista flat de Equipamentos foi co-localizado em
  `src/ui/views/equipamentos/ui/renderFlatList.js`.
- `src/features/equipamentos/ui/renderEquip.js`,
  `src/features/equipamentos/setor/setorUI.js` e
  `src/features/equipamentos/setor/setorState.js` foram removidos no CP-9n;
  render/model local de Equipamentos foi co-localizado em
  `src/ui/views/equipamentos/ui/renderEquip.js` e
  `src/ui/views/equipamentos/setor/**`.
- `src/features/equipamentos/setor/setorNavigation.js` foi removido no CP-9o;
  a navegacao local de setor foi co-localizada em
  `src/ui/views/equipamentos/setor/setorNavigation.js`.
- `src/features/equipamentos/ui/detail.js`,
  `src/features/equipamentos/ui/detailController.js`,
  `src/features/equipamentos/ui/detailModel.js` e
  `src/features/equipamentos/ui/viewEquip.js` foram removidos no CP-9p; o
  detalhe de Equipamentos foi co-localizado em
  `src/ui/views/equipamentos/ui/**`.
- `src/features/equipamentos/ui/openEditEquip.js` e
  `src/features/equipamentos/ui/deleteEquip.js` foram removidos no CP-9q; os
  helpers de edicao/delecao da UI legada de Equipamentos foram co-localizados em
  `src/ui/views/equipamentos/ui/**`.
- `src/features/equipamentos/setor/setorPersist.js` foi removido no CP-9r; a
  persistencia local de Setores da UI legada de Equipamentos foi co-localizada
  em `src/ui/views/equipamentos/setor/setorPersist.js`.
- `src/features/equipamentos/crud/**` foi removido no CP-9s; validacao,
  payload, persistencia local, post-save e orquestracao de salvamento da UI
  legada de Equipamentos foram co-localizados em
  `src/ui/views/equipamentos/crud/**`.
- `src/features/registro/lifecycle/**` foi removido no CP-9t; helpers puros de
  limpeza, edicao e inicializacao da UI legada de Registro foram co-localizados
  em `src/ui/views/registro/lifecycle/**`.
- `src/features/registro/checklist/**` foi removido no CP-9u; helpers puros de
  checklist PMOC da UI legada de Registro foram co-localizados em
  `src/ui/views/registro/checklist/**`.
- `src/features/registro/save/payload.js` foi removido no CP-9v; helpers puros
  de payload/validacao do save de Registro foram co-localizados em
  `src/ui/views/registro/save/payload.js`, com teste movido para
  `src/__tests__/registroSavePayloadHelpers.test.js`.
- `src/features/registro/save/persistence.js` foi removido no CP-9w; helpers
  puros de montagem de registro e mutacao de estado foram co-localizados em
  `src/ui/views/registro/save/persistence.js`, mantendo a aplicacao de
  `setState` no adapter legado.
- `src/features/registro/save/photos.js` foi removido no CP-9x; helpers de
  fotos de Registro foram co-localizados em
  `src/ui/views/registro/save/photos.js`, preservando upload/fallback por DI.
- `src/features/registro/save/signature.js` foi removido no CP-9y; helpers de
  assinatura de Registro foram co-localizados em
  `src/ui/views/registro/save/signature.js`, preservando lazy import, storage e
  fallback por DI.
- `src/features/registro/save/postSave.js` e
  `src/features/registro/save/reportShare.js` foram removidos no CP-9z; helpers
  de pos-salvamento/share de Registro foram co-localizados em
  `src/ui/views/registro/save/`, preservando PDF/WhatsApp por DI.
- `src/features/userData.js` foi removido no CP-10; handlers client-side de
  exportacao/exclusao de dados foram co-localizados em
  `src/ui/account/userData.js`, preservando Supabase Edge Functions por DI
  implicita existente.
- CP-11 mapeou o runtime legado restante em `src/ui` e confirmou que a remocao
  direta da pasta ainda e insegura: restam 178 arquivos e a cobertura de testes
  ainda referencia fortemente `ui/views`, `ui/components`, `ui/controller`,
  `ui/shell` e `ui/viewModels`.
- CP-12 classificou `src/ui` por destino de desmontagem: aposentar shell/runtime
  v1, extrair apenas regras puras quando necessario e isolar PDF/share,
  WhatsApp, assinatura, fotos, autenticacao, storage, PMOC e router em etapas
  dedicadas.
- CP-13 adicionou contrato executavel garantindo que `index.html`, `vite.config.js`
  e `src/app-v2/**` nao referenciam `src/ui/shell` ou `src/ui/controller`,
  preparando a remocao futura do shell v1 sem apagar runtime ainda.
- CP-14 inventariou 67 arquivos de teste ainda ligados a `ui/shell` ou
  `ui/controller` e classificou a cobertura entre aposentadoria junto com
  shell/router, migracao para app-v2/helper puro, etapa sensivel dedicada e
  contratos de transicao.
- CP-15 adicionou um gate executavel para rastrear testes shell/router-only
  enquanto `src/ui/shell.js` e `src/ui/controller.js` ainda existem, e para
  confirmar a presenca da cobertura app-v2 equivalente antes da aposentadoria.
- CP-16A resolveu a divergencia entre remover testes antes do runtime e manter
  runtime legado coberto: o primeiro corte real deve remover shell visual v1,
  testes obsoletos correspondentes e atualizar o gate no mesmo checkpoint.
- CP-16B removeu o shell visual v1 morto (`src/ui/shell.js`, header/nav/sidebar
  e contratos de header), removeu os testes obsoletos correspondentes e
  preservou `navigationMode.js`, `views.js`, `modals.js` e controller/router
  para checkpoints futuros.
- CP-17 removeu apenas o orquestrador morto `src/ui/controller.js` e seu teste
  dedicado, preservando `src/ui/controller/**`, rotas, handlers e helpers para
  lotes futuros por dominio.
- CP-18 removeu o helper orfao
  `src/ui/controller/helpers/themeInitHelpers.js` apos confirmar que
  `initControllerHelpers` nao tinha import ativo; rotas, handlers, views,
  modais e areas sensiveis continuaram preservados para lotes futuros.
- CP-19 removeu o registrador de rotas legado `src/ui/controller/routes.js` e
  seus testes de lifecycle/contrato dedicados, apos confirmar que nao havia
  import ativo no runtime principal, app-v2, e2e ou configuracao. Handlers e
  views legadas permanecem para desmontagem por dominio.
- CP-20 removeu os handlers orfaos
  `src/ui/controller/handlers/clienteHandlers.js` e
  `src/ui/controller/handlers/profileAccountHandlers.js`, preservando handlers
  ainda cobertos por consumidores ativos ou areas sensiveis.
- CP-21 removeu o componente orfao `src/ui/components/accountModal.js`, que
  nao tinha import ativo fora de contrato de limpeza de billing/pricing. A tela
  de Conta do v1 e o app-v2 seguem sem depender desse modal antigo.
- CP-22 removeu o componente orfao `src/ui/components/usageMeter.js` e seu
  teste dedicado, apos confirmar que nao havia import ativo fora da propria
  cobertura legada.
- CP-23 removeu o componente orfao
  `src/ui/components/postSaveRegistroCompletion.js` e seu teste dedicado. O
  pos-salvamento ativo continua usando `PostSaveRegistroToast`.
- CP-24 removeu o componente orfao `src/ui/components/offlineBanner.js` e o CSS
  dedicado `.offline-banner`/`.has-offline-banner`, preservando
  `src/core/onlineStatus.js`.
- CP-25 removeu os fragmentos orfaos
  `src/ui/components/onboarding/firstTimeExperience/steps.js` e
  `src/ui/components/onboarding/firstTimeExperience/styles.js`. O onboarding
  ativo continua em `firstTimeExperience.js` + `firstTimeExperience.css`.
- CP-26 removeu o barrel legado `src/ui/views/clientes/renderers.js`,
  substituindo seu unico consumidor por imports diretos dos renderers de
  clientes.
- CP-27 removeu o helper legado `src/ui/helpers/registroPure.js`,
  co-localizando o unico helper runtime usado (`asArray`) em
  `src/ui/views/registro.js` e aposentando o helper sem consumidor real.
- CP-28 removeu o helper legado `src/ui/views/clientes/emptyStateRenderer.js`,
  co-localizando estados vazios de Clientes no unico consumidor
  `src/ui/views/clientes/pageRenderer.js`.
- CP-29 removeu o helper legado `src/ui/views/clientes/paginationRenderer.js`,
  co-localizando a paginacao de Clientes no unico consumidor
  `src/ui/views/clientes/pageRenderer.js` e corrigindo mojibake nos textos
  tocados da pagina.
- CP-30 removeu o helper legado `src/ui/views/clientes/filtersRenderer.js`,
  co-localizando filtros de Clientes no unico consumidor
  `src/ui/views/clientes/pageRenderer.js` e corrigindo mojibake no placeholder
  de busca tocado.
- CP-31 removeu o helper legado `src/ui/components/onboarding/savedHighlight.js`,
  co-localizando `SavedHighlight` no barrel publico
  `src/ui/components/onboarding.js` e preservando a API importada por Registro e
  Historico.
- CP-32 removeu o componente orfao `src/ui/components/registroEquipPicker.js`
  e seu teste dedicado. A busca confirmou que `initRegistroEquipPicker`,
  `openRegistroEquipPicker` e `syncRegistroEquipLabel` nao tinham import ativo
  fora da propria cobertura legada; os seletores CSS/markup remanescentes ficam
  para CP de CSS/runtime v1.
- CP-33 removeu o renderer legado `src/ui/views/clientes/cardRenderer.js`,
  co-localizando `renderCard` em `src/ui/views/clientes/pageRenderer.js`, que e
  seu unico consumidor runtime. O teste dedicado passou a importar pelo
  renderer da pagina.
- CP-34 removeu o renderer legado `src/ui/views/clientes/summaryRenderer.js`,
  co-localizando `renderKpis`, `renderSummary`, `renderActiveContext` e
  `renderAlertStrip` em `src/ui/views/clientes/pageRenderer.js`, que e seu unico
  consumidor runtime. O teste dedicado passou a importar pelo renderer da
  pagina e os textos tocados do resumo foram corrigidos para portugues legivel.
- CP-35 removeu o helper legado `src/ui/helpers/equipamentosPure.js` e seu teste
  dedicado. O helper nao tinha consumidor runtime; as funcoes equivalentes
  usadas por Equipamentos permanecem em `src/ui/views/equipamentos/helpers.js`.
- CP-36 removeu o helper legado `src/ui/views/dashboard/alerts.js`, que nao
  tinha import ativo. As funcoes de alerta ainda usadas pelo Dashboard legado
  permanecem em `src/ui/views/dashboard.js` e
  `src/ui/views/dashboard/readOnlyBlocks.js`.
- CP-37 removeu os helpers legados `src/ui/views/dashboard/metrics.js` e
  `src/ui/views/dashboard/constants.js`. `metrics.js` nao tinha import ativo e
  `constants.js` era usado apenas por ele; as funcoes equivalentes usadas pelo
  Dashboard permanecem em `src/ui/views/dashboard.js` e
  `src/ui/viewModels/dashboardViewModel.js`.
- CP-38 desacoplou `Profile` do barrel legado
  `src/ui/components/onboarding.js`. O Dashboard agora importa `Profile`
  diretamente de `src/core/profile.js`, enquanto o barrel segue limitado a
  onboarding e ao contrato legado `SavedHighlight`.
- CP-39 removeu o componente legado orfao
  `src/ui/components/orcamentoSignaturePage.js`. O arquivo declarava uma
  pagina standalone para `?orc-sign=TOKEN`, mas nao havia import nem bootstrap
  runtime que chamasse `OrcamentoSignaturePage.mount(token)`. Helpers reais de
  token/assinatura em `src/core/orcamentos.js` ficaram fora do escopo.
- CP-40 removeu a folha legada `src/assets/styles/theme-premium.css`. O
  entrypoint app-v2 nao carregava esse arquivo, `src/app-v2/**` nao o importava
  e as ocorrencias restantes eram apenas documentais ou no proprio CSS.
- CP-41 removeu a folha legada `src/assets/styles/ux-polish.css`. O entrypoint
  app-v2 nao carregava esse arquivo, `src/app-v2/**` nao o importava e as
  ocorrencias restantes eram apenas documentais ou no proprio CSS.
- CP-42 removeu a folha legada `src/assets/styles/desktop-fonts.css`. O
  entrypoint app-v2 nao carregava esse arquivo, `src/app-v2/**` nao o importava
  e as ocorrencias restantes eram apenas documentais ou no proprio CSS.
- CP-43 removeu a folha legada `src/assets/styles/base.css`. O entrypoint
  app-v2 nao carregava esse arquivo, `src/app-v2/**` nao o importava e as
  ocorrencias runtime restantes eram apenas comentarios legados.
- CP-44 removeu a folha legada `src/assets/styles/layout.css`. O entrypoint
  app-v2 nao carregava esse arquivo, `src/app-v2/**` nao o importava e a unica
  ocorrencia runtime restante antes da remocao era comentario em `tokens.css`.
- CP-45 removeu a folha legada `src/assets/styles/tokens.css` e o teste
  historico `src/__tests__/internalVisualIdentity.test.js`, que validava a
  identidade visual do runtime legado em vez da entrada principal app-v2.

## 3. Superficies v1 mapeadas

### 3.1 Runtime legado direto

- `src/ui/`: 148 arquivos restantes na contagem atual de arquivos.
- `src/react/`: removido.
- `src/features/`: sem arquivos restantes apos CP-10.
- `src/assets/styles/`: folhas legadas, incluindo `redesign.css`,
  `components.css`, `layout.css` e estilos derivados do v1.
- `src/__tests__/`: 235 arquivos de teste, muitos cobrindo contratos legados.
- `e2e/specs/`: 3 specs restantes, todas app-v2.

### 3.2 Acoplamentos que impedem delecao em massa

- `src/domain/pdf/shareReport.js` importa componente de onboarding legado.
- `src/features/registro/save/**` foi removido por checkpoints pequenos entre
  CP-9t e CP-9z, preservando contratos por testes focados.
- Testes legados cobrem seguranca de assinatura, storage, PDF, WhatsApp,
  relatorios e contratos DOM.

Conclusao: `src/features` nao possui mais arquivos rastreaveis, mas `src/ui`
ainda deve ser removido por checkpoints depois de extrair, substituir ou
aposentar contratos compartilhados. Delecao direta de `src/ui` continua
insegura. `src/react` ja foi removido e e protegido por
`src/__tests__/reactCleanupContracts.test.js`.

### 3.3 Vestigios publicos e comerciais

- O conteudo publico ativo de pricing/billing foi tratado em checkpoints
  dedicados.
- Permanecem mencoes historicas em `docs/**` e contratos legados de
  compatibilidade operacional, que nao devem ser apagados junto com runtime.
- Permanecem comentarios legados em CSS e testes sobre paywall/upgrade; devem
  ser tratados como parte de CP-6 ou do checkpoint que remover o componente
  correspondente, nao como limpeza solta.

## 4. Fora de escopo inicial

Nao remover sem etapa dedicada:

- Supabase functions e migrations relacionadas a billing/Stripe.
- RLS, policies e schemas.
- Autenticacao.
- Orcamento real.
- Router/deep links.
- Dependencias em `package.json` ou `package-lock.json`, salvo etapa aprovada
  com evidencia de nao uso.

PDF/share, WhatsApp/share, assinatura, fotos, upload/storage e PMOC agora podem
ser removidos do v1 em CPs dedicados de desmontagem, desde que o CP tambem
prove ausencia de dependencia do app-v2. A recriacao dessas areas deve ocorrer
em planos app-v2-native separados, nao como adaptacao do codigo legado.

## 5. Riscos principais

| Risco                                                | Impacto                                                          | Controle                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Remover helper legado ainda usado por `domain`       | Quebra runtime remanescente ou testes de seguranca               | Desacoplar ou aposentar consumidor no mesmo checkpoint  |
| Remover testes legados antes de substituir cobertura | Regressao silenciosa em area ainda ativa                         | Migrar, substituir ou aposentar teste com justificativa |
| Limpar CSS legado antes de provar nao uso            | Regressao visual em telas ainda referenciadas por testes ou docs | Usar relatorio de CSS morto e smoke visual              |
| Remover billing backend junto com v1                 | Mistura area sensivel com limpeza estrutural                     | Manter billing backend para etapa propria               |
| Editar legal/SEO sem revisao                         | Texto publico inconsistente                                      | Checkpoint especifico de copy/legal                     |

## 6. Plano de implementacao por checkpoints

### CP-1 - Inventario executavel de dependencias v1

Objetivo: criar uma fotografia objetiva de imports, entrypoints e testes ligados
ao v1 antes de remover arquivos.

Arquivos afetados:

- Criar documento de inventario em `docs/rewrite/`.
- Opcionalmente criar script read-only em `scripts/` apenas se `rg` manual for
  insuficiente.

Validacao:

```bash
rg -n "src/ui|src/react|src/features|pricing|billing|stripe|planos" index.html src public docs/rewrite
npm run format:check
git diff --check
```

Saida esperada:

- Lista de arquivos v1-only.
- Lista de arquivos compartilhados que precisam ser extraidos ou preservados.
- Lista de testes que devem ser migrados, mantidos ou removidos.

### CP-2 - Separar contratos compartilhados do legado

Objetivo: retirar de `src/features` e `src/ui` os contratos ainda usados por
`src/domain/**`, colocando-os em camada adequada antes da remocao do v1.

Escopo provavel:

- Extrair `Profile` usado por `src/domain/pdf.js` e `src/domain/whatsapp.js`
  para modulo puro em `src/domain/` ou `src/core/`.
- Remover dependencia de `src/domain/pdf/shareReport.js` sobre onboarding
  legado, substituindo por porta pura ou fallback sem UI.
- Atualizar testes focados desses contratos.

Validacao:

```bash
npm test -- src/__tests__/reportExportContracts.test.js src/__tests__/storageCacheOffline.contract.test.js --run
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Isolate shared contracts before v1 removal`

### CP-3 - Remover entrypoints e ilhas React legadas

Objetivo: apagar componentes React que existiam para o shell v1 e nao sao mais
entrada do produto principal.

Escopo provavel:

- `src/react/entrypoints/**`
- `src/react/pages/**` legadas, exceto se algum teste ou app-v2 importar
  diretamente.
- Testes associados que cobrem apenas ilhas DOM do v1.

Controle:

- Antes de remover cada grupo, rodar `rg` para confirmar ausencia de imports em
  app-v2 e no build principal.
- Quando a cobertura ainda for relevante, migrar o teste para helper puro ou
  app-v2 antes de deletar.

Validacao:

```bash
npm test -- src/app-v2/index.test.tsx src/app-v2/shell/AppV2Shell.test.tsx --run
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy React islands`

### CP-4 - Remover shell, views e controllers v1

Objetivo: remover a navegacao, views e handlers do app legado depois que
contratos compartilhados ja estiverem isolados ou explicitamente aposentados.

Escopo provavel:

- `src/ui/shell/**`
- `src/ui/views/**`
- `src/ui/controller/**`
- `src/ui/shell.js`
- View models DOM legados que nao forem mais importados por testes migrados.

Controle:

- Nao adaptar componentes sensiveis do v1 para o app-v2.
- Se PDF/share, assinatura, fotos, storage ou PMOC estiverem acoplados a uma
  view v1, remover em CP dedicado ou aposentar o consumidor no mesmo CP.
- Apagar em lotes pequenos por dominio: dashboard, equipamentos, historico,
  registro, relatorios, conta.

Validacao:

```bash
npm test -- src/app-v2 --run
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy shell and views`

### CP-5 - Remover features legadas apos extracao

Objetivo: remover `src/features/**` que servia apenas ao v1. Concluido por
checkpoints pequenos entre CP-9a e CP-10, com co-localizacao em `src/ui/**` ou
reclassificacao para areas existentes quando aplicavel.

Escopo removido:

- `src/features/equipamentos/**`
- `src/features/historico/**`
- `src/features/registro/**`
- `src/features/userData.js`

Controle:

- Cada dominio teve `rg` de import antes da remocao.
- Regras reutilizaveis foram co-localizadas junto ao adapter legado ou mantidas
  nas areas `core/domain/ui` existentes, sem copiar logica para app-v2.

Validacao:

```bash
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy feature modules`

### CP-6 - Limpar CSS e assets legados

Objetivo: remover folhas de estilo e classes que pertenciam ao v1 sem afetar o
app-v2.

Escopo provavel:

- `src/assets/styles/redesign.css`
- `src/assets/styles/layout.css`
- `src/assets/styles/components.css`
- Estilos de pricing/paywall remanescentes.

Progresso executado:

- Removidos top-level CSS orfaos `theme-premium.css`, `ux-polish.css`,
  `desktop-fonts.css`, `base.css`, `layout.css` e `tokens.css`.
- Removidos assets visuais legados de equipamentos
  `equipment-detail-cp-h.css` e `equipment-list-cp-i.css`.
- Removido `redesign.css`, que nao era carregado pelo entrypoint principal
  app-v2.
- Removidos `components.css` e os parciais remanescentes em
  `src/assets/styles/components/`, que nao eram carregados pelo entrypoint
  principal app-v2.
- Contratos de remocao ampliados em `legacyV1RemovalContracts`.
- CP-49 reabriu o inventario apos a limpeza de CSS e confirmou que `src/ui`
  ainda contem 148 arquivos rastreados, com 163 testes ainda mencionando a UI
  legada. `src/features`, `src/react` e `src/assets/styles` nao possuem arquivos
  rastreados restantes, mas a remocao em massa de `src/ui` segue bloqueada por
  PDF/share, assinatura, fotos, auth, storage, PMOC, router e contratos DOM.
- CP-50 removeu `src/ui/viewModels/relatorioCompanyPmocModel.js`, que restava
  apenas como model test-only sem consumidor runtime. Os testes que protegem o
  comportamento atual do slot legado e do hero PMOC em Relatorios foram
  preservados.
- CP-51 registrou a decisao de nao reutilizar PDF/share, assinatura, fotos,
  storage e PMOC do v1. Essas areas deixam de ser destino de preservacao e
  passam a ser removidas como legado, com reconstrucao app-v2-native planejada
  em etapas proprias.
- CP-52 removeu a UI legada de autenticacao `src/ui/components/authscreen.js`,
  o modal auxiliar `passwordRecoveryModal.js` e o teste dedicado da tela v1.
  O bootstrap autenticado do app-v2 permanece em `src/app-v2/main.tsx` e seus
  adapters proprios.
- CP-53 removeu a view legada `src/ui/views/conta.js`, seu teste dedicado e o
  placeholder `#view-conta` do template v1. `src/ui/account/userData.js`
  permanece para CP separado por envolver LGPD, auth e Edge Functions.
- CP-54 mapeou a ordem de corte das areas sensiveis restantes do runtime v1,
  priorizando Orcamentos v1 visual/modal/handler antes de Relatorio,
  PDF/share, assinatura, fotos e PMOC. O CP e documental e nao remove runtime.
- CP-54A removeu a cadeia visual/modal/handler de Orcamentos v1
  (`src/ui/views/orcamentos.js`, `src/ui/components/orcamentoModal.js`,
  `src/ui/controller/handlers/orcamentoHandlers.js` e
  `src/ui/viewModels/orcamentosViewModel.js`). O fluxo app-v2 permanece em
  `Servicos > Orcamentos`; `src/core/orcamentos.js` e contratos reais ficam
  fora deste corte.
- CP-54B registrou a prontidao para remover Relatorio v1 sem misturar
  PDF/share, WhatsApp ou PMOC. O diagnostico confirmou que
  `src/ui/views/relatorio.js` ainda cruza renderers DOM, handlers de exportacao
  e PMOC; o corte de codigo deve ser dividido em CP54B1 (view/renderers),
  CP54C (PDF/share/WhatsApp) e CP54F (PMOC).
- CP-54B1 removeu a view DOM legada de Relatorio
  (`src/ui/views/relatorio.js`) e seus renderers locais
  (`src/ui/views/relatorio/cardsRenderer.js` e
  `src/ui/views/relatorio/controlsRenderer.js`), alem dos view models v1
  `src/ui/viewModels/relatorioContracts.js` e
  `src/ui/viewModels/relatorioViewModel.js`, que ficaram sem consumidor
  runtime. O contrato de PDF/share por Historico foi preservado para CP54C;
  PMOC continua para CP54F.
- CP-54C registrou a readiness de PDF/share/WhatsApp v1 sem remover runtime. O
  diagnostico confirmou que `reportExportHandlers.js` ainda e acionado por
  Historico e Registro, cruza `src/domain/pdf/**`, `src/domain/whatsapp.js`,
  toasts, quota, preview modal, assinatura e PMOC. O corte deve ser dividido em
  CP54C1 (aposentar CTAs/fallbacks em Historico e Registro), CP54C2 (remover
  handler, toasts, badge e modal preview) e CP54C3 (remover dominio
  PDF/share/WhatsApp legado ou mover dependencias restantes para CP sensivel
  proprio).
- CP-54C1 aposentou a superficie clicavel de PDF/WhatsApp em Historico e no
  pos-salvamento de Registro. A timeline v1 manteve apenas editar/excluir; o
  Registro passou a salvar e exibir feedback local simples, sem CTA/fallback
  para PDF, WhatsApp ou destinatario alternativo. Foram removidos tambem o
  adapter `src/ui/views/registro/save/reportShare.js`, o fork modal
  `src/ui/components/registroClienteForkSheet.js` e testes que protegiam o
  fluxo legado removido. `reportExportHandlers.js`, toasts/badge/modal preview
  e dominio PDF/share/WhatsApp permanecem para CP54C2/CP54C3.
- CP-54C2 removeu o handler central legado de PDF/share
  (`src/ui/controller/handlers/reportExportHandlers.js`), os componentes de
  feedback/quota (`pdfSuccessToast.js`, `shareSuccessToast.js` e
  `pdfQuotaBadge.js`) e o modal `modal-pdf-preview`. Tambem removeu testes
  dedicados a esse runtime e limpou mocks residuais em testes de Registro,
  fotos e assinatura. O dominio PDF/share/WhatsApp permanece para CP54C3 como
  etapa sensivel propria.
- CP-54C3 removeu os helpers legados de share/WhatsApp sem consumidor runtime:
  `src/domain/pdf/shareReport.js`, `src/domain/pdf/shareReportHelpers.js`,
  `src/domain/whatsapp.js` e `src/domain/reportExportHelpers.js`, alem dos
  testes dedicados. O gerador PDF comum e PMOC nao foram removidos neste corte
  para evitar misturar PDF, assinatura, checklist e PMOC no mesmo CP.
- CP-54D removeu o gerador PDF tecnico legado (`src/domain/pdf.js`),
  `generatorHelpers.js`, `reportModel.js` e secoes de capa, rodape, servicos e
  assinaturas que nao tinham consumidor runtime app-v2. Helpers ainda usados por
  PMOC/checklist (`constants`, `primitives`, `safeLinks`, `sanitizers`,
  `checklist`, `checklistHelpers`, `upsell` e `pdf/pmoc/**`) permanecem para CP
  sensivel proprio.
- CP-54E removeu o gerador legado de PDF de orcamento
  (`src/domain/pdf/orcamentoPdf.js`) sem consumidor runtime. PDF/share de
  orcamento deve ser reconstruido no app-v2 em etapa propria; PMOC/checklist PDF
  restante permanece para CP sensivel separado.
- CP-54F remove o PDF PMOC/checklist restante (`src/domain/pdf/pmoc/**`,
  `src/domain/pdf/sections/checklist*.js`, `upsell`, `safeLinks`, `sanitizers`,
  `constants` e `primitives`) preservando o checklist operacional de Registro e
  os resumos PMOC de cliente/equipamento para CPs proprios.
- CP-55 mapeia a assinatura digital legada restante e define a ordem de corte
  por Registro, Historico, UI/modal e storage real. A remocao direta continua
  insegura porque ainda cruza contratos `data-action`, `hist-view-signature`,
  overlays de router, `src/core/signatureStorage.js`, `src/core/storage.js` e o
  campo persistido `registros.assinatura`.
- CP-55A aposenta a captura e o salvamento de assinatura no Registro v1. O save
  nao importa mais `../components/signature.js`, nao chama `SignatureModal`, nao
  chama `saveSignatureForRecord` e grava `assinatura: false`. Historico,
  UI/modal, router e storage real de assinatura permanecem para CPs proprios.
- CP-55B aposenta a visualizacao de assinatura no Historico v1. A timeline nao
  renderiza mais `.hist-signature-preview`, nao expoe mais
  `hist-view-signature`, e `src/ui/views/historico.js` nao importa mais
  `SignatureViewerModal`, `getSignatureForRecord` ou `cleanupOrphanSignatures`.
  UI/modal, router global e storage real de assinatura permanecem para CPs
  proprios.
- CP-55C remove a UI/modal legada de assinatura
  (`src/ui/components/signature.js`,
  `src/ui/components/signature/signature-canvas.js`,
  `src/ui/components/signature/signature-modal.js` e
  `src/ui/components/signature/signature-viewer-modal.js`) e o teste dedicado
  `src/__tests__/registroLegacySignatureRender.test.js`. Storage real,
  router global e campo persistido `registros.assinatura` permanecem para CPs
  proprios.
- CP-55D remove o storage legado de assinatura
  (`src/core/signatureStorage.js` e
  `src/ui/components/signature/signature-storage.js`), o flush automatico de
  assinaturas pendentes em `src/core/storage.js` e os testes dedicados de
  storage/flush/resolver. Router global e campo persistido
  `registros.assinatura` permanecem para CPs proprios.
- CP-55E remove do router os IDs legados dos modais de assinatura
  (`modal-signature-overlay`, `modal-signature-viewer-overlay`,
  `signature-capture` e `signature-viewer`) e preserva apenas a API generica
  `registerBlockingLayer` para outras camadas bloqueantes. A superficie inerte
  de assinatura no Registro e o campo `registros.assinatura` permanecem para
  CPs proprios.
- CP-55F remove a superficie inerte de assinatura do Registro v1:
  `src/ui/views/registro/signatureHint.js`,
  `src/ui/views/registro/save/signature.js`,
  `src/ui/viewModels/registroSignatureModel.js`, handlers delegados,
  selectors publicos e o bloco `registro-signature-hint` do template. O save
  continua gravando `assinatura: false` para preservar o shape ate CP dedicado
  de schema/sync.
- CP-55G remove os vestigios inertes finais de assinatura no contrato visual do
  Registro: o view model nao expoe mais `signature`, o rodape usa
  `registro-action-anchor` em vez de `tour-signature-anchor` e os testes de
  remocao travam essa ausencia. Storage, sync, schema, historico e orcamentos
  permanecem fora do escopo.
- CP-55H remove os vestigios runtime de assinatura no Historico: o view model
  nao calcula mais `hasSignature`, o modelo legado da timeline nao expoe
  `signature: null` e a exclusao de registro nao limpa mais a chave obsoleta
  `cooltrack-sig-*`. O campo persistido `registros.assinatura` e sync/schema
  permanecem para CP dedicado.
- CP-55I remove promessas obsoletas de assinatura em copy/CSS legado de
  onboarding, tour e modal informativo de PMOC. O CP nao altera PMOC real,
  PDF/share, storage, orcamentos, billing ou app-v2.
- CP-56 mapeia o corte sensivel do campo persistido `registros.assinatura` e
  separa tres trilhas que nao devem ser misturadas: Registro/storage/sync,
  Supabase/RLS/migrations e assinatura de orcamento/billing. Este CP e
  documental para evitar mudanca por tentativa em area sensivel.
- CP-56A remove `assinaturaPayload` e `assinatura` do payload local de criacao
  do Registro. O CP nao altera normalizers, sync remoto, migrations,
  Supabase/RLS, orcamentos ou billing.
- CP-56B remove `assinatura` dos normalizers e mapeadores de storage/sync de
  Registro. O CP nao altera migrations, Supabase/RLS, orcamentos, billing ou
  qualquer contrato de assinatura fora de Registro.
- CP-56C adiciona migration para aposentar o gate server-side de assinatura de
  Registro: remove policies restritivas de assinatura em `storage.objects`,
  trigger/funcoes `registro_signature_*` e a coluna `public.registros.assinatura`.
  O CP remove o teste SQL especifico desse gate e nao altera assinatura de
  orcamento, billing, PDF/share, WhatsApp, fotos ou PMOC.
- CP-56C2 atualiza o predicado canonico `can_write_registro_fotos_storage_object`
  para nao depender mais do helper aposentado
  `can_write_registro_signature_storage_object`. Fotos de registros seguem
  apenas o contrato de ownership do path; fotos de equipamentos continuam Plus+.
- CP-56D aposenta a assinatura digital legada de Orcamentos: remove helpers
  `generateShareToken`, `buildShareUrl`, `fetchOrcamentoByToken` e
  `signOrcamentoByToken` de `src/core/orcamentos.js`, remove do follow-up o
  status `aguardando_assinatura` e adiciona migration para dropar RPCs publicas,
  colunas `share_token`/`assinatura_cliente_dataurl` e reverter orcamentos
  pendentes para `enviado`. Billing/features, PDF/share, WhatsApp e orcamento
  app-v2-native permanecem fora deste corte.
- CP-56E remove o vestigio comercial `FEATURE_DIGITAL_SIGNATURE` /
  `digital_signature` de `src/core/plans/subscriptionPlans.js`. Como billing e
  pricing ja foram retirados do runtime principal, este corte apenas impede que
  a assinatura digital v1 volte como feature flag acidental; a recriacao de
  assinatura real fica para etapa app-v2-native propria.
- CP-57A remove o resolver orfao `resolvePhotoDataUrlForPdf` e seu helper
  interno `blobToDataUrl` de `src/core/photoStorage.js`. A busca confirmou que
  o consumo runtime desse resolver acabou com a remocao do dominio PDF legado.
  Upload, fila offline, normalizacao, bucket `registro-fotos`, policies,
  UI de fotos e storage real permanecem fora deste corte para CPs proprios.
- CP-57B mapeia a ordem segura para remover fotos/upload/storage herdados:
  Registro, Equipamentos, Historico, storage client-side e Supabase bucket
  devem ser cortados em CPs separados. A delecao direta de `photoStorage.js`,
  `Photos` ou `EquipmentPhotos` continua insegura porque ainda misturaria UI,
  sync offline, storage real e policies.
- CP-57C remove de `src/core/storage/normalizers.js` o bridge duplicado
  `migrateLegacyPhotosInState`, sem consumidor runtime. A migracao ativa de
  fotos legadas permanece em `src/core/storage/storageMigrations.js`, que e o
  caminho importado por `src/core/storage.js`.
- CP-57D aposenta a captura/upload de fotos no Registro v1: remove
  `Photos.render`/`Photos.pending`, helpers de save de fotos, inputs publicos
  `input-fotos`/`input-fotos-camera`/`registro-photos-root` e testes da captura
  legada. Equipamentos, Historico, `photoStorage.js`, Supabase/RLS, bucket e
  migrations permanecem fora deste corte.
- CP-57E aposenta o editor/upload de fotos de Equipamentos v1: remove
  `open-eq-photos-editor`, `save-eq-photos`, `modal-eq-photos`,
  `EquipmentPhotos` e o modulo `src/ui/views/equipamentos/fotos.js`. A leitura
  de fotos existentes como capa/preview permanece ate o CP de Historico/storage.
- CP-57F aposenta o runtime legado de lightbox de fotos: remove
  `src/ui/components/photos.js`, `Photos.openLightbox`, `hist-open-photo`,
  `data-photo-url`, o handler `close-lightbox` e o markup `#lightbox`. Fotos
  antigas seguem apenas como imagens estaticas ate o CP de storage.
- CP-57G aposenta o runtime client-side legado de storage/upload de fotos:
  remove `src/core/photoStorage.js`, a fila/migracao automatica em
  `src/core/storage.js`, `src/core/storage/storageMigrations.js` e o teste
  dedicado de upload/signing. O CP preserva apenas normalizacao pura de
  referencias em `src/core/storage/photoRefs.js`; buckets, policies, migrations
  e upload/storage real ficam fora para etapa app-v2-native propria.
- CP-57H limpa os vestigios test-only de `photoStorage.js` depois da remocao do
  runtime: remove mocks e expectativas antigas de `uploadPendingPhotos` nos
  testes de Registro/exploratorios/regressoes e adiciona contrato para impedir
  a volta desses mocks. Nenhum runtime, Supabase/RLS, bucket ou migration foi
  alterado.
- CP-57I remove o tratamento especial de `#lightbox` no router legado depois da
  aposentadoria do runtime de fotos: o fechamento e a contagem de camadas
  bloqueantes passam a depender apenas de modal padrao, camadas registradas via
  `registerBlockingLayer` e overflow modal. Nenhum storage, Supabase/RLS ou
  migration foi alterado.
- CP-57J remove os ultimos tratamentos runtime diretos de `#lightbox` em
  `src/core/modal.js` e `src/core/events.js`: clique no overlay e Escape deixam
  de conhecer o lightbox legado, e o contrato passa a bloquear o retorno desse
  vestigio em router/modal/events.
- CP-57K remove mocks test-only que ainda apontavam para
  `src/ui/components/photos.js` depois da remocao do componente legado. O
  contrato passa a bloquear o retorno desses mocks junto de `photoStorage.js` e
  `uploadPendingPhotos`.
- CP-57L remove o helper orfao `src/ui/viewModels/registroPhotosModel.js` e os
  mocks test-only associados. O contrato passa a bloquear o retorno desse helper
  sem tocar storage, Supabase/RLS, bucket, PDF/share ou app-v2 runtime.
- CP-58A mapeia o descomissionamento sensivel do bucket `registro-fotos`. A
  decisao e manter o bucket como legado em drenagem por enquanto, porque
  remove-lo do delete-user-account agora pode deixar arquivos antigos sem
  limpeza em exclusao de conta. Nenhum runtime, bucket, migration ou policy foi
  alterado.
- CP-58B adiciona contrato de drenagem: o runtime client-side em `src/` nao pode
  voltar a conter `registro-fotos`, enquanto delete-user-account e migrations
  historicas seguem fora do escopo ate etapa propria de storage/Supabase.

Controle:

- Confirmar que app-v2 nao importa CSS legado.
- Usar relatorio de CSS morto quando aplicavel.
- Fazer smoke visual mobile/desktop do app-v2.

Validacao:

```bash
npm run lint:css:dead
npm run build
npm run check
```

Commit sugerido:

- `Remove legacy CSS surfaces`

### CP-7 - Limpar vestigios publicos, pricing e legal

Objetivo: alinhar a superficie publica ao produto atual sem billing/pricing no
cliente.

Escopo provavel:

- `index.html`
- `public/legal/termos.html`
- `public/legal/privacidade.html`
- Referencias publicas a `/#planos`, Stripe, Free, Plus, Pro e assinatura paga.

Controle:

- Manter URL oficial `https://cool-track-pro.pages.dev/`.
- Nao comprar ou trocar dominio.
- Nao apagar historico tecnico em `docs/` fora do documento de checkpoint.

Validacao:

```bash
npm run format
npm run build
npm run check
```

Commit sugerido:

- `Remove public pricing vestiges`

### CP-8 - Verificacao final para v2 como versao principal

Objetivo: provar que a `main` serve apenas o app-v2 como produto principal e que
o v1 nao participa mais do runtime.

Validacao local:

```bash
npm run format
npm run build
npm run check
npm run test:e2e:ci
rg -n "src/ui|src/react|src/features|pricing|billing|stripe|/#planos" index.html src public
```

Validacao remota:

- Smoke em `https://cool-track-pro.pages.dev/`.
- Login com conta de teste aprovada pelo usuario.
- Navegacao app-v2: Hoje, Equipamentos, Servicos, Orcamentos, Alertas e Conta.
- Confirmar que nao ha CTA de planos, checkout, portal de cliente ou pricing.

Commit sugerido:

- `Document v2 primary cleanup completion`

## 7. Ordem recomendada

1. CP-1 para travar inventario e evitar delecao por palpite.
2. CP-2 para quebrar ou aposentar acoplamentos sensiveis.
3. CP-3 a CP-5 para remover runtime v1 por lotes.
4. CP-6 para limpar CSS depois que runtime v1 sair.
5. CP-7 para limpar superficie publica e legal.
6. CP-8 para validar e registrar fechamento.

## 8. Criterio de pronto

A remocao do v1 so deve ser considerada concluida quando:

- `index.html` monta apenas app-v2.
- `src/ui`, `src/react` e `src/features` nao existem mais ou restaram apenas
  arquivos reclassificados com justificativa documentada.
- PDF/share, assinatura, fotos, storage e PMOC legados nao participam do app-v2;
  a recriacao dessas areas esta documentada como app-v2-native.
- `src/app-v2` nao importa runtime legado.
- `src/domain` e `src/core` nao importam `src/ui`, `src/react` ou
  `src/features`.
- Nao ha CTA publico de pricing, checkout, portal de cliente ou planos pagos.
- Build, check, testes e smoke remoto passam.

## 9. Proximo passo recomendado

Executar CP54C1: aposentar a superficie clicavel PDF/WhatsApp em Historico e
Registro v1 antes de remover o handler central. O corte deve remover CTAs e
fallbacks legados, ajustar os testes correspondentes e manter PDF/share,
WhatsApp, assinatura, fotos, storage e PMOC app-v2-native para etapas proprias.

## 10. Atualizacao de continuidade

- CP-58C remove a superficie formal PMOC v1 (`pmocModal`, `pmocInfoModal`,
  `open-pmoc-modal` e post-action `openPmoc`).
- CP-58D remove a superficie PMOC da tela legada de Clientes
  (`clientePmocPanel`, `open-pmoc-panel`, `pmoc-focus`, `pmocSummary` e
  `pmocOverdueCount`).
- CP-58E remove a superficie PMOC do Dashboard legado: o card de clientes deixa
  de consumir `buildClientePmocDetails` e a proxima acao deixa de priorizar
  alertas por texto `PMOC`.
- CP-58F remove a superficie PMOC do Historico legado: os itens de atencao
  `pmoc-*` deixam de existir e `buildClientePmocDetails` deixa de ser injetado
  no view model/helpers de Historico.
- CP-58G remove o helper core legado `src/core/clientePmoc.js` e seu teste
  dedicado depois que nao ha mais consumidor runtime desse resumo PMOC por
  cliente.
- V1 deve permanecer apenas como referencia funcional. O app-v2 nao deve
  reaproveitar runtime sensivel de PDF/share, assinatura, fotos, storage, PMOC
  ou Supabase.
- Supabase deve ser refeito em etapa propria depois da limpeza das migrations e
  artefatos v1.
