# Mudanca 19 / CP-E - Alinhamento de pricing com cota PDF

## Objetivo

Alinhar catalogo, pricing e textos comerciais ao contrato tecnico de PDF ja ativado nas CPs anteriores:

- Free: 1 PDF/mes.
- Plus: 50 PDFs/mes.
- Pro: PDFs sem limitacao relevante.

Esta CP nao altera runtime de cota, incremento de uso, geracao de PDF, WhatsApp/share ou pos-save.

## Estado inicial

- Branch: main
- HEAD inicial: 2da83178b76089a46e2b8fb82a8c10a49add5101
- Working tree inicial: limpo

## Arquivos alterados

- `src/core/plans/subscriptionPlans.js`
- `src/ui/views/pricing.js`
- `src/ui/components/upgradeNudge.js`
- `src/react/pages/landing/data/pricingData.js`
- `src/__tests__/pricing.test.js`
- `src/__tests__/subscriptionPlans.test.js`
- `src/__tests__/upgradeNudge.test.js`
- `src/__tests__/landingPageReact.test.jsx`
- `docs/monetization/mudanca-19-cp-e-pricing-pdf-quota-alignment.md`

## Textos e contratos alinhados

- Catalogo Free passou a comunicar `1 relatorio em PDF/mes com marca d'agua`.
- Catalogo Plus passou a comunicar `50 relatorios PDF/mes sem marca d'agua`.
- Catalogo Pro passou a comunicar PDF ilimitado e WhatsApp ilimitado como itens explicitos.
- Pricing legado passou a mostrar:
  - Free: `1 PDF/mes com marca d'agua`;
  - Plus: `50 PDFs/mes sem marca d'agua`;
  - Pro: `PDFs ilimitados`.
- Tabela comparativa de pricing passou a mostrar a cota de PDF por plano.
- Landing React passou a usar os mesmos limites de PDF.
- Upsell do dashboard passou a indicar `50 PDFs/mes` para Plus e `PDFs ilimitados` para Pro.

## Highlight e reasons

A tela de pricing agora reconhece os reasons de cota enviados pela CP-D:

- `pdf_quota_free`: mostra mensagem de limite de 1 PDF/mes no Free e destaca Plus.
- `pdf_quota_plus`: mostra mensagem de limite de 50 PDFs/mes no Plus e destaca Pro.
- `limit_reached`: comportamento legado preservado.

## Preservado

- Runtime de cota PDF criado na CP-C.
- Incremento de `pdf_export` apos exportacao bem-sucedida.
- Bloqueio de Free/Plus quando a cota e atingida.
- PDF sem cliente.
- WhatsApp/share separado de `pdf_export`.
- Marca d'agua do Free dentro da cota.
- Pos-save e edicao de registro.
- PDF/share, Supabase, migrations, seguranca, CSS amplo e dependencias.

## Testes alterados/adicionados

- `pricing.test.js`
  - valida Free com 1 PDF/mes, Plus com 50 PDFs/mes e Pro ilimitado;
  - valida `pdf_quota_free` destacando Plus;
  - valida `pdf_quota_plus` destacando Pro.
- `subscriptionPlans.test.js`
  - valida copy comercial do catalogo para Free/Plus/Pro.
- `upgradeNudge.test.js`
  - valida upsell de Plus com 50 PDFs/mes;
  - valida upsell de Pro com PDFs ilimitados e WhatsApp ilimitado.
- `landingPageReact.test.jsx`
  - valida copy de PDF nos cards da landing React.

## Validacao executada

- `npm run test -- src/__tests__/pricing.test.js src/__tests__/subscriptionPlans.test.js src/__tests__/upgradeNudge.test.js src/__tests__/landingPageReact.test.jsx`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

Resultados:

- Testes focados: passaram, 36 testes.
- `npm run format`: passou.
- `npm run build`: passou com warnings Vite/chunk conhecidos.
- `npm run check`: passou com 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings Vite/chunk conhecidos.
- `git diff --check`: passou.

## Riscos remanescentes

- A UX de upgrade ainda usa pricing com destaque por plano, nao um modal dedicado.
- Existem copys legadas fora de pricing/catalogo que podem ser revisadas em fase de design/copy, sem alterar o runtime de cota.
- Warnings Vite/chunk e o warning ESLint conhecido em `src/domain/pdf/shareReport.js` permanecem como backlog controlado.

## Proximo CP recomendado

Mudanca 19 / CP-F - fechamento documental da fase de monetizacao PDF/cotas, se nao houver nova lacuna de apresentacao a corrigir.
