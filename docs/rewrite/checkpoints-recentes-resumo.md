# Checkpoints recentes - resumo curto

Este arquivo substitui documentos longos de CP quando o historico detalhado nao
e mais necessario. Para novos CPs, manter aqui somente o resumo objetivo da
decisao, do escopo e do risco remanescente.

## Billing/pricing

- Removidas superficies publicas e runtime visivel de billing, pricing, Stripe,
  checkout, upgrade e CTAs comerciais.
- Removidos residuos tecnicos de quota `pdf_export` e `whatsapp_share`.
- Neutralizados rotulos de exportacao que ainda descreviam assinatura,
  PDF/WhatsApp como conteudo atual.
- Consolidado e removido o historico antigo de monetizacao PDF/cotas; billing e
  pricing serao redesenhados em etapa propria.
- Removidos scripts manuais antigos de seguranca da Mudanca 17 que validavam
  billing, assinatura e storage legados.
- Removido gate comercial remanescente do checklist de onboarding; o passo de
  cliente fica visivel no fluxo operacional.
- Equipamentos passou a usar a politica operacional de acesso para setores em
  vez do cache antigo de plano comercial.
- Historico passou a usar a politica operacional de acesso em vez do cache
  antigo de plano comercial.
- Removidos mocks mortos de `planCache` nos testes focados do Historico.
- Neutralizados comentarios residuais de plano comercial em nameplate e
  Equipamentos, sem renomear aliases/eventos de compatibilidade.
- Neutralizados comentarios residuais do CTA bloqueado de nameplate, preservando
  IDs/eventos de compatibilidade.
- Removidos literais mojibake do view model de Registro, trocando por
  decodificacao generica de mensagens antigas.
- Neutralizados comentarios residuais de versoes antigas/dash em Perfil e Auth,
  sem alterar runtime, storage ou contratos publicos.
- Neutralizada linguagem runtime residual de area comercial em plano operacional,
  limites, historico, setores e nameplate, preservando APIs/eventos existentes.
- Mantido apenas o uso operacional ainda ativo: `nameplate_analysis`.
- Mantidos fora do escopo: Supabase/RLS/migrations reais, storage, PDF/share,
  WhatsApp, assinatura, PMOC, favicon e assets publicos.

## Copy e encoding

- Corrigidos textos operacionais com portugues quebrado em helpers de plano.
- Corrigidas mensagens visiveis do app-v2 em formularios/detalhes de cliente e
  equipamento.
- Corrigidos textos visiveis corrompidos no Registro/checklist legado ainda
  ativo.

## Remocao v1

- Consolidado o historico dos CPs individuais de remocao v1 neste resumo unico.
- Ja foram tratados: shell/rotas legadas, telas DOM v1, ilhas React antigas,
  CSS legado, billing/pricing, PDF/share v1, assinatura digital, fotos/storage,
  PMOC visual/copy e `twa-build`.
- `.env.example` foi limpo para Cloudflare Pages e nao lista mais variaveis de
  bucket/storage/PDF legadas.
- Mantidos como etapa propria futura: Supabase/RLS/migrations reais, storage
  novo, PDF/share novo, WhatsApp novo, assinatura nova, PMOC novo e orcamento
  real app-v2-native.
- O favicon e os assets de marca preservados continuam fora da remocao ampla.
- Removidas entradas `.gitignore` remanescentes de `twa-build`; o build TWA
  legado nao faz parte do app-v2.
- Removido `assetlinks.json` Android legado; app-v2 permanece como web/PWA em
  Cloudflare Pages.
- Removido backup versionado de icones pre-redesign; favicons e icones publicos
  ativos foram preservados.
- Removidas imagens raiz da landing antiga (`antes/depois/passos/hero/Perfil`);
  logos, wordmarks e favicons foram preservados.
- Manifesto publico alinhado ao app-v2: rotulo legado `Dashboard` trocado por
  `Hoje`, sem alterar favicons ou icones publicos ativos.
- Comentarios publicos do `robots.txt` neutralizados para app-v2/Cloudflare, sem
  alterar regras de indexacao.
