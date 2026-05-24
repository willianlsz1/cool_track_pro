# app-v2 - Remocao v1 CP-9t: lifecycle de Registro

## Objetivo

Remover os helpers de lifecycle de Registro de `src/features/registro/**` e
co-localizar esse recorte puro com a view legada de Registro, sem tocar em
storage real, PDF/share, WhatsApp, assinatura ou PMOC.

## Escopo executado

- Movido `src/features/registro/lifecycle/helpers.js` para
  `src/ui/views/registro/lifecycle/helpers.js`.
- Movido o teste correspondente para
  `src/__tests__/registroLifecycleHelpers.test.js`.
- Atualizado o import em `src/ui/views/registro.js`.
- Adicionado contrato para impedir retorno de
  `src/features/registro/lifecycle`.

## Fora de escopo

- Nao foram alterados payload, persistencia, fotos, assinatura, checklist PMOC,
  PDF/share, WhatsApp, storage real, auth, Supabase/RLS, billing ou pricing.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/registroLifecycleHelpers.test.js src/__tests__/registroLifecycle.contract.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

O subgrupo `checklist` foi tratado depois no CP-9u. Os proximos subgrupos de
`src/features/registro/**` ficam em `save` e cruzam payload, persistencia,
fotos, assinatura, relatorio e share.
