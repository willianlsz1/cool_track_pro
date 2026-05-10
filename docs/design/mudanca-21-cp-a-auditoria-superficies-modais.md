# Mudança 21 / CP-A — Auditoria de superfícies, modais e hierarquia visual

## 1. Estado inicial

- Branch: `main`
- HEAD inicial: `46151af16d7ee838ff705fcf37e5a79ac6c6a429`
- Working tree observado no início:
  - `?? docs/design/mudanca-21-cp-a-identidade-visual-clara-dashboard.md`
- Escopo: read-only/documental.
- Arquivo permitido nesta CP-A: `docs/design/mudanca-21-cp-a-auditoria-superficies-modais.md`.
- Fora do escopo: `src/`, CSS, testes, configs, Supabase/RLS/migrations, PDF/share, PMOC runtime, monetização, dependências, React Doctor, redesign amplo e consolidação de CSS.

O working tree esperado pelo prompt era limpo, mas havia um documento de design não rastreado antes desta CP-A. Esta auditoria não depende desse arquivo e não deve misturá-lo no commit desta CP.

## 2. Problema observado

A interface atual usa muitas superfícies com aparência parecida para papéis diferentes: página, seção, card, painel, modal, sheet, popover, empty state, paywall e CTA de upgrade. O resultado é que blocos estruturais e temporários competem no mesmo nível visual.

O caso mais claro é a tela Registro. A sidebar desktop pode parecer um painel independente; a área principal parece um card grande centralizado; o bloco "Novo registro" funciona visualmente como um painel; "Comece pela foto", "Ações rápidas" e "Dados do atendimento" usam pesos próximos; e um modal real aberto por cima pode criar a sensação de modal dentro de modal.

Esse problema não deve ser tratado como falha isolada de Registro. A mesma ambiguidade aparece em Dashboard, Clientes, Equipamentos, Histórico, Relatórios, Pricing, Conta, PMOC, paywalls e dropdowns.

## 3. Taxonomia visual proposta

- Página: área principal de trabalho de uma rota. Deve parecer estável, ampla e estrutural, não um overlay.
- Seção: divisão interna de uma página. Deve organizar conteúdo com baixo contraste e sem peso de modal.
- Card: agrupamento pequeno e repetível, usado para itens como cliente, equipamento, alerta, orçamento ou KPI. Não deve carregar o peso de uma página inteira.
- Painel: bloco funcional persistente dentro da página, mais forte que uma seção e mais fraco que um modal. Deve ser usado com moderação.
- Modal: overlay temporário bloqueante, com camada visual claramente acima da página.
- Drawer/sheet: overlay temporário lateral ou inferior, útil para filtros, escolhas e tarefas curtas. Deve ter fundo/overlay e comportamento diferente de seção.
- Popover/dropdown: painel temporário ancorado a um botão ou item. Deve ser compacto, contextual e claramente descartável.
- Sidebar: estrutura fixa de navegação. Deve parecer parte do shell, não um card flutuante.
- Overlay: camada temporária que escurece ou separa a página quando modal, sheet, drawer ou lightbox está ativo.
- Toast: feedback transitório. Deve ser leve, breve e não competir com modais.
- Estado vazio: estado informativo de uma lista ou página. Deve orientar a próxima ação sem parecer paywall ou modal.

## 4. Níveis de hierarquia visual

### Nível 0 — Estrutura fixa do app

Inclui fundo global, sidebar desktop, header/topbar e bottom nav mobile. Esses elementos devem ser percebidos como estrutura fixa e previsível.

### Nível 1 — Página

Inclui área principal de trabalho, título, descrição curta, CTA principal e conteúdo da rota. A página deve ocupar o espaço de trabalho com largura e ritmo de aplicativo operacional.

### Nível 2 — Seções

Incluem divisões internas da página. Devem usar espaçamento, título e agrupamento leve antes de recorrer a borda, sombra ou fundo forte.

### Nível 3 — Cards/blocos

Incluem KPIs, cards de clientes, equipamentos, alertas, orçamentos, PMOC e blocos pequenos. Devem ser repetíveis, escaneáveis e subordinados à página.

### Nível 4 — Overlays temporários

Incluem modal, drawer, sheet, lightbox, dropdown e popover. Devem ser visualmente superiores à página e mais fáceis de distinguir que um card comum.

### Nível 5 — Feedback temporário