- Contrato de metadados publicos reforcado para detectar mojibake real em
  UTF-8, independente da exibicao do terminal local.
- Comentarios de estilos legais e configuracao ativa neutralizados para nao
  manter linguagem v1/legacy fora dos contratos historicos.
- Comentarios de utilitarios core ativos neutralizados para nao manter versao
  textual v1.0 fora de contexto historico.
- Comentarios de constantes de status do dominio neutralizados para nao apontar
  o dashboard legado como referencia arquitetural.
- Comentarios de dominio de dados de placa neutralizados para tratar payloads
  antigos sem linguagem de legado.

## PMOC legado

- Consolidado e removido o historico antigo de PMOC contextual/Pro.
- PMOC antigo nao deve ser reutilizado como arquitetura do app-v2.
- PMOC novo fica como etapa propria futura, com contrato, storage e PDF/share
  redesenhados do zero.

## Fluxo/produto legado

- Consolidado e removido o historico antigo da Mudanca 18.
- A referencia util preservada e conceitual: reduzir friccao para o tecnico,
  priorizar registro de servico, clientes/equipamentos e navegacao por intencao.
- Regras antigas de plano, pricing, PDF/share, PMOC e onboarding legado nao
  devem ser copiadas para o app-v2 sem etapa propria.

## Design legado

- Consolidado e removido o historico antigo da Mudanca 21.
- O rewrite app-v2 nao continua a numeracao nem os padroes visuais dessa trilha.
- A referencia valida para UI atual e o Design System do app-v2 em
  `docs/rewrite/`, nao os CPs visuais legados.

## Migracao v1 legada

- Consolidado e removido o historico de mapas CP das Mudancas 11 a 16.
- A referencia util preservada e apenas analitica: fachadas, handlers,
  assinatura, PDF, checklist PMOC, lifecycle, historico e chunks mostram riscos
  do v1 que nao devem ser repetidos.
- Esses mapas nao devem orientar nova arquitetura diretamente; app-v2 deve
  recriar contratos sensiveis em etapas proprias.

## App-v2 publicacao Cloudflare

- Consolidado e removido o historico detalhado dos CPs de promocao do app-v2.
- Estado preservado: app-v2 tratado como experiencia principal em
  `https://cool-track-pro.pages.dev/`, com fallback SPA, smokes publicos,
  smokes autenticados quando houver sessao valida, size/e2e e runbook de
  cutover registrados.
- Nao comprar dominio para o app; a URL correta continua sendo a Pages.
- Removida configuracao Netlify; deploy principal passa a referenciar apenas
  Cloudflare Pages.
- Neutralizado comentario CSP publico que ainda usava linguagem `legacy`.
- Removido checklist HTML local antigo de deploy; fluxo de publicacao atual deve
  ficar em Cloudflare Pages e validacoes automatizadas.
- Removido script shell antigo de prerelease com checklist Supabase/staging
  desatualizado; validacao atual deve usar os comandos versionados e smokes
  app-v2/Cloudflare.
- Atualizado script de dead CSS para os arquivos CSS atuais, sem dependencia
  externa e sem safelist antiga de pricing/assinatura/quota.
- Reforcado contrato agregado para manter runtime app-v2 fora de auth/storage
  legados, permitindo Supabase direto somente nos entrypoints opt-in.
- Ampliado contrato agregado para impedir imports do runtime app-v2 para
  `src/ui`, `src/features`, `src/react`, PDF/PMOC legados e orcamentos v1.
- Reforcado contrato de cutover para manter previews locais isolados do shell e
  CSS legados.
- Removidos artefatos JSON antigos de metricas QA dos CPs visuais ja
  consolidados; o historico operacional fica neste resumo.
- Billing/pricing, Supabase/RLS/migrations reais, storage, PDF/share, WhatsApp,
  assinatura, PMOC e orcamento real seguem como etapas proprias futuras.

## App-v2 porta de dados

- Consolidado e removido o historico detalhado dos CPs de porta de dados,
  clientes, equipamentos, setores, arquivamento, agenda, anexos, orcamentos e
  conclusao de servico.
