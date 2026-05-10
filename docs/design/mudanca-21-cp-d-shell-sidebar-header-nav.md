# Mudança 21 / CP-D — Shell/sidebar/header/bottom nav

## 1. Objetivo

Aplicar o contrato visual de superfícies da CP-B ao shell do app, fazendo sidebar, header/topbar e bottom nav parecerem estrutura fixa de navegação em vez de painéis ou cards concorrendo com a página.

Esta CP-D é implementação visual controlada. Não altera fluxo funcional, rotas, handlers de navegação, Registro, PDF/share, WhatsApp, PMOC runtime, monetização, cota `pdf_export`, Supabase/RLS/migrations, segurança, dependências ou tema claro azul/branco.

## 2. Estado inicial

- Branch inicial: `main`
- HEAD inicial: `7b2dbb2b720023b47d94bd01b386f351c3112beb`
- Commit base: `refactor(design): improve registro desktop layout`
- Working tree inicial: limpo
- Documentos-base:
  - `docs/design/mudanca-21-cp-a-auditoria-superficies-modais.md`
  - `docs/design/mudanca-21-cp-b-contrato-visual-superficies.md`
  - `docs/design/mudanca-21-cp-c2-registro-desktop-layout.md`

## 3. Arquivos alterados

- `src/assets/styles/redesign.css`
- `docs/design/mudanca-21-cp-d-shell-sidebar-header-nav.md`

Não houve alteração em templates do shell, handlers, `src/ui/views/registro.js`, React do Registro, PDF/share, PMOC, Supabase, monetização, testes funcionais, configs ou dependências.

## 4. Comportamento visual anterior

- A sidebar desktop ainda comunicava painel lateral pela combinação de sombra, borda, fundos e blocos internos com peso próximo ao conteúdo.
- O plan card tinha peso visual alto demais para um elemento secundário dentro da navegação.
- Sync, user chip e configurações apareciam como blocos concorrentes no rodapé da sidebar.
- O header/topbar ainda tinha botões com aparência de componentes elevados.
- O bottom nav mobile tinha o botão central com leitura mais flutuante do que estrutural.

## 5. Comportamento visual novo

- Sidebar desktop foi rebaixada para estrutura fixa de Nível 0.
- Navegação passou a dominar a sidebar por contraste, item ativo claro e item "Registrar serviço" ainda reconhecível, mas sem aparência promocional pesada.
- Plan card, sync, user chip e configurações foram suavizados para peso secundário.
- Header/topbar ficou mais neutro, com borda sutil e botões menos elevados.
- Bottom nav mobile recebeu superfície mais estrutural e botão central com sombra menor e anel integrado ao nav.

## 6. Mudanças na sidebar

- Removida a sombra lateral pesada no override final do shell.
- Fundo da sidebar ficou mais estrutural e menos "card/painel".
- Itens de navegação usam hover e ativo sutis, com indicador lateral fino.
- Item "Registrar serviço" permanece destacado, mas como item de navegação, não como CTA promocional isolado.
- Plan card usa superfície neutra, borda sutil e CTA secundário.
- Sync pill perdeu brilho/pulso visual constante.
- User chip e configurações ficaram discretos, com hover leve.

Contratos preservados:

- `#sidenav-inicio`
- `#sidenav-registro`
- `#sidenav-clientes`
- `#sidenav-equipamentos`
- `#sidenav-historico`
- `#sidenav-relatorio`
- `#sidenav-alertas`
- `#sidenav-orcamentos`
- `#sidenav-plan-cta`
- `#sidenav-user-chip`
- `#sidenav-settings`
- `data-nav`

## 7. Mudanças no header/topbar

- Header recebeu superfície fixa mais neutra.
- Botões de ícone foram reduzidos em peso visual.
- Menu ancorado do header manteve comportamento existente, mas com superfície mais coerente com overlay compacto.
- Sync no header continua funcional em mobile/tablet; no desktop segue a regra existente de rebaixamento para a sidebar.

Contratos preservados:

- `#app-header`
- `#header-help-btn`
- `#header-help-menu`
- `#sync-status`
- `#header-alert-btn`
- `#header-avatar`

## 8. Mudanças no bottom nav

- Ordem preservada: Painel, Clientes, Registrar, Equip., Serviços.
- `#nav-registro` continua sendo a ação principal mobile com `data-action="start-service-registration"`.
- O botão central teve tamanho/sombra reduzidos e passou a parecer mais integrado ao nav.
- A superfície do nav ficou mais estrutural, com borda e sombra menos agressivas.

Observação: em screenshots locais, a barra DEV do ambiente de desenvolvimento pode sobrepor parcialmente o botão central. Isso não altera o contrato do bottom nav em produção.

## 9. O que foi preservado

- Rotas.
- Navigation handlers.
- `startServiceRegistration`.
- Registro e fluxo de salvamento.
- Clientes Free.
- PMOC/checklist funcional.
- PDF comum.
- PDF PMOC formal.
- WhatsApp/share.
- Pós-save.
- Cota `pdf_export`.
- Supabase/RLS/migrations.
- IDs, `data-nav`, `data-action` e selectors públicos.
- `package.json` e `package-lock.json`.

## 10. Testes executados

- `npm run test -- shell.test.js`
  - Resultado: passou, 1 arquivo / 6 testes.
- `npm run test -- serviceRegistrationEntry.test.js`
  - Resultado: passou, 1 arquivo / 3 testes.
- `npm run test -- navigationMode.test.js`
  - Resultado: passou, 1 arquivo / 6 testes.
- `npx playwright test e2e/specs/registro-visual-smoke.spec.js --config=e2e/playwright.config.js`
  - Resultado: passou, 1 teste.

## 11. Validação visual

Validação visual executada com Playwright e fixture autenticada:

- Dashboard desktop `1920x1080`: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-d-visual\shell-cp-d-dashboard-1920.png`
- Registro desktop `1920x1080`: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-d-visual\shell-cp-d-registro-1920.png`
- Mobile `390x844` com bottom nav: `C:\Users\KABUM\AppData\Local\Temp\cooltrack-cp-d-visual\shell-cp-d-mobile-nav-390.png`

Verificações:

- Desktop `1920x1080`: sidebar aparece como estrutura fixa e menos como painel flutuante.
- Desktop `1920x1080`: navegação domina a sidebar; plan card, usuário e configurações ficam subordinados.
- Registro desktop: shell não regrediu a hierarquia da CP-C.2.
- Mobile: bottom nav permanece em coluna mobile, com ordem e ação central preservadas.
- Overlay/picker de Registro não foi alterado nesta CP.

## 12. Riscos remanescentes

- `redesign.css` continua sendo arquivo de override amplo e já grande; a CP-D manteve o padrão existente para evitar mexer no pipeline CSS nesta etapa.
- A barra DEV local pode interferir visualmente em screenshots mobile; validar também em build/ambiente sem toolbar quando necessário.
- A sidebar ainda convive com estilos antigos em `components.css`, `layout.css`, `theme-premium.css` e `redesign.css`; consolidação estrutural deve ser CP própria.
- CP-D não redesenha páginas internas. Cards do Dashboard, Relatórios, Clientes e Equipamentos seguem para CPs futuras.

## 13. Próximo CP recomendado

CP-E — Clientes/Equipamentos/Detalhes: alinhar cards, painéis, detalhes, listas operacionais e ações secundárias ao contrato visual sem alterar fluxos funcionais.