Inclui toast, confirmação transitória, banners de sucesso e mensagens de validação. Deve informar sem reestruturar a tela.

## 5. Auditoria por tela

### App shell geral

- Problema encontrado: `app-shell--with-sidebar`, `app-header`, `app-sidebar` e `app-nav` formam a estrutura fixa, mas a sidebar contém plan card, user chip, sync pill e seção de configurações com linguagem de card. O header também concentra ações e um menu denso.
- Severidade: alta.
- Recomendação inicial: definir contrato de shell no CP-B. Sidebar e bottom nav devem parecer estrutura fixa, com menos borda/sombra/CTA concorrente.

### Sidebar desktop

- Problema encontrado: a sidebar usa grupos, item ativo, item de registro, card de plano, user chip e sync status. O acúmulo de blocos no rodapé faz a estrutura parecer painel flutuante.
- Severidade: alta.
- Recomendação inicial: separar navegação estrutural de marketing/conta. Plan card e user chip devem perder peso de modal/card quando estiverem dentro da sidebar.

### Bottom nav mobile

- Problema encontrado: o bottom nav é estrutural, mas o botão central de registro e badges podem ganhar aparência de overlay flutuante.
- Severidade: média.
- Recomendação inicial: manter Registro como ação primária clara, mas sem transformar o bottom nav em card sobreposto.

### Header/topbar

- Problema encontrado: o `header-help-menu` mistura atalhos de ação, organização, conta, ajuda, PMOC e upgrade. É um popover com densidade de painel administrativo.
- Severidade: média.
- Recomendação inicial: reduzir o menu a ações contextuais e transferir itens persistentes para rotas ou sidebar.

### Dashboard

- Problema encontrado: `dash__hero`, `dash__kpi`, `dash__card`, `dash__section`, cards Pro, onboarding, alertas e blocos read-only podem criar uma página com muitas caixas no mesmo peso.
- Severidade: média.
- Recomendação inicial: tratar o Dashboard como painel operacional, com hero leve, KPIs como dados de leitura rápida e seções sem aparência de modal.

### Registro

- Problema encontrado: tela crítica. O fluxo tem `registro-hero`, progresso, CTA de foto, ações rápidas, bloco obrigatório, blocos opcionais, picker de equipamento em sheet/modal, fork de cliente e modais de confirmação. Muitas superfícies têm peso semelhante.
- Severidade: alta.
- Recomendação inicial: priorizar Registro no CP-C. Transformar a tela em página de trabalho, com formulário principal explícito e ações auxiliares subordinadas.

### Clientes

- Problema encontrado: `cli-page`, `cli-card`, stats internas, PMOC embutido, menu de opções, alert modal, paywall de clientes e painel PMOC podem criar card dentro de card e dropdown dentro de card.
- Severidade: média.
- Recomendação inicial: alinhar card de cliente como item de lista/grade, com ações secundárias compactas e PMOC como seção subordinada ou overlay claramente distinto.

### Detalhe de cliente

- Problema encontrado: o detalhe é composto por dados, equipamentos, PMOC, alertas e ações que podem alternar entre card, painel e overlay sem contrato visual único.
- Severidade: média.
- Recomendação inicial: definir se detalhe é página, painel ou modal antes de redesenhar.

### Equipamentos

- Problema encontrado: `equip-hero`, filtros, search row, `equip-card`, quick move banner, empty states, setores, cards de equipamento, estados de risco e CTAs têm muitos níveis de destaque.
- Severidade: alta.
- Recomendação inicial: alinhar listagem como página operacional de triagem. Cards devem evidenciar risco e próxima ação sem competir com hero/filtros.

### Detalhe do equipamento

- Problema encontrado: o detalhe atual vive em `modal-eq-det`, mas carrega conteúdo de página: cover, score, histórico, detalhes técnicos, menu de ações, fotos e footer. Isso pode fazer um modal parecer tela principal.
- Severidade: alta.
- Recomendação inicial: decidir em CP futuro se o detalhe deve virar página/drawer ou se o modal deve ser reduzido a tarefa curta.

### Setores

- Problema encontrado: setor usa cards, empty states e `setor-modal` com hero, preview card, swatches e formulário. O modal tem densidade alta e contém preview que se parece com outro card interno.
- Severidade: média.
- Recomendação inicial: manter setor como organização secundária, com modal mais claramente temporário e preview menos dominante.

### Serviços/Histórico

