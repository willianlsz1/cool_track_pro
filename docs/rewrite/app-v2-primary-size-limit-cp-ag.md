# app-v2 - CP-AG - Ajuste do bundle-size para entrypoint principal

## Objetivo

Corrigir a validacao externa de Bundle Size do PR do app-v2 sem alterar runtime,
PDF/share, `manualChunks`, storage, router, Supabase/RLS, billing ou o legado/v1.

## Diagnostico

O PR `app-v2 primary cutover readiness` disparou o workflow `Bundle Size` e o
job `size-limit` falhou com:

```text
Size Limit can't find files at dist/assets/vendor-pdf.*.js
```

O build atual do app-v2 como entrypoint principal emite:

- `dist/assets/index.*.js`
- `dist/assets/vendor-supabase.*.js`
- `dist/assets/*.css`

Como o app-v2 principal nao referencia o fluxo legado de PDF, o chunk
`vendor-pdf.*.js` nao e emitido. A falha era de contrato de medicao obsoleto,
nao de excesso de bundle.

## Mudanca

`Vendor PDF` em `.size-limit.json` foi substituido por `Vendor Supabase`, usando
o chunk vendor que o app-v2 realmente emite hoje.

## Fora de escopo

- Alterar `vite.config.js`.
- Alterar `manualChunks`.
- Tocar em `src/domain/pdf/shareReport.js` ou qualquer fluxo de PDF/share.
- Reintroduzir PDF no app-v2 para satisfazer a checagem.
- Alterar `package.json`, `package-lock.json`, workflows ou dependencias.

## Validacao esperada

- `npm run size`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

## Risco remanescente

O app-v2 ainda nao valida PDF/share real como parte do cutover. Isso permanece
fora desta CP e deve continuar como etapa sensivel dedicada.
