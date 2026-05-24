# app-v2 - CP24 remocao do offline banner legado orfao

## Objetivo

Remover o banner fixo legado de estado offline que nao era mais montado pelo
runtime principal.

## Diagnostico

Comandos usados:

```bash
rg -n "mountOfflineBanner|OfflineBanner|cooltrack-offline-banner|has-offline-banner|offline-banner" src e2e index.html vite.config.js docs/rewrite
rg -n "ONLINE_STATUS_EVENT|cooltrack:online-status" src/core src/ui src/__tests__
```

Resultado:

- `src/ui/components/offlineBanner.js` nao tinha import nem chamada de
  `mountOfflineBanner` em runtime principal, app-v2, e2e ou configuracao.
- As referencias restantes eram o proprio componente, CSS dedicado em
  `src/assets/styles/components.css` e documentacao de planejamento.
- `src/core/onlineStatus.js` continua preservado porque emite estado de rede e
  pode seguir atendendo outros consumidores/toasts.

## Arquivos alterados

- Removido: `src/ui/components/offlineBanner.js`
- Atualizado: `src/assets/styles/components.css`
- Atualizado: `src/__tests__/legacyShellRetirementGate.test.js`
- Atualizado: `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## Fora de escopo

- `src/core/onlineStatus.js`
- Toasts/transientes de status online/offline.
- Storage/offline sync real, Supabase/RLS, PDF/share, WhatsApp, PMOC,
  assinatura e orcamento real.

## Validacao esperada

- `npm test -- src/__tests__/legacyShellRetirementGate.test.js src/__tests__/billingPricingCleanupContracts.test.js --run`
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx src/app-v2/shell/AppV2ShellDataPort.test.tsx --run`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`
- `git diff --cached --check`