- Problema encontrado: Histórico usa summary card, filtros, chips, timeline cards, menus por item, assinatura, foto/lightbox e sheet de filtros no mobile. Há risco de card operacional e overlay se confundirem.
- Severidade: média.
- Recomendação inicial: separar summary de análise, timeline de lista operacional e filtros como sheet temporário no mobile.

### Relatórios

- Problema encontrado: `rel-hero`, toolbar, filtros avançados, cards de relatório, PMOC, quota PDF, botões WhatsApp/PDF, PDF preview e toasts de compartilhamento misturam página, card, modal e feedback. A área é sensível por PDF/share.
- Severidade: alta.
- Recomendação inicial: não alterar nesta CP. Em CP futuro, tratar relatório como fluxo de emissão, com ações primárias hierarquizadas e overlays de preview claramente separados.

### Pricing/Planos

- Problema encontrado: `pricing-hero`, manage section, tabs mobile, cards de plano, tabela comparativa, FAQ e mensagens de upgrade podem criar muitas superfícies comerciais dentro do app operacional.
- Severidade: média.
- Recomendação inicial: manter Pricing como rota de decisão comercial, mas reduzir competição entre card ativo, destaque de plano e CTA.

### Conta/Configurações

- Problema encontrado: Conta substitui parte do antigo popover, mas ainda convive com account modal, profile modal, user chip, header menu e settings. Há risco de duplicidade entre página e modal de conta.
- Severidade: média.
- Recomendação inicial: definir Conta como página estrutural e reservar modais para edição pontual.

### Alertas

- Problema encontrado: alertas usam context banner, cards, estados vazios e tons de severidade. A cor de urgência pode competir com CTAs e com navegação.
- Severidade: baixa.
- Recomendação inicial: manter alerta como lista operacional simples, com cor apenas para severidade real.

### Orçamentos

- Problema encontrado: `orc-page`, KPIs, toolbar, chips, `orc-card`, empty state, modal de criação/edição e assinatura pública compartilham padrões de card, status e CTA.
- Severidade: média.
- Recomendação inicial: separar página de pipeline, card de orçamento e modal de edição. Evitar que KPIs virem cards com peso igual ao item principal.

### PMOC

- Problema encontrado: PMOC aparece como painel contextual em clientes, elemento no Registro, slot em Relatórios, modal formal e modal informativo. A mesma função de produto cruza página, card, painel e overlay.
- Severidade: alta.
- Recomendação inicial: no CP-F, definir quando PMOC é contexto da página, quando é CTA, quando é paywall e quando é modal formal.

### Modais/overlays reutilizáveis

- Problema encontrado: `modal-overlay`, `modal`, `modal-add-eq`, `modal-eq-det`, `modal-eq-photos`, `modal-confirm`, `modal-pdf-preview`, `modal-add-setor`, `pmoc-modal`, `pmoc-info-modal`, `cliente-pmoc`, `cliente-alert-modal`, `clientes-paywall`, `hist-signature-modal`, `sig-capture-modal`, pickers e sheets têm escopos e densidades muito diferentes usando a mesma linguagem geral.
- Severidade: alta.
- Recomendação inicial: criar contrato de overlay no CP-B e inventariar quais overlays devem ser modal, sheet, drawer, popover ou página.

## 6. Auditoria específica da tela Registro

Registro deve ser tratado como caso crítico da Mudança 21.

- Sidebar com cara de modal: no desktop, a navegação lateral usa blocos internos de plano, sync e usuário. Ao lado de Registro, isso reforça a sensação de painel flutuante.
- Container principal com cara de modal: a página usa um arranjo centralizado e superfícies compactas, aproximando a rota de um formulário em modal.
- "Novo registro" como submodal: o `registro-hero--compact` com pill e progresso cria um cabeçalho de tarefa, mas ainda pode parecer o topo de um card/modal.
- "Comece pela foto" como card dominante: `registro-photo-quick` tem ícone, título, hint e chevron. É útil, mas compete com o formulário obrigatório.
- "Ações rápidas" competindo com o formulário: `registro-quick` oferece tiles de modelos antes do bloco obrigatório. Isso pode parecer uma segunda ação primária.
- "Dados do atendimento" como bloco principal: `registro-bloco--required` é a parte real de trabalho e deve ser o núcleo visual da página.
- Progress bar/topo: o progresso precisa ser elemento da página, não ornamento de modal.
- Seções opcionais: fotos adicionais, checklist/PMOC, materiais, assinatura e impacto devem parecer etapas auxiliares subordinadas.
- Modais reais por cima: picker de equipamento, fork de cliente, confirmação, assinatura, PMOC e upgrade precisam ficar claramente acima da página.

