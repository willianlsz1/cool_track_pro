# Mudanca 21 / CP-E - Clientes, Equipamentos e Detalhes

## 1. Objetivo

Aplicar o contrato visual de superficies da CP-B em Clientes, Equipamentos e Detalhes, reduzindo a sensacao de card dentro de card, painel dentro de painel e detalhe com hierarquia indefinida.

O foco desta CP-E foi visual e controlado. Nao houve mudanca de fluxo, dados, PMOC runtime, PDF/share, WhatsApp, Supabase, monetizacao, dependencias ou tema claro azul/branco.

## 2. Estado inicial

- Branch observada: `main`
- HEAD inicial: `3965c4ce172a455bb311d5f38d007b0f9539457e`
- Commit base: `refactor(design): align shell navigation hierarchy`
- Working tree inicial: limpo
- Documentos de contexto lidos:
  - `docs/design/mudanca-21-cp-a-auditoria-superficies-modais.md`
  - `docs/design/mudanca-21-cp-b-contrato-visual-superficies.md`
  - `docs/design/mudanca-21-cp-c2-registro-desktop-layout.md`
  - `docs/design/mudanca-21-cp-d-shell-sidebar-header-nav.md`
  - `docs/rewrite/checkpoints-recentes-resumo.md`

## 3. Arquivos alterados

- `src/react/pages/ClientesPage.jsx`
- `src/assets/styles/redesign.css`
- `src/__tests__/clientesReactIsland.test.jsx`
- `docs/design/mudanca-21-cp-e-clientes-equipamentos-detalhes.md`

## 4. Comportamento visual anterior

Clientes:

- os cards tinham varias acoes com o mesmo peso visual;
- PMOC, estatisticas e acoes competiam com a identificacao do cliente;
- filtros e resumo podiam parecer superficies equivalentes aos cards.

Equipamentos:

- hero, filtros, toolbar, busca e cards tinham peso de painel;
- a lista em desktop largo podia parecer uma coluna longa subaproveitada;
- cards e setores usavam bordas/sombras semelhantes demais.

Detalhe do equipamento:

- o detalhe continuava com muito conteudo empilhado em um modal;
- foto, score, risco, PMOC, ficha tecnica, historico e footer ficavam no mesmo eixo vertical;
- em desktop, o modal real nao aproveitava bem a largura disponivel.

## 5. Comportamento visual novo

Clientes:

- `Ver equipamentos` passou a ser a unica acao primaria do card;
- `Ver servicos`, `PMOC`, `Novo orcamento` e `Novo servico` continuam acessiveis, mas com peso secundario;
- cards, KPIs, resumo e PMOC receberam tratamento mais leve e subordinado a pagina.

Equipamentos:

- hero, filtros, toolbar e busca ficaram mais estruturais e menos cardificados;
- em desktop largo, a lista de equipamentos passa a usar uma grade responsiva para aproveitar melhor 1920x1080;
- cards de equipamento e setor foram suavizados sem remover sinais de risco/status.

Detalhes:

- o modal de detalhe fica mais claramente como overlay real em desktop;
- a superficie do modal ganhou largura controlada, borda e sombra de overlay;
- em desktop, o conteudo interno usa duas colunas: foto/apoio de um lado e titulo, score e risco do outro;
- PMOC contextual, ficha tecnica, historico e footer permanecem no mesmo detalhe, com hierarquia visual mais clara.

## 6. Superficies reclassificadas

- Clientes continua como pagina de lista/triagem.
- Cards de cliente e equipamento continuam como unidades repetiveis de Nivel 3.
- Filtros/search/toolbars foram rebaixados para ferramentas estruturais da pagina.
- PMOC contextual em card continua como apoio, nao como bloco dominante.
- Detalhe do equipamento continua como modal real de Nivel 4.
- Setores continuam como agrupamentos operacionais, mas com menor peso visual.

## 7. Preservado funcionalmente

- Clientes Free com limite de 1 cliente.
- Edicao e visualizacao de cliente no Free.
- Cliente para Equipamentos direto.
- Setores sob demanda e cliente com setores.
- Registro/orquestrador e `startServiceRegistration`.
- PMOC contextual.
- PDF comum, PDF PMOC formal, WhatsApp/share e pos-save.
- Cota `pdf_export`.
- Rotas, navigation handlers, Supabase/RLS.
- IDs, `data-action`, `data-cli-action`, `data-nav` e selectors publicos.

## 8. Testes e validacao

Validacoes obrigatorias:

- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

Testes focados previstos:

- Clientes React island.
- Clientes PMOC/card/paywall quando aplicavel.
- Equipamentos React list/header.
- Equipamentos detail/model/render.
- E2E visual de equipamentos.

## 9. Validacao visual

Validacao visual esperada nesta CP:

- Clientes desktop 1920x1080.
- Equipamentos desktop 1920x1080.
- Detalhe do equipamento desktop 1920x1080.
- Clientes ou Equipamentos mobile.
- Registro desktop como smoke indireto para conferir ausencia de regressao no shell.

## 10. Riscos remanescentes

- `redesign.css` segue grande e acumulando correcoes escopadas; consolidacao ampla deve ficar para CP propria.
- `components.css` ainda contem estilos antigos e densos para cards/equipamentos.
- A grade de equipamentos em desktop depende do conteudo real dos cards; alguns dados extremos podem exigir ajuste fino posterior.
- O detalhe do equipamento ainda e um modal longo; uma CP futura pode decidir entre manter modal refinado ou transformar parte do conteudo em rota/pagina dedicada.
- PMOC visual foi rebaixado, mas o contrato funcional Pro/Free/Plus segue sensivel e nao deve ser misturado com redesign amplo.

## 11. Proximo CP recomendado

CP-F - Modais reais, drawers, paywalls e estados vazios.

Foco recomendado:

- padronizar overlays reais;
- diferenciar paywall de empty state;
- revisar drawers/sheets e dropdowns;
- validar mobile com modais longos;
- preservar PMOC, PDF/share, WhatsApp, monetizacao e Supabase fora do escopo.
