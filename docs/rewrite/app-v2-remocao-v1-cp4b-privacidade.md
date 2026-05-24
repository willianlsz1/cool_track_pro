# App-v2 remocao v1 - CP-4b Privacidade interna legado

## Escopo

Remover a tela interna legado/v1 `privacidade` do shell antigo, preservando as
paginas legais publicas em `public/legal/`.

## Alterado

- Removida a view `src/ui/views/privacidade.js`.
- Removida a rota interna `privacidade` do router legado.
- Removido o container `#view-privacidade` do shell.
- O atalho de privacidade em `Conta` passou a abrir
  `/legal/privacidade.html`, que e a superficie publica preservada.
- Testes de rota e mocks legados foram atualizados.
- `legacyV1RemovalContracts` passou a bloquear o retorno da view/rota interna.

## Fora do escopo

- Alterar `public/legal/privacidade.html`, `termos.html` ou `lgpd.html`.
- Alterar legal/SEO/CSP.
- Alterar app-v2, storage, Supabase/RLS, billing, PDF/share, WhatsApp,
  assinatura ou PMOC real.

## Validacao

- `npm test -- src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/contracts/routes.test.js src/__tests__/clientesRouteAccess.test.js src/__tests__/equipamentosRouteLifecycle.test.js src/__tests__/registroRouteLifecycle.test.js src/__tests__/historicoRegistroIntegration.contract.test.js --run`
