# Mudança 21 / CP-A - Identidade visual clara e piloto no Dashboard

## 1. Estado inicial

- Branch: `main`
- HEAD confirmado localmente: `46151af`
- Working tree inicial: limpo
- Escopo: planejamento/documentação, sem mudança funcional e sem alteração de CSS/JS neste CP documental.

## 2. Objetivo

Definir o plano de migração visual do CoolTrack Pro para uma identidade clara, azul e branca, usando o Dashboard/Painel como piloto controlado.

A direção visual validada na entrevista é:

- app claro como padrão principal;
- azul/branco como identidade base;
- aparência de SaaS operacional limpo e confiável;
- preservação de tokens semânticos para permitir tema escuro no futuro;
- validação visual obrigatória antes de considerar o CP implementado.

## 3. Decisões confirmadas

1. A nova identidade principal deve seguir a paleta clara azul/branco enviada como referência.
2. O Dashboard/Painel será a primeira tela piloto.
3. O primeiro CP de implementação deve incluir sistema visual base + Dashboard, não apenas Dashboard isolado.
4. Landing Page e Auth ficam fora do primeiro CP de implementação, pois já passaram por redesign; depois entram apenas em revisão de consistência.
5. O tema claro passa a ser o padrão único por enquanto.
6. A paleta da referência pode ser ajustada quando houver necessidade de contraste, acessibilidade ou legibilidade.
7. A validação visual será feita com screenshots manuais e smoke/E2E existente, sem criar teste visual automatizado no primeiro CP salvo regressão clara.
8. Status funcionais entram como tokens semânticos.
9. Cores de setores/equipamentos continuam como cores de contexto do usuário, não como marca.
10. Planos/tier ficam alinhados à nova direção: Free neutro, Plus azul, Pro/Premium dourado.

## 4. Paleta base proposta

| Papel                 | Token sugerido             | Valor base |
| --------------------- | -------------------------- | ---------- |
| Fundo do app          | `--ct-bg`                  | `#F6F9FC`  |
| Superfície/card/modal | `--ct-surface`             | `#FFFFFF`  |
| Azul principal        | `--ct-brand`               | `#1E5BFF`  |
| Azul hover            | `--ct-brand-hover`         | `#164FE6`  |
| Azul suave            | `--ct-brand-soft`          | `#E6F0FF`  |
| Destaque ciano        | `--ct-accent`              | `#00C7FF`  |
| Borda                 | `--ct-border`              | `#E2E8F0`  |
| Texto principal       | `--ct-text`                | `#0F172A`  |
| Texto secundário      | `--ct-text-muted`          | `#64748B`  |
| Sucesso               | `--ct-success`             | `#22C55E`  |
| Alerta/warning        | `--ct-warn`                | `#F59E0B`  |
| Perigo/erro           | `--ct-error`               | `#EF4444`  |
| Premium/Pro           | `--ct-gold` ou `--ct-tier` | `#FFB60D`  |

Observação: estes valores são ponto de partida. A implementação deve poder ajustar tons mantendo a direção visual quando contraste e leitura exigirem.

## 5. Componentes e áreas no escopo do primeiro CP de implementação

### Sistema visual base

- `src/assets/styles/tokens.css`
  - redefinir tokens canônicos para light-first;
  - preservar aliases legados como `--primary`, `--bg`, `--surface`, `--text`, `--success`, `--warning`, `--danger`.
- `src/assets/styles/base.css`
  - revisar fundo global, seleção, scrollbar e overlays sutis.
- `src/assets/styles/layout.css`
  - shell, header, navbar mobile, sidebar desktop e áreas de conteúdo.
- `src/assets/styles/redesign.css`
  - revisar overrides finais para não manter dark como aparência real.
- `src/assets/styles/theme-premium.css`
  - revisar efeitos premium/neon que podem ficar incoerentes em fundo claro.
- `src/assets/styles/components.css`
  - ajustar botões, cards, modais, inputs e estados globais somente nos blocos necessários.
- Parciais de componentes quando diretamente afetadas pelo Dashboard ou shell:
  - `src/assets/styles/components/_pricing.css`
  - `src/assets/styles/components/_onboarding-checklist.css`
  - `src/assets/styles/components/_push-optin.css`
  - outras parciais apenas se aparecerem no Dashboard/painel.

### React/UI primitives

- `src/react/components/ui/Button.jsx`
  - substituir slate/red/sky genérico por classes ou estilos alinhados aos tokens do CoolTrack.
- `src/react/components/ui/Badge.jsx`
  - alinhar tons a `--ct-success`, `--ct-warn`, `--ct-error`, `--ct-brand`, `--ct-gold`.

### Dashboard/Painel

- `src/react/pages/DashboardHero.jsx`
- `src/react/pages/DashboardKpis.jsx`
- `src/react/pages/DashboardLastService.jsx`
- `src/react/pages/DashboardMonthSummary.jsx`
- `src/react/pages/DashboardNextAction.jsx`
- `src/react/pages/DashboardOnboarding.jsx`
- `src/react/pages/DashboardProDraft.jsx`
- `src/react/pages/DashboardReadOnlyBlocks.jsx`
- `src/ui/views/dashboard.js`
- `src/ui/views/dashboard/*`
- CSS de famílias `dash-*`, `dsh-*`, `bento-*`, `alert-strip*`, `critical-incident*` quando necessário.

