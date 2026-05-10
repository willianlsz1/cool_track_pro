# Mudança 21 / CP-B — Contrato visual de superfícies

## 1. Estado inicial

- Branch observada: `main`
- HEAD observado no início da CP-B: `8534e6c2c7ad9e826a7471718a627e5d129a61ff`
- Commit observado no HEAD: `roadmap`
- Working tree observado no início: limpo.
- Documento-base da CP-A: `docs/design/mudanca-21-cp-a-auditoria-superficies-modais.md`
- Documento de identidade visual clara: `docs/design/mudanca-21-cp-a-identidade-visual-clara-dashboard.md`

Observação de escopo: o prompt da CP-B informava que o documento de identidade visual clara estava não rastreado e fora do escopo. No estado local observado, esse arquivo já está rastreado no HEAD atual. Ele foi lido apenas como insumo futuro e não deve ser usado como implementação nesta CP-B.

Esta CP-B é documental/planejamento. Não altera `src/`, CSS, testes, configs, Supabase/RLS/migrations, PDF/share, PMOC runtime, monetização, dependências, tema claro, React Doctor ou O.S/chamados.

## 2. Objetivo

Transformar a auditoria da CP-A em um contrato visual aplicável ao app inteiro antes de qualquer implementação visual ampla.

O foco desta CP-B é hierarquia, não paleta. A identidade azul/branco clara pode informar decisões futuras, mas a correção estrutural deve vir antes de troca de tema, tokens ou CSS.

## 3. Princípios gerais

- Página é área de trabalho, não card flutuante.
- Sidebar, header e bottom nav são estrutura fixa, não conteúdo principal.
- Seção organiza conteúdo com baixo contraste.
- Card é pequeno, repetível e subordinado à página.
- Painel é exceção para bloco funcional persistente, não padrão para qualquer agrupamento.
- Modal é overlay temporário bloqueante e deve parecer superior à página.
- Drawer/sheet é overlay auxiliar para escolha, filtro ou tarefa curta.
- Popover/dropdown é compacto, contextual e descartável.
- Estado vazio orienta a próxima ação sem parecer bloqueio comercial.
- Paywall comunica bloqueio/upgrade e não deve parecer card comum.
- Um contexto deve ter uma ação primária clara.
- Ações secundárias não devem competir visualmente com CTA principal.
- Evitar caixa dentro de caixa como solução padrão de agrupamento.
- Hierarquia deve combinar posição, largura, espaçamento, fundo, borda, sombra, radius e densidade.

## 4. Tipos oficiais de superfície

### Página

Área principal da rota. Deve conter título, contexto curto, CTA principal quando aplicável e conteúdo de trabalho. Usa largura de aplicação e ritmo operacional, sem parecer modal centralizado.

Uso esperado:

- Dashboard, Registro, Clientes, Equipamentos, Histórico, Relatórios, Pricing, Conta, Configurações, Alertas e Orçamentos.
- Fluxos longos com múltiplas seções.
- Formulários principais que o técnico usa como tarefa de trabalho.

Evitar:

- Fundo branco com sombra forte e largura estreita como se fosse modal.
- Centralizar toda a rota como um card único.
- Usar cabeçalho de modal para página.

### Seção

Divisão interna da página. Deve separar assunto, etapa ou grupo funcional sem virar overlay.

Uso esperado:

- "Dados do atendimento" no Registro.
- Filtros e resultados em listas.
- Blocos de análise no Dashboard.
- Áreas de PMOC contextual dentro de uma página.

Evitar:

- Sombra forte.
- Bordas grossas.
- Radius e fundo idênticos aos de modal.
- Seções auxiliares antes da tarefa principal quando não são pré-requisito.

### Card

Agrupamento pequeno, repetível e escaneável. O card representa uma unidade, não a página.

Uso esperado:

- Cliente.
- Equipamento.
- Alerta.
- Orçamento.
- KPI.
- Item de histórico.
- Resumo curto.

Evitar:

- Card contendo outro card pesado.
- Card com CTA e superfície fortes o suficiente para competir com a página.
- Card como solução para todo espaçamento.

### Painel

Bloco funcional persistente dentro da página. É mais forte que seção e mais fraco que modal.

Uso esperado:

- Painel de contexto ativo.
- Painel PMOC contextual.
- Painel de filtros persistentes em desktop.
- Painel auxiliar que fica visível enquanto a página continua sendo a área principal.

Evitar:

- Transformar toda seção em painel.
- Usar painel dentro de card.
- Usar painel para fluxos temporários que deveriam ser sheet/drawer/modal.

### Modal

Overlay temporário e bloqueante. Deve interromper a página para decisão ou tarefa curta.

