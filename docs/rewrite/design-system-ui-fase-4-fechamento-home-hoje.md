# Design System/UI fase 4 - fechamento Home Hoje

## Objetivo

Revisar a Home Hoje apos a correcao visual da fase 3, confirmar se ainda ha
problema concreto e encerrar o ciclo visual da Home quando nao houver nova
evidencia.

## Escopo

- Revisar Home Hoje em mobile 390px, desktop 1366px e desktop 1920px.
- Reexecutar cenario de texto longo.
- Verificar ausencia de overflow horizontal.
- Verificar breakpoints de navegacao: bottom nav no mobile e sidebar no
  desktop.
- Verificar que os botoes de `Alertas ativos` nao exibem borda nativa preta.
- Verificar que o divisor de `Alertas ativos` tem cor explicita no app-v2.

## Anti-escopo

- Nao alterar shell, router, storage, Supabase/RLS, migrations, PMOC, billing,
  assinatura, PDF/share, WhatsApp, seguranca ou React Doctor.
- Nao iniciar redesign geral da Home.
- Nao criar CSS global, tokens novos, primitives novas ou dependencias.
- Nao conectar integracoes reais.

## Evidencia visual

Evidencias salvas em
`docs/rewrite/qa-design-system-ui-fase-4-home-hoje/`:

- `mobile-390.png`;
- `mobile-390-long-text.png`;
- `desktop-1366.png`;
- `desktop-1366-long-text.png`;
- `desktop-1920.png`;
- `desktop-1920-long-text.png`;
- `metrics.json`.

## Resultado da revisao

O QA pos-correcao nao encontrou novo problema visual concreto na Home Hoje:

- mobile 390px sem overflow horizontal;
- desktop 1366px sem overflow horizontal;
- desktop 1920px sem overflow horizontal;
- cenario de texto longo sem overflow horizontal;
- bottom nav visivel apenas no mobile;
- sidebar desktop visivel apenas no desktop;
- `Alertas ativos` com 3 botoes e `0` botoes com risco de borda nativa;
- divisor de `Alertas ativos` com cor explicita `tw-divide-[#E5EAF0]`;
- console sem mensagens nos cenarios principais.

## Ajustes cobertos pelo ciclo

- Fase 3: botoes de alerta receberam `tw-border-0` para remover borda nativa.
- Fase 4: lista de alertas recebeu `tw-divide-[#E5EAF0]` para impedir divisor
  preto por estilo padrao.

Ambos os ajustes ficaram restritos a `src/app-v2/home/HomeToday.tsx` e foram
cobertos por `src/app-v2/shell/AppV2Shell.test.tsx`.

## Decisao

Encerrar o ciclo visual da Home Hoje neste ponto. Qualquer melhoria futura da
Home deve abrir novo checkpoint com problema concreto, area unica e criterios de
validacao proprios.

## Proximo checkpoint recomendado

Equipamentos avancados fase 1 documental: decidir contrato mock/local para
setores, fotos e delecao antes de qualquer UI, sem upload/storage real,
Supabase/RLS, migrations, PMOC, billing, assinatura, PDF/share, WhatsApp real ou
design geral.
