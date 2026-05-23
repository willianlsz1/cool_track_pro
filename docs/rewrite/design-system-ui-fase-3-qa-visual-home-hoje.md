# Design System/UI fase 3 - QA visual inicial da Home Hoje

Data: 2026-05-16

## Objetivo

Executar QA visual inicial da Home Hoje em browser e aplicar apenas refinamento
pequeno quando houver evidencia concreta de problema.

## Escopo

- Validar Home Hoje em mobile 390px, desktop 1366px e desktop 1920px.
- Validar texto longo por injecao temporaria no browser, sem alterar dados do
  app.
- Verificar overflow horizontal, navegacao por breakpoint e console.
- Corrigir somente problema visual comprovado e local.

## Evidencia coletada

Arquivos gerados em `docs/rewrite/qa-design-system-ui-fase-3-home-hoje/`:

- `mobile-390.png`;
- `mobile-390-long-text.png`;
- `desktop-1366.png`;
- `desktop-1366-long-text.png`;
- `desktop-1920.png`;
- `desktop-1920-long-text.png`;
- `metrics.json`.

## Achados

- Mobile 390px: sem overflow horizontal, bottom nav exibida e sidebar desktop
  oculta.
- Desktop 1366px: sem overflow horizontal, sidebar desktop exibida e bottom nav
  oculta.
- Desktop 1920px: sem overflow horizontal, sidebar desktop exibida e bottom nav
  oculta.
- Texto longo injetado nao gerou overflow horizontal nos tres tamanhos.
- Console nao registrou warnings ou erros durante o QA.
- Problema visual encontrado: botoes de `Alertas ativos` na coluna auxiliar da
  Home exibiam borda nativa preta no desktop.

## Refinamento aplicado

`src/app-v2/home/HomeToday.tsx` recebeu `tw-border-0` apenas nos botoes locais de
alerta da coluna auxiliar. A mudanca remove a borda nativa sem alterar fluxo,
dados, estado, tokens, shell ou navegacao.

## Validacao executada

- RED:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` falhou porque os
  botoes de alerta ainda nao tinham `tw-border-0`.
- GREEN:
  `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 33
  testes.
- QA visual reexecutado e registrado em `metrics.json`.

## Fora de escopo preservado

- Nenhum CSS global.
- Nenhum token novo.
- Nenhum componente/primitives novo.
- Nenhum redesign amplo.
- Nenhum ajuste em Equipamentos, Servicos, Conta ou Orcamentos.
- Nenhum storage, Supabase/RLS, PMOC, PDF/share, WhatsApp, billing, assinatura
  ou migrations.

## Proximo passo recomendado

Design System/UI fase 4: revisar Home Hoje no browser apos a correcao e decidir
se ha outro problema visual concreto. Se nao houver, encerrar o ciclo visual da
Home e escolher o proximo fluxo por matriz/auditoria, sem ampliar para redesign
geral.
