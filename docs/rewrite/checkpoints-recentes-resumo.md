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

## Nomenclatura React legada

- Neutralizados nomes internos restantes de lista React em Equipamentos:
  `buildReactList*` virou `buildDomList*` e a classe local passou para
  `equip-list-dom`.
- A arvore `src/react` segue removida; o renderer atual de Equipamentos usa DOM.
- `scripts/css-proof.mjs` deixou de escanear `src/react`, `src/tests` e
  `src/assets/styles`; o helper agora aponta para estilos versionados atuais.

## Validacao padrao

- Para CPs com codigo: testes focados, `npm run format`, `npm run build`,
  `npm run check`, `git diff --check`.
- Para CPs documentais: `npm run format:check`, `git diff --check`,
  `git diff --cached --check` e busca por referencias quebradas.
- Para CPs futuros: registrar aqui apenas resumo curto da frente de trabalho.
