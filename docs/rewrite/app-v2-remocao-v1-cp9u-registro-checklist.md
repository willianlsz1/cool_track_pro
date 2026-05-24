# app-v2 - Remocao v1 CP-9u: checklist PMOC de Registro

## Objetivo

Remover os helpers de checklist PMOC de Registro de `src/features/registro/**`
e co-localizar esse recorte puro com a view legada de Registro, sem tocar em
payload, persistencia, fotos, assinatura, PDF/share ou storage real.

## Escopo executado

- Movido `src/features/registro/checklist/pmocChecklist.js` para
  `src/ui/views/registro/checklist/pmocChecklist.js`.
- Movido o teste correspondente para
  `src/__tests__/registroPmocChecklistHelpers.test.js`.
- Atualizado o import em `src/ui/views/registro.js`.
- Adicionado contrato para impedir retorno de
  `src/features/registro/checklist`.

## Fora de escopo

- Nao foram alterados payload, persistencia, fotos, assinatura, PDF/share,
  WhatsApp, storage real, auth, Supabase/RLS, billing ou pricing.
- Nao foram alterados IDs, `data-action`, `data-nav`, schemas ou payloads
  persistidos.

## Validacao esperada

```bash
npm test -- src/__tests__/registroPmocChecklistHelpers.test.js src/__tests__/registroChecklistPmoc.contract.test.js src/__tests__/registroLegacyChecklistRender.test.js src/__tests__/registroPostSaveLegacyFlow.test.js src/__tests__/legacyV1RemovalContracts.test.js --run
npm run format
npm run build
npm run check
git diff --check
git diff --cached --check
```

## Proximo risco

Restam `src/features/registro/save/**` e `src/features/userData.js`.
`registro/save` deve ser tratado em subgrupos pequenos porque cruza payload,
persistencia, fotos, assinatura, relatorio e share. `userData.js` permanece
sensivel por envolver auth, LGPD e Edge Functions.