Uso esperado:

- Confirmação destrutiva.
- Cadastro curto.
- Edição pontual.
- Preview bloqueante.
- Decisão crítica.

Evitar:

- Tela longa que funciona como página.
- Modal abrindo outro modal, salvo exceção crítica de confirmação.
- Modal com navegação complexa, múltiplas seções longas e rodapé de página.
- Modal que tem o mesmo fundo, radius, borda e sombra dos cards comuns.

### Drawer/sheet

Overlay temporário lateral ou inferior. Deve ajudar a escolher, filtrar ou completar tarefa curta sem transformar a rota.

Uso esperado:

- Filtros mobile.
- Picker de equipamento.
- Escolha de cliente/setor.
- Ações auxiliares e rápidas.

Evitar:

- Formulário longo.
- Fluxo multi-etapa.
- Conteúdo que precisa virar página.

### Popover/dropdown

Superfície compacta, ancorada e descartável.

Uso esperado:

- Menu de opções.
- Kebab de card.
- Ações contextuais.
- Lista curta de escolhas.

Evitar:

- Painel administrativo.
- Atalhos de várias áreas do app em um único dropdown.
- Conteúdo promocional pesado.

### Sidebar

Estrutura fixa de navegação desktop. Deve parecer parte do shell e não um card/painel.

Uso esperado:

- Navegação principal.
- Agrupamento de rotas.
- Status discreto.
- Acesso secundário a conta/configurações.

Evitar:

- Plan card com peso de conteúdo principal.
- User chip com aparência de card grande.
- Múltiplos blocos promocionais.
- Sombra/radius que façam a sidebar parecer modal lateral permanente.

### Overlay

Camada temporária que separa página e superfície ativa.

Uso esperado:

- Modal.
- Sheet.
- Drawer.
- Lightbox.
- Paywall bloqueante.

Evitar:

- Overlay invisível que não deixa claro que a página está inativa.
- Mesmo tratamento visual para modal, popover e toast.

### Toast

Feedback transitório e leve.

Uso esperado:

- Sucesso.
- Aviso curto.
- Erro recuperável.
- Link opcional simples.

Evitar:

- Decisão complexa.
- Confirmação destrutiva.
- Múltiplas ações equivalentes.

### Estado vazio

Estado informativo de lista ou página sem dados.

Uso esperado:

- Explicar o que falta.
- Indicar próxima ação.
- Mostrar CTA quando a ação é realmente o próximo passo.

Evitar:

- Aparência de paywall por padrão.
- Ilustração/hero dominante quando o usuário precisa operar rápido.
- Texto longo de marketing.

### Paywall

Bloqueio ou orientação de upgrade.

Uso esperado:

- Recurso indisponível por plano.
- Cota atingida.
- Upsell contextual ligado à ação tentada.

Evitar:

- Parecer estado vazio comum.
- Misturar muitos planos e recursos no mesmo card.
- CTA secundário competindo com upgrade principal.

### CTA primário/secundário

Ação primária é o próximo passo principal daquele contexto. Ação secundária é suporte.

Uso esperado:

- Uma ação primária por página, seção ou overlay.
- Secundárias com menor peso visual.
- Destrutivas separadas e reconhecíveis.

Evitar:

- Vários botões fortes no mesmo bloco.
- Tiles auxiliares competindo com o formulário principal.
- CTA promocional mais forte que tarefa operacional.

## 5. Regras de composição

- Página pode conter seções.
- Página pode conter cards repetíveis.
- Página pode conter um painel persistente quando há contexto funcional claro.
- Seção pode conter cards pequenos.
- Seção pode conter formulário, lista, tabela ou resumo.
- Card pode conter microblocos leves, mas não outro card pesado.
- Painel pode conter seções leves, mas não deve virar página embutida.
- Modal pode conter formulário curto, confirmação ou preview.
- Modal não deve conter outro modal, salvo confirmação crítica e explícita.
- Drawer/sheet pode conter lista, filtro ou escolha curta.
- Drawer/sheet não deve conter formulário longo.
- Popover/dropdown deve conter lista curta e ações contextuais.
- Sidebar não deve conter cards com peso de conteúdo principal.
- Estado vazio não deve conter paywall disfarçado.
- Paywall não deve parecer card comum.
- Toast não deve carregar decisão complexa.
- CTA primário não deve competir com tiles de ação rápida.
- Seção auxiliar não deve aparecer antes da tarefa principal se ela não for pré-requisito.

## 6. Níveis de estilo

Os valores finais de cor ficam fora desta CP-B. O contrato abaixo define intenção de hierarquia.

