# Design System/UI fase 11 - QA visual Conta

Data: 2026-05-16

## Objetivo

Executar QA visual real de `Conta` app-v2 em browser com screenshots mobile 390,
desktop 1366 e desktop 1920, cobrindo estado default, densidade compacta,
lembrete ativo, foco em controle, texto longo local e preferencias.

Esta fase tambem permite um ajuste visual pequeno caso o QA encontre problema
concreto, desde que o ajuste fique limitado a `Conta` e nao toque areas
sensiveis.

## Escopo

- Capturar `Conta` em mobile 390, desktop 1366 e desktop 1920.
- Medir overflow horizontal de pagina.
- Medir elementos visiveis fora da viewport.
- Verificar estado default e densidade compacta.
- Verificar lembrete local ativo.
- Verificar foco em atalho operacional.
- Verificar texto local longo e leitura de secoes.
- Confirmar ausencia de promessas visiveis de perfil real, billing, assinatura,
  PMOC, Supabase, PDF/share, WhatsApp ou storage real.

## Fora de escopo

- Redesign amplo.
- Alterar regras de negocio, store, actions, view models ou contratos
  funcionais.
- Persistir preferencias em storage real, localStorage ou Supabase.
- Perfil real.
- Billing real, assinatura, quotas, pricing ou feature paga.
- Supabase/RLS.
- Migrations.
- PMOC.
- PDF/share real.
- WhatsApp real.
- Router global, seguranca, React Doctor ou limpeza ampla de imports.

## Evidencias geradas

Evidencias salvas em:

- `docs/rewrite/qa-design-system-ui-fase-11-conta/`
- `docs/rewrite/qa-design-system-ui-fase-11-conta/metrics.json`

Foram capturados 13 cenarios:

| Viewport     | Cenarios |
| ------------ | -------- |
| mobile 390   | 5        |
| desktop 1366 | 4        |
| desktop 1920 | 4        |

Cenarios capturados:

- `mobile-390-default`
- `mobile-390-compacta`
- `mobile-390-lembrete-ativo`
- `mobile-390-foco-atalho`
- `mobile-390-texto-longo-local`
- `desktop-1366-default`
- `desktop-1366-compacta`
- `desktop-1366-lembrete-ativo`
- `desktop-1366-grid-preferencias-atalhos`
- `desktop-1920-default`
- `desktop-1920-compacta`
- `desktop-1920-texto-longo-local`
- `desktop-1920-secoes-largas`

## Resultado

A bateria completa ficou sem achado visual bloqueante:

- 13 cenarios capturados;
- 0 cenarios com overflow horizontal de pagina;
- 0 cenarios com elementos visiveis fora da viewport;
- 0 cenarios com termos sensiveis visiveis em `Conta`;
- densidade compacta permaneceu dentro da viewport;
- lembrete local ativo nao quebrou layout;
- foco em atalho operacional foi capturado;
- mobile 390 preservou bottom nav e rolagem vertical;
- desktop 1366 e 1920 preservaram sidebar e leitura das secoes.

## Observacao sobre ferramenta

O navegador embutido foi conectado primeiro, mas a automacao de clique do bottom
nav ficou instavel ao alternar viewports. A captura final foi feita com
Playwright local contra o mesmo servidor Vite e a mesma URL do app-v2 preview.

## Decisoes

- Nao ha ajuste visual obrigatorio para `Conta` nesta fase.
- Nao houve alteracao de runtime.
- `Conta` fica visualmente validada para os cenarios cobertos por esta fase.
- Perfil real, persistencia, billing, assinatura, Supabase/RLS, migrations,
  PMOC, PDF/share, WhatsApp e suporte real continuam bloqueados para etapas
  proprias.

## Validacao

- QA visual capturou 13 cenarios em
  `docs/rewrite/qa-design-system-ui-fase-11-conta/`.
- `metrics.json` ficou sem overflow horizontal de pagina, sem elementos visiveis
  fora da viewport e sem termos sensiveis visiveis nos 13 cenarios.
- `npm run format` passou.
- `npm run format:check` passou.
- `git diff --check` passou.

## Proximo checkpoint recomendado

Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de `Conta`,
para escolher o proximo fluxo do app-v2 por lacuna funcional ou visual ainda nao
sensivel; manter PMOC, Supabase/RLS, migrations, storage real, billing real,
PDF/share, WhatsApp, perfil real e security hardening em etapas proprias.
