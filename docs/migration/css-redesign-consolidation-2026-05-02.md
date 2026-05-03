# Redesign CSS consolidation - 2026-05-02

## Escopo

Consolidacao dedicada de `src/assets/styles/redesign.css`, sem redesenhar telas e sem alterar contratos funcionais.

## Auditoria resumida

- `redesign.css` continha um bloco inicial de sidebar que era vencido por regras escopadas posteriores de sidebar.
- Regras de `app-sidebar__plan-card` continuavam no arquivo mesmo apos a remocao visual do card Plano Pro da sidebar.
- Hardcodes recorrentes de superficie clara, texto claro e acentos azuis apareciam em regras de compatibilidade visual.
- Muitos blocos por PR antigo continuam vivos porque ainda protegem cascata entre React, views legadas e CSS base.

## Removido

- Bloco inicial duplicado de sidebar: active state, hover, badge e plan card.
- Bloco antigo de Plano Pro/sidebar plan card.
- Ajustes responsivos residuais para `app-sidebar__plan-card`.

## Consolidado

- Hardcodes recorrentes foram movidos para variaveis locais de compatibilidade em `redesign.css`:
  - `--ct-legacy-light-surface`
  - `--ct-legacy-light-surface-subtle`
  - `--ct-legacy-light-border`
  - `--ct-legacy-light-border-strong`
  - `--ct-legacy-light-text`
  - `--ct-legacy-light-text-muted`
  - `--ct-legacy-brand-blue`
  - `--ct-legacy-brand-blue-hover`
  - `--ct-legacy-cyan`
- Comentario de cabecalho foi atualizado para deixar claro que `redesign.css` e uma camada de compatibilidade, nao destino preferencial para novos estilos.

## Mantido por seguranca

- Blocos de dashboard, clientes, equipamentos, relatorios, historico, alertas, orcamentos e modais foram preservados quando ainda havia risco de mudanca visual por cascata.
- `!important` foi mantido nos pontos onde o arquivo ainda precisa vencer CSS base anterior.
- Valores `rgba(...)` especificos de sombras, focus rings e glows foram mantidos quando representam ajuste visual validado.
- `app-logo__pill` e locks/paywall foram mantidos por ainda serem contratos visuais de plano/tier.

## Proximo cleanup recomendado

1. Extrair blocos grandes por tela para CSS escopado quando houver QA visual dedicado.
2. Reduzir `!important` somente depois de simplificar os estilos base em `components.css`.
3. Remover compatibilidade de superficies claras apenas quando todas as telas internas estiverem totalmente na paleta escura operacional.
