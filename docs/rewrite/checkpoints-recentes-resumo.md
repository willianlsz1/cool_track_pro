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

## PDF/share legado

- Removidas dependencias `jspdf` e `jspdf-autotable` apos confirmar ausencia de
  imports runtime.
- Removido chunk manual `vendor-pdf` do Vite.
- PDF/share novo continua fora do app-v2 ate etapa propria futura.

## Validacao padrao

- Para CPs com codigo: testes focados, `npm run format`, `npm run build`,
  `npm run check`, `git diff --check`.
- Para CPs documentais: `npm run format:check`, `git diff --check`,
  `git diff --cached --check` e busca por referencias quebradas.
- Para CPs futuros: registrar aqui apenas resumo curto da frente de trabalho.