- Estado preservado: app-v2 usa fronteira propria de dados, adapters mock/local
  e adapters Supabase planejados/testados por fatias pequenas.
- Supabase/RLS/migrations reais ainda devem ser refeitos depois das migrations
  v1, em etapa propria, sem assumir paridade automatica com os contratos antigos.
- PDF/share, WhatsApp, storage de arquivos, PMOC e orcamento real continuam fora
  dessa consolidacao.

## Politica de Markdown

- O repositorio deve manter apenas Markdown operacional indispensavel:
  `AGENTS.md`, `docs/rewrite/checkpoints-recentes-resumo.md` e skills do Matt
  Pocock vendorizadas em `matt-pocock-skills/skills/`.
- Documentos de CP, inventarios, auditorias, planos antigos e READMEs foram
  removidos do controle de versao.
- A copia duplicada `.agents/skills/` foi removida; a referencia versionada das
  skills fica em `matt-pocock-skills/skills/`.
- Novos CPs devem ser resumidos aqui, de forma curta e objetiva, sem recriar
  arquivos `.md` separados.
- Esta politica nao remove favicon, assets publicos nao Markdown, codigo,
  testes, configuracoes ou migrations.

## AGENTS.md

- Atualizado para refletir a direcao atual: app-v2 como experiencia principal,
  v1 apenas como referencia historica e remocao de vestigios por CPs pequenos.
- Removidas referencias obrigatorias a documentos `.md` que foram consolidados
  neste resumo.
- Mantidos guardrails de 99% de certeza, validacao, areas sensiveis e
  preservacao do favicon.

## Textos e codificacao

- Corrigido mojibake em textos visiveis e comentarios de Registro legado ainda
  carregados pelo runtime.
- Mantida compatibilidade de leitura para registros antigos com tipo `Outro`
  salvo usando separador corrompido.
- Validacoes focadas devem cobrir lifecycle de Registro e o scan de vestigios
  legado.
- Adicionada guarda de teste para manter Markdown versionado restrito a
  `AGENTS.md`, este resumo e skills do Matt Pocock.
- Corrigidos comentarios corrompidos no `.gitignore` sem alterar padroes de
  ignore.

## PDF/share legado

- Removidas dependencias `jspdf` e `jspdf-autotable` apos confirmar ausencia de
  imports runtime.
- Removido chunk manual `vendor-pdf` do Vite.
- PDF/share novo continua fora do app-v2 ate etapa propria futura.

## Dashboard legado

- Removido cluster runtime `src/ui/views/dashboard*`,
  `src/ui/viewModels/dashboard*` e `src/ui/components/overflowBanner.js`.
- `view-inicio` no shell legado ficou como placeholder minimo para preservar
  contratos de navegacao enquanto o app-v2 e a experiencia principal.
- Ajustados testes de contratos, equipamentos e historico para nao dependerem
  de mocks do dashboard removido.
- Removido em CP proprio o tratamento de router para `dash-overflow-modal`,
  apos retirada do componente que criava esse modal.
- Neutralizadas mencoes arquiteturais remanescentes a Dashboard em comentarios
  de constantes puras de dominio.
- Neutralizados comentarios runtime restantes que citavam dashboard em tour,
  onboarding checklist e prefill de registro; contrato focado adicionado.
- Neutralizada mencao a Dashboard do Supabase em comentario de suporte para
  evitar confusao com o dashboard legado removido.
- Neutralizados comentarios genericos de legado em helpers UI nao sensiveis de
  cliente, equipamentos, navegacao e contexto.
- Neutralizados comentarios residuais de legado em tour, registro e fallback
  visual de equipamentos sem alterar contratos ou comportamento.
- Neutralizada referencia visual residual a V1 em cards de equipamento.
- Neutralizados comentarios residuais de legado em historico e templates de
  modais sem alterar ids, data-actions ou contratos publicos.
- Neutralizados nomes internos `Legacy` em aliases de contrato de Clientes sem
  alterar valores publicos de acao.
