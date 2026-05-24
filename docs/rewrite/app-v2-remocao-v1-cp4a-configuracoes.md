# App-v2 remocao v1 - CP-4a Configuracoes legado

## Escopo

Remover a tela legado/v1 `configuracoes` depois que a area `Conta` do app-v2 ja
cobre o papel operacional local aprovado para preferencias e atalhos.

## Alterado

- Removida a view `src/ui/views/configuracoes.js`.
- Removida a rota `configuracoes` do router legado.
- Removido o container `#view-configuracoes` do shell.
- Removidos estilos dedicados `_configuracoes.css` e overrides em
  `redesign.css`.
- Header e sidebar passaram a abrir diretamente o menu de ajuda operacional com
  `data-action="toggle-help-menu"`, sem navegar para uma tela de configuracoes.
- Testes de rota, header e a11y foram atualizados para o novo contrato.
- Adicionado contrato `legacyV1RemovalContracts` para bloquear retorno da view,
  rota e CSS dedicados.

## Fora do escopo

- Router/deep links.
- App-v2 runtime.
- Storage, Supabase/RLS, PDF/share, WhatsApp, billing, assinatura ou PMOC real.
- Redesign visual amplo.

## Validacao

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contracts/routes.test.js src/__tests__/globalHeaderContracts.test.js src/__tests__/clientesRouteAccess.test.js src/__tests__/historicoRegistroIntegration.contract.test.js --run`
