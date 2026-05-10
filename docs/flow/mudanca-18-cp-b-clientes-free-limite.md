# Mudanca 18 / CP-B - Clientes Free com limite

## Objetivo

Permitir que Clientes seja acessivel no plano Free e limitar somente a criacao: Free pode criar 1 cliente; ao tentar criar o segundo, o app bloqueia a acao e abre upgrade com Plus como CTA principal.

## Arquivos alterados

- `src/core/plans/subscriptionPlans.js`
- `src/core/plans/clientesAccess.js`
- `src/core/planLimits.js`
- `src/ui/controller/routes.js`
- `src/ui/components/clienteModal.js`
- `src/ui/components/clientesPaywallModal.js`
- `src/ui/shell.js`
- `src/__tests__/clientesAccess.test.js`
- `src/__tests__/clientesRouteAccess.test.js`
- `src/__tests__/clienteModalLimit.test.js`
- `src/__tests__/clientesPaywallModal.test.js`
- `src/__tests__/shell.test.js`

## Contratos novos

- A rota `clientes` renderiza para Free, Plus e Pro.
- `canAccessClientes(planCode)` deixa de representar paywall Pro-only e passa a permitir acesso a rota.
- `canCreateCliente()` centraliza a regra pura de criacao:
  - Free: permite criar quando `currentClientesCount < 1`.
  - Free com 1 cliente: bloqueia nova criacao e recomenda Plus.
  - Plus: limite de 50 clientes no catalogo.
  - Pro: clientes ilimitados no catalogo.
  - Edicao de cliente existente continua permitida no Free.
- O bloqueio de limite acontece antes de abrir o modal de criacao e tambem antes de salvar um novo cliente, como defesa contra estado alterado durante o formulario.
- O paywall de limite aponta para `pricing` com `highlightPlan: 'plus'`.

## Testes alterados

- `clientesAccess.test.js`: troca o contrato Pro-only por acesso de rota permitido e adiciona cobertura do limite de criacao.
- `clientesRouteAccess.test.js`: remove expectativa de paywall na entrada da rota e espera renderizacao no Free.
- `clienteModalLimit.test.js`: cobre criacao permitida no Free com 0 cliente, bloqueio do segundo cliente e edicao permitida.
- `clientesPaywallModal.test.js`: cobre CTA Plus no paywall de limite.
- `shell.test.js`: preserva bottom nav legado sem Clientes no Free, mas atualiza o atalho de Clientes para refletir acesso liberado.

## Riscos remanescentes

- A navegacao mobile completa ainda nao foi ajustada para a ordem decidida; fica para CP-C.
- O shell ainda contem `navigationMode`; remocao/ajuste amplo fica para CP-C.
- Cliente -> Setores -> Equipamentos continua com o fluxo antigo; fica para CP-D.
- O fluxo de Registro nao foi alterado; fica para CP-E.
- O limite de clientes e aplicado no cliente web. Nao houve alteracao de schema, RLS, Edge Functions ou Supabase nesta CP.

## Proximos CPs

- CP-C: ajustar navegacao mobile/desktop sem hard paywall de Clientes.
- CP-D: desacoplar Cliente -> Setores e mostrar equipamentos direto quando aplicavel.
- CP-E: criar orquestrador unico de Registrar servico.