- Neutralizada mencao residual em comentario de persistencia local de setores
  sem alterar regra de `clienteId`.
- Neutralizada nomenclatura residual em testes app-v2 de fronteira, cutover,
  shell e reidratacao de registro sem alterar runtime.
- Neutralizados comentarios e nomes de teste residuais no router sem alterar
  rotas, history state, backbutton ou blocking layers.
- Neutralizados comentarios residuais em captura de placa sem alterar gate,
  upload, analise IA, quota ou payloads retornados pela API.
- Neutralizados nomes internos de helpers de migracao do onboarding sem alterar
  storage keys, render, eventos ou escopo por usuario.
- Neutralizados nomes locais residuais em `Profile.get()` sem alterar chaves de
  perfil, fallback localStorage ou escopo por usuario.
- Neutralizados nomes internos do fallback de compatibilidade de schema de
  equipamentos sem alterar payload, chaves persistidas ou ordem de sincronizacao.
- Neutralizados nomes internos de migracao local e compatibilidade do tipo
  `Outro` em registros sem alterar valores persistidos ou leitura de dados
  anteriores.
- Centralizadas chaves persistidas de sync em `storage/constants.js`, removendo
  duplicacao em consumidores sem alterar valores de localStorage.
- Centralizadas chaves persistidas restantes de OAuth pendente e onboarding
  contextual em `storage/constants.js`, preservando valores e escopo por usuario.
- Renomeado modulo interno de politica de acesso operacional, mantendo
  compatibilidade de helpers enquanto billing/pricing seguem removidos.
- Adicionado contrato para limitar tokens runtime `v1` a endpoints versionados e
  chaves persistidas centralizadas.

## Nomenclatura React legada

- Neutralizados nomes internos restantes de lista React em Equipamentos:
  `buildReactList*` virou `buildDomList*` e a classe local passou para
  `equip-list-dom`.
- A arvore `src/react` segue removida; o renderer atual de Equipamentos usa DOM.
- `scripts/css-proof.mjs` deixou de escanear `src/react`, `src/tests` e
  `src/assets/styles`; o helper agora aponta para estilos versionados atuais.
- Renomeados testes ativos de Equipamentos de `equipamentosLegacy*` para
  `equipamentosDom*`, mantendo cobertura de contratos DOM sem linguagem de
  legado.
- Renomeados testes ativos de Historico de `historico*LegacyRender` para
  `historico*DomRender`, preservando a cobertura de render DOM atual.
- Renomeados testes ativos de Registro de `registroLegacy*` para `registroDom*`
  sem alterar fluxos, checklist, assinatura, storage ou PMOC runtime.
- Neutralizada linguagem `legado` em descricoes de testes ativos dos handlers
  DOM de checklist de Registro, sem alterar asserts ou runtime.
- Neutralizada linguagem `legacy/legado` em descricoes de testes ativos de
  Clientes, preservando seletores, data attributes e asserts.
- Neutralizada linguagem `legacy/legado` em descricoes de testes ativos de
  Equipamentos ligados a adapters/bridges DOM, sem alterar fixtures ou runtime.
- Neutralizada linguagem `legacy/legado` em descricoes de testes ativos de
  Historico ligadas a sheet mobile, handlers DOM e view model, sem alterar
  contratos publicos ou runtime.
- Neutralizada linguagem `legado` em descricoes de testes ativos de Registro
  ligadas a payload, lifecycle helper e checklist renderer, sem alterar
  assinatura, persistencia, post-save ou runtime.
- Neutralizada linguagem `legado` em descricao nominal do teste de
  `profileModal`, preservando contrato CSS BEM e asserts.
- Neutralizada linguagem `legacy/legado` no teste de ownership de Equipamentos,
  preservando o gate contra modulos paralelos obsoletos.
- Representados snippets proibidos de mojibake por escapes no contrato de
  remocao v1, mantendo o mesmo gate sem texto corrompido visivel.
- Representados padroes de normalizacao de mojibake do relatorio app-v2 por
  escapes Unicode, preservando a correcao de textos exibidos.
