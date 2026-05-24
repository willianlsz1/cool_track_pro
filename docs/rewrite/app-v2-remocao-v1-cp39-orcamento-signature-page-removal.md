# app-v2 - Remocao v1 CP39: pagina orfa de assinatura de orcamento

## Objetivo

Remover um componente legado sem consumidor runtime, tratando assinatura de
orcamento como area sensivel e mantendo fora do escopo os helpers reais de
token, RPC, storage, PDF/share, WhatsApp, Supabase/RLS e orcamento real.

## Diagnostico

Comandos usados:

```bash
rg -n "orcamentoSignaturePage|SignaturePage|assinatura.*or[cç]amento|orcamento.*assinatura|OrcamentoSignature|signature page|assinatura" src docs e2e index.html vite.config.js
rg -n "orc-sign|OrcamentoSignaturePage|fetchOrcamentoByToken|signOrcamentoByToken|share_token|sign_orcamento_by_token|orcamento.*token|token.*orcamento" src index.html public docs/rewrite docs/architecture e2e vite.config.js
```

Resultado:

- `src/ui/components/orcamentoSignaturePage.js` exportava
  `OrcamentoSignaturePage`, mas nao havia import do arquivo em `src`, `e2e`,
  `index.html`, `public` ou `vite.config.js`.
- O proprio comentario do arquivo dizia depender de boot por
  `?orc-sign=TOKEN`, mas nenhum bootstrap atual chama
  `OrcamentoSignaturePage.mount(token)`.
- O fluxo conceitual de token ainda aparece em `src/core/orcamentos.js` e
  `src/ui/controller/handlers/orcamentoHandlers.js`; esses pontos foram
  preservados por envolverem orcamento/assinatura real.

## Alteracao

- Removido `src/ui/components/orcamentoSignaturePage.js`.
- Atualizado `legacyShellRetirementGate.test.js` para impedir retorno do arquivo
  orfao.
- Atualizados comentarios em `src/core/orcamentos.js` para deixar claro que a
  antiga view standalone v1 foi removida e que os helpers de token ficam
  reservados para uma futura pagina publica dedicada.
- Atualizado o plano de remocao v1 com a contagem `src/ui` em 148 arquivos.

## Fora do escopo

- Remover ou alterar `fetchOrcamentoByToken`, `signOrcamentoByToken`,
  `share_token`, RPCs ou links `?orc-sign=`.
- Implementar nova assinatura de orcamento no app-v2.
- Alterar PDF/share, WhatsApp, Supabase/RLS, storage, billing, PMOC,
  permissoes ou orcamento real.

## Validacao planejada

```bash
npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/legacyV1RemovalContracts.test.js src/__tests__/billingPricingCleanupContracts.test.js --run
npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run
npm run format
npm run build
npm run check
git diff --check
```
