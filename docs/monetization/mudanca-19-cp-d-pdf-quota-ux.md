# Mudanca 19 / CP-D - UX da cota de PDF

## Objetivo

Refinar a mensagem e o direcionamento de upgrade quando a cota mensal de PDF e atingida, sem reescrever a regra de runtime criada na CP-C.

## Estado inicial

- Branch: main
- HEAD inicial: 10d685eb225a40cc9bbc220cbd1af225e917ba3a
- Working tree inicial: limpo

## Arquivos alterados

- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/__tests__/reportExportHandlers.test.js`
- `docs/monetization/mudanca-19-cp-d-pdf-quota-ux.md`

## Comportamento anterior

- Free bloqueado recebia aviso generico com Plus na mensagem, mas sem explicitar `1 PDF/mes` nem separar PDF/download de WhatsApp.
- Plus bloqueado recebia aviso com Pro, mas sem o formato direto `50 PDFs/mes`.
- O redirecionamento para `pricing` nao informava qual plano deveria ser destacado.

## Comportamento novo

- Free bloqueado:
  - mensagem cita o limite Free de `1 PDF/mes`;
  - explica que WhatsApp usa cota separada;
  - redireciona para `pricing` com `highlightPlan: 'plus'`;
  - usa `reason: 'pdf_quota_free'`.

- Plus bloqueado:
  - mensagem cita o limite Plus de `50 PDFs/mes`;
  - recomenda Pro como proximo passo;
  - redireciona para `pricing` com `highlightPlan: 'pro'`;
  - usa `reason: 'pdf_quota_plus'`.

- Pro continua sem bloqueio por cota de PDF porque o limite permanece `Infinity`.

## Mensagens/CTA definidos

- Free: "Voce atingiu o limite Free de 1 PDF/mes. Faca upgrade para Plus para mais PDFs e relatorios sem marca d'agua. O WhatsApp usa uma cota separada."
- Plus: "Voce atingiu o limite Plus de 50 PDFs/mes. O plano Pro libera PDFs sem limitacao relevante."

O CTA efetivo continua sendo a rota `pricing`, agora com destaque de plano via parametros ja usados por outros paywalls do app.

## Preservado

- Runtime de cota e incremento criados na CP-C.
- Uso de `pdf_export` so depois de exportacao bem-sucedida.
- Marca d'agua do Free dentro da cota.
- PDF sem cliente associado.
- WhatsApp/share separado de `pdf_export`.
- Pos-save e edicao de registro.
- PDF/share, Supabase, migrations, seguranca, CSS amplo e dependencias.

## Testes alterados/adicionados

- `reportExportHandlers.test.js`
  - Free bloqueado exibe `1 PDF/mes`, menciona WhatsApp separado e destaca Plus.
  - Plus bloqueado exibe `50 PDFs/mes`, menciona Pro e destaca Pro.
  - Bloqueio continua sem incrementar `pdf_export`.

## Validacao executada

- `npm run test -- src/__tests__/reportExportHandlers.test.js`
- `npm run test -- src/__tests__/usageLimits.test.js src/__tests__/reportExportHandlers.test.js src/__tests__/reportExportContracts.test.js src/__tests__/historicoPdfWhatsappIntegration.contract.test.js`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

## Riscos remanescentes

- A UX ainda usa `Toast.warning()` e rota `pricing`; um modal dedicado de paywall pode ser avaliado em fase futura se houver padrao visual consolidado.
- A contagem segue dependente de `usage_monthly` e do RPC existente.
- O reset mensal permanece no contrato UTC ja existente.
- Warnings Vite/chunk e o warning ESLint conhecido em `shareReport.js` continuam como backlog controlado.

## Proximo CP recomendado

Mudanca 19 / CP-E - fechamento documental da monetizacao PDF/cotas ou revisao curta dos textos de pricing/catalogo, se for necessario alinhar a comunicacao comercial ao contrato tecnico ja ativado.