- Neutralizado fixture nominal `Legado` no teste de view model de Equipamentos,
  preservando o caso de setor sem cliente vinculado.
- Neutralizada linguagem `legacy/legado` em descricoes de testes ativos de
  Equipamentos sem alterar asserts, storage, fotos ou runtime.
- Neutralizada linguagem residual em testes ativos de dados de placa e perfil,
  preservando prioridade de campos e fallback global de compatibilidade.
- Neutralizada linguagem residual no teste de onboarding, preservando chave
  antiga de migracao e escopo por usuario.
- Neutralizada linguagem residual em testes ativos de persistencia e lifecycle
  de Registro, sem alterar payload, storage, assinatura ou runtime.
- Neutralizada linguagem residual e mojibake em teste de fallback de schema de
  Setores, sem alterar mocks, selects, asserts ou runtime Supabase.
- Neutralizado fixture nominal em teste de configuracao Supabase frontend, sem
  alterar nomes de env vars, rejeicao de fallback ou validacao de service_role.
- Neutralizada linguagem residual em testes de assinatura aposentada de Registro,
  sem alterar handlers, payload, PDF/share, WhatsApp, storage ou runtime.
- Neutralizada linguagem residual em testes de payload, Historico e acoes
  aposentadas de assinatura/PDF/WhatsApp, sem alterar asserts ou runtime.
- Neutralizada linguagem residual no teste e2e do entrypoint principal app-v2,
  sem alterar asserts, preview, rotas ou runtime.
- Neutralizado fixture nominal residual em teste de persistencia de
  Equipamentos, sem alterar helper runtime ou contratos publicos.
- Neutralizada linguagem residual em teste de filtros do Historico sobre CTAs
  aposentados de PDF/WhatsApp, sem alterar asserts ou runtime.
- Neutralizado gate nominal residual em teste de contratos de Clientes, mantendo
  cobertura contra acoes obsoletas sem alterar valores publicos.
- Neutralizada nomenclatura residual em testes ativos de storage/cache, sem
  alterar chaves persistidas, asserts, assinatura, fotos ou runtime.
- Neutralizada nomenclatura residual em teste ativo de plano operacional, sem
  alterar helpers comerciais, asserts, billing, pricing ou runtime.
- Neutralizada linguagem residual em comentarios/mensagens internas de
  Supabase, sem alterar SQL executavel, endpoints, schemas, RLS ou runtime.
- Adicionado gate para impedir termos comerciais removidos em Edge Functions
  ativas, sem alterar runtime Supabase, migrations, schema ou RLS.
- Neutralizados comentarios comerciais residuais em queries de Dashboard
  Supabase, com gate focado sem alterar SQL executavel, migrations, schema ou
  RLS.
- Adicionado gate para limitar termos comerciais removidos em migrations ao
  historico conhecido coberto pela migration de retirada, sem reescrever schema
  historico.
- Neutralizada linguagem residual de legado em comentarios de migrations
  Supabase, sem alterar SQL executavel, constraints, funcoes, schema ou RLS.
- Neutralizada linguagem residual em comentario do core de Clientes, com gate
  focado sem alterar persistencia, Supabase, RLS ou runtime.
- Neutralizada ambiguidade de `portal` em copy de canal de chamados do cliente,
  reforcando o gate de termos comerciais sem alterar handlers ou dados.
- Removida superficie obsoleta `PREMIUM_FEATURE_EQUIPAMENTOS`/premium helpers do
  plano operacional, preservando perfil operacional e sem tocar gates ativos.
- Neutralizada nomenclatura residual `premium/PRO` em comentarios de Setores e
  renomeado teste do modal, sem alterar gate funcional ou runtime.
- Neutralizada copy residual `PRO` em badges de Setores, mantendo estado locked
  e contratos de permissao sem alterar a logica de gate.
- Neutralizados comentarios runtime de Setores ligados a linguagem comercial,
  mantendo nomes publicos e guards de compatibilidade.
- Neutralizada copy/comentarios runtime de analise de placa ligados a plano
  pago, preservando contratos publicos e funcao Supabase.