| Superfície       | Fundo                   | Borda             | Sombra            | Radius          | Espaçamento         | Largura          | Densidade            | Cabeçalho             | CTA                   | Mobile                            |
| ---------------- | ----------------------- | ----------------- | ----------------- | --------------- | ------------------- | ---------------- | -------------------- | --------------------- | --------------------- | --------------------------------- |
| Página           | Global ou quase global  | Nenhuma ou mínima | Nenhuma           | Nenhum ou baixo | Amplo e consistente | Fluida de app    | Operacional          | Título claro          | 1 primário            | Ocupa tela, sem card central      |
| Seção            | Baixo contraste         | Opcional sutil    | Nenhuma           | Baixo           | Médio               | Segue página     | Escaneável           | Label/título discreto | Secundário se houver  | Empilha sem virar card pesado     |
| Card             | Superfície leve         | Sutil             | Baixa ou nenhuma  | Baixo/médio     | Interno compacto    | Repetível        | Alta leitura         | Curto                 | Contextual            | Toque confortável                 |
| Painel           | Mais presente que seção | Clara             | Baixa             | Médio           | Médio               | Persistente      | Média                | Explicativo           | Contextual            | Pode virar sheet se temporário    |
| Modal            | Elevado                 | Clara             | Alta              | Médio           | Controlado          | Limitada         | Foco na tarefa       | Forte                 | 1 primário            | Sheet/fullscreen só se necessário |
| Drawer/sheet     | Elevado                 | Clara             | Alta              | Médio/alto      | Controlado          | Lateral/inferior | Curta                | Direto                | 1 primário ou aplicar | Preferência para bottom sheet     |
| Popover/dropdown | Elevado compacto        | Sutil             | Média             | Médio           | Compacto            | Ancorada         | Alta                 | Opcional              | Ação curta            | Evitar conteúdo extenso           |
| Sidebar          | Estrutural              | Divisória leve    | Nenhuma ou mínima | Nenhum/baixo    | Compacto            | Fixa             | Navegação            | Grupos curtos         | Marketing subordinado | Oculta no mobile                  |
| Overlay          | Semitransparente        | N/A               | N/A               | N/A             | N/A                 | Tela toda        | Bloqueante           | N/A                   | N/A                   | Deve deixar camada clara          |
| Toast            | Elevado leve            | Sutil             | Média             | Médio           | Compacto            | Conteúdo         | Transitória          | Não precisa           | Ação simples          | Não cobrir navegação crítica      |
| Estado vazio     | Leve                    | Opcional          | Nenhuma           | Baixo/médio     | Médio               | No contexto      | Orientativa          | Claro                 | Próxima ação          | Sem hero excessivo                |
| Paywall          | Distinto                | Clara             | Média             | Médio           | Médio               | Contextual       | Comercial controlada | Bloqueio claro        | Upgrade principal     | Direto, sem tabela longa          |

Regras adicionais:

- Fundo forte deve ser reservado para overlay, modal ou destaque real.
- Borda deve separar; não deve ser usada para criar múltiplas caixas equivalentes.
- Sombra deve indicar elevação temporária ou interação, não todo agrupamento.
- Radius alto tende a aproximar de modal/card; usar com critério em páginas e seções.
- Largura estreita e centralizada comunica modal; evitar em páginas de trabalho.
- Densidade deve favorecer técnico em campo: leitura rápida, ações claras e pouca ornamentação.

## 7. Contrato específico para Registro

A CP-C deve aplicar este contrato primeiro no Registro.

Direção:

- Registro deve virar página de trabalho.
- O container principal deve perder aparência de modal central.
- "Novo registro" deve ser cabeçalho/estado da página, não submodal.
- Progresso deve ser elemento persistente da página.
- "Dados do atendimento" deve ser o núcleo visual e vir antes de auxiliares que não são pré-requisitos.
- Foto deve ser atalho auxiliar útil, não card dominante.
- Ações rápidas devem ser seção auxiliar subordinada ao formulário.
- Seções opcionais devem ter baixo contraste e hierarquia clara.
- Picker de equipamento, fork de cliente, assinatura, PMOC, confirmação e upgrade devem permanecer overlays reais de Nível 4.

Limites da CP-C:

- Não alterar fluxo funcional.
- Não alterar validações.
- Não alterar PMOC runtime.
- Não alterar PDF/share ou WhatsApp.
- Não alterar contratos `data-action`, `data-nav`, IDs ou selectors públicos sem justificativa e testes.

Critério visual esperado:

- O usuário deve sentir que está numa tela de trabalho rápida.
- Um modal real aberto sobre Registro deve parecer claramente superior à página.
- Ações auxiliares devem ajudar sem disputar prioridade com o salvamento/registro.

