# Mudança 18 / CP-C — Navegação mobile/desktop

## Objetivo

Alinhar a navegação principal do CoolTrack Pro à direção de produto definida na Mudança 18: operação de campo para técnico autônomo, com dois pontos de partida flexíveis:

- registrar serviço;
- organizar clientes.

Esta CP não altera rotas, fluxo de registro, Cliente -> Setores -> Equipamentos, PDF/share, planos pagos, segurança, Supabase, migrations ou dependências.

## Estado inicial

- Branch inicial: `main`
- HEAD inicial: `a45308aab428748f8f8cf5fab82a69cf17748b4e`
- Working tree inicial: limpo
- Base anterior: CP-B concluída com Clientes acessível no Free/Plus/Pro e limite de 1 cliente no Free.

## Arquivos alterados

- `src/ui/shell/templates/nav.js`
- `src/ui/shell/templates/sidebar.js`
- `src/ui/shell.js`
- `src/ui/shell/navigationMode.js`
- `src/__tests__/shell.test.js`
- `src/__tests__/navigationMode.test.js`
- `docs/flow/mudanca-18-cp-c-navegacao-mobile-desktop.md`

## Novo contrato da bottom nav

O bottom nav mobile passa a renderizar sempre, para Free/Plus/Pro, nesta ordem:

1. `Painel` (`data-nav="inicio"`, `id="nav-inicio"`)
2. `Clientes` (`data-nav="clientes"`, `id="nav-clientes"`)
3. `Registrar` (`data-nav="registro"`, `id="nav-registro"`)
4. `Equip.` (`data-nav="equipamentos"`, `id="nav-equipamentos"`)
5. `Serviços` (`data-nav="historico"`, `id="nav-historico"`)

O item `Registrar` continua com o mesmo destino atual. Esta CP não cria orquestrador novo de registro.

## Novo contrato da sidebar

A sidebar desktop deixa de usar o agrupamento antigo `OPERAÇÃO / GESTÃO / SISTEMA` e passa a usar intenção:

- `Principal`: Painel, Registrar serviço
- `Organização`: Clientes, Equipamentos
- `Histórico`: Serviços, Relatórios
- `Sistema`: Alertas, Orçamentos

Os itens de conta, configurações e planos permanecem no footer existente da sidebar:

- `Conta`: chip do usuário (`data-nav="conta"`)
- `Configurações`: botão de configurações (`data-nav="configuracoes"`)
- `Planos`: card/CTA de plano (`data-nav="pricing"`)

Clientes é item normal da sidebar. O indicador visual de bloqueio Pro foi removido da marcação.

## Decisão sobre navigationMode

`navigationMode` continua existindo para compatibilidade com preferências antigas em `localStorage` e eventos existentes.

Nesta CP, ele ficou inócuo para a navegação principal:

- `rapido` e `empresa` retornam o mesmo layout;
- Clientes não é mais removido do bottom nav por plano;
- Clientes não é mais rebaixado para navegação secundária;
- o shell ainda aceita a preferência legada sem quebrar usuários existentes.

Dashboard e telas que ainda leem `navigationMode` não foram refatorados nesta CP.

## Testes alterados

- `src/__tests__/shell.test.js`
  - passou a validar a ordem `Painel | Clientes | Registrar | Equip. | Serviços`;
  - passou a validar Clientes visível no Free, Plus e Pro;
  - passou a validar sidebar por intenção e ausência do grupo `GESTÃO`;
  - passou a validar ausência do lock visual de Clientes.
- `src/__tests__/navigationMode.test.js`
  - passou a validar que `rapido` e `empresa` mantêm o mesmo layout principal;
  - manteve contratos de persistência/fallback da preferência legada.

## Validação executada

- `npm run test -- src/__tests__/shell.test.js src/__tests__/navigationMode.test.js`: passou, 12 testes.
- `npm run format`: passou; alterações restritas aos arquivos da CP-C.
- `npm run build`: passou com warnings Vite conhecidos de static/dynamic imports e chunk size.
- `npm run check`: passou com 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js`.
- `git diff --check`: passou.

## Riscos remanescentes

- A preferência legada `cooltrack_nav_mode` ainda existe para compatibilidade; limpeza total deve ficar para CP futura, se necessário.
- Conta, Configurações e Planos permanecem no footer por aderência à estrutura atual da sidebar; mover para uma seção única exigiria ajuste visual mais amplo.
- Dashboard ainda pode usar `navigationMode` para contexto de conteúdo, mas a navegação principal não depende mais dele.

## Próximas CPs

- CP-D: desacoplar Cliente -> Setores -> Equipamentos.
- CP-E: orquestrador único de Registrar serviço.
- CP-F: onboarding, se ainda fizer sentido após CP-D/CP-E.
- CP-G: monetização de PDF/cotas, somente depois.