- Neutralizados nomes internos seguros e descricoes de teste do aviso de
  checklist preventivo indisponivel, preservando ids/classes/eventos publicos.
- Neutralizadas descricoes de testes que ainda apresentavam clientes e setores
  como superficies comerciais Free/Plus/Pro.
- Neutralizados descricoes e comentarios de testes de equipamentos/setores que
  ainda tratavam limites operacionais como superficies comerciais.
- Neutralizado lote adicional de descricoes/comentarios de testes ligados a
  historico, assinatura aposentada, cache e limites operacionais.
- Removidas migrations historicas do ledger `stripe_webhook_events`, mantendo a
  migration de retirada como cobertura do schema comercial aposentado.
- Neutralizada a palavra `portal` em copy/fixture de canal de chamados do
  app-v2, reduzindo ruido com gates de limpeza comercial.
- Renomeada e neutralizada migration de hardening de profile/usage, preservando
  RLS de `usage_monthly` e checks de metadados historicos ate a retirada.
- Renomeada e neutralizada migration de retirada de schema comercial,
  preservando drops de metadados do provedor anterior e ledger aposentado.
- Neutralizados comentarios em migrations historicas de profiles/uso/IA,
  corrigindo mojibake sem alterar SQL executavel.
- Neutralizada linguagem comercial residual em comentarios de gates historicos
  de Supabase/IA, preservando contratos e regras executaveis.
- Dividido teste de contratos de remocao v1 acima de 1000 linhas, sem alterar
  runtime, asserts ou escopo dos gates.
- Extraido overlay de scan de `nameplateCapture.js` para modulo coeso, reduzindo
  arquivo legado abaixo de 1000 linhas sem alterar IDs, fluxo de IA ou gates.
- Extraido view model de timeline do historico para modulo coeso, reduzindo
  `historico.js` abaixo de 1000 linhas sem alterar renderers, filtros ou storage.
- Extraido controller do modal de setores de `equipamentos.js`, reduzindo o
  arquivo abaixo de 1000 linhas sem alterar contratos publicos ou persistencia.
- Extraido controller de UI local do formulario de registro, preservando
  progresso, tipo custom, avisos e toggles sem alterar save/storage/checklist.
- Extraidos controllers de contexto, inicializacao, clear/edit e UI de save do
  registro, reduzindo `registro.js` abaixo de 1000 linhas sem alterar storage.
- Neutralizada linguagem residual de legado em descricoes de testes ativos de
  persistencia de Setores, sem alterar asserts, storage ou runtime.
- Neutralizada linguagem residual de legado em descricoes de testes ativos de
  clientes, equipamentos, onboarding, navegacao, registro e tour, sem alterar
  asserts ou runtime.
- Dividido catalogo PMOC de checklist em modulos menores, mantendo a API publica
  de `checklistTemplates.js` e sem alterar itens, labels, unidades ou regras.
- Neutralizadas classes visuais residuais `plus-badge`/`pro-badge` em templates
  ativos, preservando copy e comportamento.
- Removido modulo orfao de orcamento real v1 e helper de follow-up, mantendo
  apenas o shape local de `orcamentos` para o app-v2.
- Removida dependencia runtime de callers ativos em helpers pagos de plano
  (`hasProAccess`/`hasPlusAccess`) em Equipamentos e Historico, mantendo exports
  de compatibilidade para etapa posterior.
- Removidas dependencias mortas de plano pago no guard de persistencia de
  Setores, preservando o contrato publico de compatibilidade.
- Renomeada dependencia interna de renderizacao de Equipamentos de plano Pro
  para acesso operacional de Setores, sem mudar comportamento.
- Removidos mocks comerciais obsoletos em testes de Equipamentos, mantendo os
  cenarios operacionais de setores e renderizacao.

## Validacao padrao

- Para CPs com codigo: testes focados, `npm run format`, `npm run build`,
  `npm run check`, `git diff --check`.
- Para CPs documentais: `npm run format:check`, `git diff --check`,
  `git diff --cached --check` e busca por referencias quebradas.
- Para CPs futuros: registrar aqui apenas resumo curto da frente de trabalho.