## 8. Contrato para shell/sidebar

A CP-D deve aplicar este contrato ao shell.

Sidebar desktop:

- Deve ser Nível 0.
- Deve parecer fixa, estrutural e previsível.
- Navegação deve dominar.
- Plan card, sync, user chip e settings devem ter peso secundário.
- Marketing/upgrade dentro da sidebar deve ser discreto.
- Item "Registrar" pode continuar destacado, mas sem parecer card promocional.

Header/topbar:

- Deve manter ações globais úteis.
- Menus ancorados devem ser compactos.
- O `header-help-menu` não deve virar painel administrativo com muitas áreas misturadas.
- Conta/configurações persistentes devem preferir rota/página quando forem conteúdo longo.

Bottom nav mobile:

- Deve ser estrutura fixa.
- O botão central de Registro deve comunicar ação principal do app sem parecer overlay avulso.
- Badges devem ser pequenos e funcionais.
- A navegação não deve competir com toasts ou sheets.

## 9. Contrato para overlays reais

A CP-F deve consolidar overlays.

Modal:

- Backdrop claro.
- Foco preso.
- Conteúdo curto ou decisão bloqueante.
- Rodapé com uma ação primária.
- Destrutiva separada.

Drawer/sheet:

- Ideal para filtros, pickers e ações auxiliares.
- No mobile, preferir bottom sheet para tarefas curtas.
- Em desktop, pode virar popover/drawer se a tarefa for compacta.

Popover/dropdown:

- Ancorado.
- Pequeno.
- Fácil de descartar.
- Sem navegação extensa.

Paywall:

- Deve ser distinguível de empty state e card comum.
- Deve explicar o bloqueio e o próximo passo.
- Deve ter CTA principal único.

Lightbox/preview:

- Deve suspender claramente a página.
- Não deve parecer card de conteúdo comum.
- Deve ter fechamento óbvio.

## 10. Plano CP-C até CP-H

- CP-C — Registro como página de trabalho: aplicar a hierarquia no fluxo mais crítico, preservando PMOC, PDF, WhatsApp, validações e contratos públicos.
- CP-D — Shell/sidebar/header/bottom nav: fazer estrutura fixa parecer estrutura fixa e reduzir peso de cards promocionais internos.
- CP-E — Clientes/Equipamentos/Detalhes: alinhar cards, painéis, detalhes, riscos, ações secundárias e listas operacionais.
- CP-F — Modais reais, drawers, paywalls e estados vazios: diferenciar overlay real de conteúdo de página e padronizar bloqueios/upsells.
- CP-G — Copy visual e microtextos: refinar linguagem depois da hierarquia visual.
- CP-H — Fechamento documental da Mudança 21: registrar decisões, validações visuais, riscos remanescentes e próximos CPs.

## 11. Riscos e pontos de atenção

- CSS global demais: alterar `components.css`, `layout.css`, `tokens.css`, `redesign.css` ou `theme-premium.css` de forma ampla pode gerar regressões cruzadas.
- Mobile: sheets, bottom nav, modais grandes, filtros e Registro podem quebrar com mudanças pequenas de espaçamento/largura.
- React + legado: várias telas combinam templates legados, ilhas React e CSS compartilhado.
- Contratos DOM: IDs, classes, `data-action`, `data-nav`, storage keys e selectors públicos não devem ser alterados sem CP dedicado.
- Tema claro cedo demais: aplicar azul/branco antes de resolver hierarquia pode apenas trocar a cor do problema.
- Interface plana demais: remover borda/sombra/radius sem nova hierarquia pode deixar tudo igual.
- Identidade visual misturada: paleta clara, premium, status, setores e planos devem ser tratados depois do contrato estrutural.
- PDF/share, PMOC runtime, monetização, Supabase/RLS e segurança continuam áreas sensíveis fora desta CP.
- Validação visual futura deve usar screenshots desktop/mobile e smoke tests quando houver implementação.

## 12. Critérios de pronto

- Apenas este documento criado.
- Nenhuma mudança funcional.
- Nenhuma alteração em `src/`, CSS, testes, configs, Supabase/RLS/migrations, PDF/share, PMOC runtime, monetização, `package.json` ou `package-lock.json`.
- Documento de identidade visual clara não alterado nesta CP-B.
- Contrato visual definido para página, seção, card, painel, modal, drawer/sheet, popover/dropdown, sidebar, overlay, toast, estado vazio, paywall e CTA.
- CP-C preparada para aplicar o contrato primeiro no Registro.
- Validações obrigatórias executadas:
  - `npm run format`
  - `npm run build`
  - `npm run check`
  - `git diff --check`
