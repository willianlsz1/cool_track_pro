# Mudanca 19 / CP-B - Contrato de cota PDF por plano

## Objetivo

Preparar o contrato tecnico de limite mensal de PDF por plano, sem bloquear exportacao ainda.

Esta CP-B cria um helper puro para a futura decisao de cota PDF e atualiza testes unitarios do contrato. O fluxo real de exportacao permanece inalterado para evitar antecipar o bloqueio que sera tratado na CP-C.

## Estado inicial

- Branch: `main`
- HEAD inicial: `5ca928ae2aadfd4b8d45d23cf875a514c1a82bf7`
- Working tree inicial: limpo (`git status --short` sem saida)
- Contexto anterior: `docs/monetization/mudanca-19-cp-a-planejamento-pdf-cotas.md`

## Arquivos alterados

- `src/core/usageLimits.js`
  - Adicionado contrato puro `PDF_EXPORT_MONTHLY_QUOTA_CONTRACT`.
  - Adicionados helpers:
    - `getPdfExportMonthlyQuotaForPlan(planCode)`
    - `isPdfExportMonthlyQuotaUnlimited(planCode)`
    - `hasFinitePdfExportMonthlyQuota(planCode)`
- `src/__tests__/usageLimits.test.js`
  - Adicionado teste unitario do contrato de cota PDF sem ativar bloqueio real.
- `docs/monetization/mudanca-19-cp-b-pdf-quota-contract.md`
  - Documento desta CP-B.

## Contrato novo de limite PDF por plano

O contrato planejado de cota mensal de PDF ficou:

- Free: `1` PDF/mes.
- Plus: `50` PDFs/mes.
- Pro: `Infinity`, sem limitacao relevante.

O helper `getPdfExportMonthlyQuotaForPlan(planCode)` normaliza o plano usando a regra existente de `normalizePlanCode()` e retorna a cota planejada.

Os helpers derivados distinguem limite finito de ilimitado:

- `hasFinitePdfExportMonthlyQuota('free') === true`
- `hasFinitePdfExportMonthlyQuota('plus') === true`
- `hasFinitePdfExportMonthlyQuota('pro') === false`
- `isPdfExportMonthlyQuotaUnlimited('pro') === true`

## O que ainda nao foi implementado

Esta CP-B nao ativou o bloqueio real de exportacao.

Por seguranca de escopo, `MONTHLY_LIMITS.pdf_export` continua como `Infinity` em Free, Plus e Pro. Esse ponto e intencional porque `src/ui/controller/handlers/reportExportHandlers.js` ja consulta `getMonthlyLimitForPlan()` no fluxo real. Alterar esse limite ativo nesta CP causaria bloqueio e incremento imediatamente, antecipando a CP-C.

Tambem nao houve alteracao em:

- `src/ui/controller/handlers/reportExportHandlers.js`
- `src/domain/pdf/*`
- `src/domain/pdf/shareReport.js`
- WhatsApp/share
- paywall/upgrade
- marca d'agua Free
- Supabase/RLS/migrations/functions
- CSS/design
- `package.json` ou `package-lock.json`

## Testes alterados

Arquivo:

- `src/__tests__/usageLimits.test.js`

Cobertura adicionada:

- Free tem contrato planejado de `1` PDF/mes.
- Plus tem contrato planejado de `50` PDFs/mes.
- Pro permanece ilimitado para PDF.
- O helper diferencia cota finita de cota ilimitada.
- O teste deixa explicito que o bloqueio ativo ainda nao foi ligado nesta CP.

## Validacao executada

- `npm run test -- src/__tests__/usageLimits.test.js`: passou, 5 testes.
- `npm run format`: passou; apenas os arquivos desta CP permaneceram alterados.
- `npm run build`: passou com warnings Vite conhecidos de import estatico/dinamico e tamanho de chunks.
- `npm run check`: passou; manteve 1 warning ESLint conhecido em `src/domain/pdf/shareReport.js` e os mesmos warnings Vite conhecidos no build.
- `git diff --check`: passou sem apontamentos.

## Riscos remanescentes

- Existem agora dois conceitos temporarios:
  - contrato planejado de cota PDF;
  - limite ativo de runtime ainda ilimitado.
- CP-C deve remover essa separacao com cuidado, ligando o fluxo real ao contrato sem quebrar WhatsApp, pos-save ou PDF sem cliente.
- Como `reportExportHandlers.js` concentra budget, preview, download, WhatsApp e PMOC, a ativacao do bloqueio deve ter testes focados.
- Offline ainda precisa de decisao explicita: hoje erro de leitura em `usage_monthly` vira uso zerado.
- Reset mensal continua baseado em `YYYY-MM-01` UTC.
- Free continua com marca d'agua; a cota nao muda branding nesta CP.

## Proximo CP recomendado

Mudanca 19 / CP-C - Bloqueio Free apos 1 PDF/mes no fluxo real de exportacao.

Escopo recomendado:

- Ligar o fluxo de `export-pdf` ao contrato de cota.
- Incrementar `pdf_export` somente apos exportacao disparada com sucesso.
- Bloquear Free em `1/1` antes de gerar o PDF.
- Preservar WhatsApp como destino principal.
- Preservar Registro pos-save, PDF sem cliente e WhatsApp sem telefone.
- Manter paywall/mensagens mais refinadas para CP-D, salvo ajuste minimo necessario.