### Modais e shell base

- Modais genéricos do shell, não fluxos específicos sensíveis.
- Navbar/sidebar/topbar/footer do app autenticado.
- Botões base e estados hover/focus/disabled.

## 6. Fora do escopo do primeiro CP de implementação

- Landing Page.
- Auth/Login.
- PDF/share.
- `src/domain/pdf/shareReport.js`.
- Assinatura, canvas de assinatura e página pública de assinatura de orçamento.
- Supabase, RLS, storage, billing e migrations.
- Router e contratos `data-nav`, `data-action`, IDs e selectors públicos.
- Reorganização de pastas.
- Dependências novas.
- Redesign completo de Clientes, Equipamentos, Registro, Histórico, Relatórios ou Orçamentos.
- Remoção de CSS legado por suspeita.

## 7. Tratamento de cores especiais

### Status

Status devem usar tokens semânticos:

- info/primary: `--ct-brand`
- sucesso: `--ct-success`
- alerta: `--ct-warn`
- erro/perigo: `--ct-error`

Não espalhar novos hex hardcoded para status.

### Setores/equipamentos

Cores de setores continuam sendo contexto do usuário. Elas podem aparecer como dot, borda, chip ou faixa sutil, mas não devem dominar cards inteiros nem virar identidade de marca.

### Planos

- Free: neutro claro.
- Plus: azul principal.
- Pro/Premium: dourado `#FFB60D` ou token equivalente.

O objetivo é reduzir a divergência atual entre múltiplos azuis e dourados usados em pricing, usage meter, header e badges.

## 8. Riscos

- Troca global de tokens pode afetar muitos componentes legados de uma vez.
- CSS atual tem múltiplas camadas e overrides; `tokens.css` e `redesign.css` vencem parte da cascata, mas há hardcoded em CSS, JS e React.
- Tema claro pode expor contraste fraco em texto pequeno, badges, inputs e estados disabled.
- Dashboard tem ilhas React e render legado; a validação precisa cobrir ambos.
- Modais e shell são transversais: ajuste visual mal limitado pode afetar fluxos fora do Dashboard.
- Landing/Auth já têm identidade azul/branco, mas com tokens próprios; alinhar agora aumentaria o escopo.

## 9. Plano de implementação recomendado

### CP-A1 - Tokens e shell claro

1. Atualizar tokens light-first em `tokens.css`.
2. Ajustar aliases legados para preservar compatibilidade.
3. Ajustar `base.css`, `layout.css` e `redesign.css` para fundo claro, surfaces, navbar/sidebar e foco.
4. Validar visualmente shell sem alterar navegação.

### CP-A2 - Botões, cards, inputs e modais base

1. Ajustar botões primário, secundário, fantasma, perigo, premium e disabled.
2. Ajustar cards/surfaces globais.
3. Ajustar modais base.
4. Atualizar `Button.jsx` e `Badge.jsx` se estiverem em uso no painel.

### CP-A3 - Dashboard piloto

1. Ajustar famílias `dash-*`, `dsh-*`, `bento-*` e componentes React do Dashboard.
2. Garantir cards brancos, bordas suaves, CTA azul e status legíveis.
3. Validar estados com dados, vazios e premium/read-only.

### CP-A4 - Relatório de validação visual

1. Capturar screenshots desktop e mobile.
2. Registrar diferenças antes/depois.
3. Registrar contraste problemático, se houver.
4. Definir próximos CPs por tela.

## 10. Validação obrigatória para o CP de implementação

### Validação visual

- Screenshot desktop do Dashboard.
- Screenshot mobile do Dashboard.
- Verificação visual de:
  - navbar mobile;
  - sidebar desktop;
  - header/topbar;
  - cards/KPIs;
  - CTA primário;
  - badges/status;
  - modal base;
  - estados disabled/hover/focus quando viável.

### Validação técnica

Executar no mínimo:

```bash
npm run format
npm run build
npm run check
```

Testes focados recomendados:

```bash
npm run test -- src/__tests__/dashboard*.test.js src/__tests__/shell.test.js src/__tests__/uiPrimitives.test.jsx
```

Smoke/E2E recomendado:

```bash
npm run test:e2e -- e2e/specs/core-flow-smoke.spec.js e2e/specs/navigation-and-modal.spec.js
```

Se algum comando falhar por ruído conhecido, registrar comando, erro, evidência e decisão. Não declarar validação como concluída sem executar ou justificar explicitamente.

## 11. Próximos passos após o piloto

Se o Dashboard validar a direção visual:

1. Expandir para Clientes e Orçamentos, pois já têm muitos status/cards e hardcoded de cores.
2. Revisar Equipamentos preservando cores de setores como contexto.
3. Revisar Registro, Histórico e Relatórios em CPs separados.
4. Revisar Landing/Auth apenas para consistência final de tokens, sem redesign novo.
5. Criar inventário de hardcoded colors remanescentes por prioridade.

## 12. Resultado deste documento

Este documento consolida a entrevista de identidade visual e define o escopo recomendado para a implementação futura. Nenhuma alteração visual foi aplicada neste CP documental.
