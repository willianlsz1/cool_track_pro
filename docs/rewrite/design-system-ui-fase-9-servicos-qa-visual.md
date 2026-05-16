# Design System/UI fase 9 - QA visual Servicos

Data: 2026-05-16

## Objetivo

Executar QA visual real de `Servicos` app-v2 em browser com screenshots mobile
390, desktop 1366 e desktop 1920, cobrindo Registros, Relatorios, Orcamentos,
estados vazios, texto longo, preview de relatorio e edicao local de orcamento.

Esta fase tambem permite um ajuste visual pequeno caso o QA encontre problema
concreto, desde que o ajuste fique limitado a `Servicos` e nao toque areas
sensiveis.

## Escopo

- Capturar screenshots de `Servicos > Registros`, `Servicos > Relatorios` e
  `Servicos > Orcamentos`.
- Medir overflow horizontal de pagina.
- Medir elementos visiveis fora da viewport.
- Verificar estados vazios/filtros sem resultado.
- Verificar texto tecnico e item local longo.
- Corrigir somente achado visual pequeno se houver evidencia objetiva.

## Fora de escopo

- Redesign amplo.
- Alterar regras de negocio, store, actions, view models ou contratos
  funcionais.
- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Migrations.
- PMOC.
- Billing real, assinatura, quotas ou pricing.
- Router global, seguranca, React Doctor ou limpeza ampla de imports.

## Evidencias geradas

Evidencias salvas em:

- `docs/rewrite/qa-design-system-ui-fase-9-servicos/`
- `docs/rewrite/qa-design-system-ui-fase-9-servicos/metrics.json`

Foram capturados 27 cenarios:

| Viewport     | Cenarios |
| ------------ | -------- |
| mobile 390   | 9        |
| desktop 1366 | 9        |
| desktop 1920 | 9        |

Cenarios capturados por viewport:

- `registros-default`
- `registros-empty-filter`
- `registros-texto-tecnico`
- `relatorios-dashboard`
- `relatorios-empty-filter`
- `relatorios-preview`
- `orcamentos-pipeline`
- `orcamentos-edicao`
- `orcamentos-item-longo`

## Achado inicial

A primeira captura encontrou overflow horizontal em `Servicos > Registros` no
mobile 390:

- `mobile-390/registros-default`: `scroll.width` 392 para viewport 390;
- `mobile-390/registros-empty-filter`: overflow horizontal;
- `mobile-390/registros-texto-tecnico`: overflow horizontal;
- amostra indicava o input `Buscar registros` com largura visual passando 2px da
  viewport.

## Causa

O input de busca de Registros usava `tw-w-full`, borda e padding horizontal sem
`tw-box-border`. O input equivalente de Relatorios ja usava `tw-box-border` e
nao apresentava o mesmo overflow.

## Ajuste executado

`src/app-v2/service/ServicesHome.tsx` recebeu somente `tw-box-border` no input
`Buscar registros`.

Nao foram alterados filtros, handlers, view model, store, contratos, textos,
rotas, PDF/share, WhatsApp, storage real, Supabase/RLS, migrations, PMOC,
billing, assinatura ou design amplo.

## Resultado pos-ajuste

A bateria completa foi recapturada apos o ajuste:

- 27 cenarios capturados;
- 0 cenarios com overflow horizontal de pagina;
- 0 cenarios com elementos visiveis fora da viewport;
- Registros, Relatorios e Orcamentos permaneceram acessiveis nas tres larguras;
- preview de relatorio permaneceu local/imprimivel;
- edicao de orcamento permaneceu mock/local.

Observacao: `metrics.json` ainda registra alguns `overflowingTextCount` em
spans `sr-only` e labels/containers de formulario. Esses itens nao geram
overflow horizontal de pagina nem elemento visivel fora da viewport, portanto
ficam classificados como ruido de metrica ou truncamento controlado.

## Decisoes

- A Fase 9 corrigiu apenas o overflow concreto de Registros mobile.
- Nao ha novo ajuste visual obrigatorio antes da proxima reauditoria.
- `Servicos` fica visualmente validado para os cenarios cobertos por esta fase.
- PMOC segue excluido deste ciclo e deve ser refeito em etapa propria futura.
- PDF/share real, WhatsApp real, storage real, Supabase/RLS, migrations,
  billing real e assinatura continuam bloqueados para etapas proprias.

## Validacao

- QA visual recapturou 27 cenarios em
  `docs/rewrite/qa-design-system-ui-fase-9-servicos/`.
- `metrics.json` pos-ajuste ficou sem overflow horizontal de pagina e sem
  elementos visiveis fora da viewport nos 27 cenarios.
- `npm run format` passou.
- `npm test -- src/app-v2/shell/AppV2Shell.test.tsx --run` passou com 38
  testes.
- `npm run build` passou com warnings Vite conhecidos de chunks/static+dynamic.
- `npm run check` passou com 1 warning ESLint conhecido em
  `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check` passou.

## Proximo checkpoint recomendado

Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de
`Servicos`, para escolher o proximo fluxo do app-v2 por lacuna funcional ou
visual ainda nao sensivel; manter PMOC, Supabase/RLS, migrations, storage real,
billing real, PDF/share, WhatsApp e security hardening em etapas proprias.