Direção futura recomendada:

- Registro como página de trabalho, não modal central.
- Progresso como elemento persistente da página.
- Ações rápidas como seção auxiliar.
- Foto como atalho útil, mas não dominante sobre dados obrigatórios.
- Dados do atendimento como formulário principal.
- Overlays reais com backdrop, elevação e densidade próprios de Nível 4.

## 7. Princípios para correção futura

- Página não deve parecer modal.
- Sidebar não deve competir com conteúdo.
- Modal precisa ser claramente overlay.
- Card não deve ter peso de página.
- Seção não precisa de sombra/borda forte.
- Formulários principais devem parecer área de trabalho.
- Ações secundárias não devem competir com CTA principal.
- Empty state deve orientar, não parecer paywall por padrão.
- Paywall deve ser reconhecível como bloqueio/upgrade, não como card comum.
- Dropdown/popover deve ser compacto e contextual.
- Drawer/sheet deve parecer temporário e descartável.
- Hierarquia não deve depender só de cor; deve combinar fundo, borda, sombra, raio, espaçamento, densidade e posição.
- Reduzir "caixa dentro de caixa" antes de trocar paleta.
- Evitar trocar o problema de excesso de modais por uma interface plana demais.

## 8. Plano recomendado de CPs futuras

- CP-B — Contrato visual de superfícies: definir página, seção, card, painel, modal, drawer/sheet, popover/dropdown, sidebar, overlay, toast, empty state e paywall; definir uso de fundo, borda, sombra, radius e espaçamento.
- CP-C — Registro como página de trabalho: aplicar hierarquia na tela mais crítica, reduzir sensação de modal dentro de modal e preservar fluxo, validações, PMOC, PDF e WhatsApp.
- CP-D — Shell/sidebar/header/bottom nav: fazer estrutura fixa parecer estrutura fixa e reduzir visual de painel flutuante.
- CP-E — Clientes/Equipamentos/Detalhes: alinhar cards, painéis, detalhes, estados de risco e ações secundárias.
- CP-F — Modais reais, drawers, paywalls e estados vazios: diferenciar overlays reais de cards comuns e padronizar bloqueios/upsells.
- CP-G — Copy visual e microtextos: refinar linguagem depois da hierarquia.
- CP-H — Fechamento documental da Mudança 21: registrar decisões, validações visuais e riscos remanescentes.

## 9. Riscos e pontos de atenção

- CSS legado extenso: `components.css` concentra muitas famílias (`dash-*`, `equip-*`, `eq-*`, `hist-*`, `rel-*`, `registro-*`, `cli-*`, `orc-*`, `alert-*`, `pmoc-*`, `upgrade-*`).
- `redesign.css`, `tokens.css`, `theme-premium.css` e parciais podem sobrepor regras e criar regressões visuais inesperadas.
- React e legado convivem em várias telas; mudanças visuais podem afetar islands React e templates legados ao mesmo tempo.
- Mobile é risco alto: bottom nav, sheets, modais grandes e filtros podem quebrar com pequenas mudanças globais.
- Testes podem depender de IDs, classes, `data-action`, `data-nav` e estrutura DOM. Não alterar contratos públicos sem CP dedicado.
- PDF/share, PMOC runtime, monetização e Supabase são áreas sensíveis e não devem ser misturadas ao redesign.
- Modais densos como detalhe de equipamento, cadastro de equipamento, PMOC e PDF preview exigem validação visual real.
- Se o CP futuro mexer em CSS global demais, a chance de regressão cresce.
- Se tudo for achatado visualmente, o app perde hierarquia operacional.
- Se todos os cards receberem borda/sombra/radius semelhantes, o problema de superfície concorrente permanece.

## 10. Critérios de pronto da CP-A

- Apenas este documento criado.
- Nenhuma mudança funcional.
- Nenhuma alteração em `src/`, CSS, testes, configs, Supabase/RLS/migrations, PDF/share, PMOC runtime, monetização, `package.json` ou `package-lock.json`.
- Hierarquia visual atual mapeada.
- Registro documentado como caso crítico.
- Plano CP-B a CP-H definido.
- Validações obrigatórias para encerramento:
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - `git diff --check`
