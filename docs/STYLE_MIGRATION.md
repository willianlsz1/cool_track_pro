# Cool Track Pro — Padrão de migração de CSS para Tailwind

Este documento é o guia oficial para a migração CSS legado → Tailwind no
app vanilla do Cool Track Pro. Foi escrito após a Etapa 2 do branch
`style-reset` (Login + passwordRecoveryModal migrados) e deve ser
mantido vivo a cada nova view migrada.

---

## 1. Decisão arquitetural

### Tailwind v3 estendido — não migrar para v4

Esta branch fica em **Tailwind v3 (`tailwindcss ^3.4.19`)** com o plugin
`@tailwindcss/vite ^4.x` **NÃO instalado** (foi removido na Etapa 1).

#### Justificativa (não mude sem ler até o fim)

- O subset React do app (`src/react/**`) já usa Tailwind v3 com **356
  ocorrências de `tw-*`** em 31 arquivos (Landing, ilhas Alertas/
  Orcamentos/Clientes/Equipamentos/Dashboard/Historico/Relatorio/Registro,
  e os componentes UI primitivos em `src/react/components/ui`).
- A configuração v3 atual usa `prefix: 'tw-'` e `corePlugins.preflight:
false` para coexistir com 22k+ linhas de CSS legado em
  `components.css` sem reset global agressivo.
- Migrar para v4 implicaria: mudar todos os 356 usos de `tw-*` (v4
  remove o `prefix` config — ele virou nativo das utilities), reescrever
  o entry CSS (`@import "tailwindcss"` + `@theme {}` em vez de
  `@tailwind components; @tailwind utilities`), e retestar a Landing
  inteira. **Trabalho grande, sem ganho claro nesta fase.**
- Decisão registrada em conversa de 2026-05-02: priorizar progressão
  da migração CSS por view ao invés de upgrade de major Tailwind.

> Próxima sessão: **NÃO** tente migrar para Tailwind v4 por iniciativa
> própria. Se alguém propuser, peça referência a este doc.

### Convenções

| Item                                  | Valor                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Tailwind major                        | **v3**                                                                  |
| Prefix das utilities                  | **`tw-`** (`tw-flex`, `tw-bg-landing-cyan`, …)                          |
| Preflight (reset Tailwind)            | **off** (`corePlugins.preflight: false`)                                |
| Content glob                          | `./index.html`, `./src/**/*.{js,jsx,ts,tsx}`                            |
| Entry CSS Tailwind (vanilla)          | [src/assets/styles/app.css](../src/assets/styles/app.css)               |
| Entry CSS Tailwind (React)            | [src/react/styles/tailwind.css](../src/react/styles/tailwind.css)       |
| Token store                           | `tailwind.config.cjs > theme.extend.colors` (NÃO usamos `@theme {}` v4) |
| Source de verdade dos tokens `--ct-*` | [src/assets/styles/tokens.css](../src/assets/styles/tokens.css)         |

---

## 2. Tokens disponíveis

Tudo abaixo é definido em [tailwind.config.cjs](../tailwind.config.cjs)
em `theme.extend.colors`. Use `tw-bg-landing-cyan`, `tw-text-ct-text`,
etc. Suporte a opacity modifier: `tw-bg-landing-cyan/10` =
`rgba(64,196,255,0.1)`.

### `landing.*` — paleta da Landing/Auth (fundo navy/cyan)

| Token                                 | Hex       | Uso típico                                                                |
| ------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `landing.navy`                        | `#020B2D` | Background hero da Landing                                                |
| `landing.navy-2`                      | `#031B4E` | Surfaces dark                                                             |
| `landing.navy-3`                      | `#06245F` | Highlight inset                                                           |
| `landing.navy-deep` _(novo na E2)_    | `#03080f` | Stop final do gradient navy                                               |
| `landing.blue`                        | `#006DFF` | Brand blue                                                                |
| `landing.blue-vivid`                  | `#159BFF` | Variante mais brilhante                                                   |
| `landing.blue-bright` _(novo na E2)_  | `#2c7cff` | Accent blue (glow/borders)                                                |
| `landing.cyan`                        | `#40C4FF` | Brand cyan principal                                                      |
| `landing.cyan-soft` _(novo na E2)_    | `#67E8F9` | Cyan suave (texto/ícone)                                                  |
| `landing.off`                         | `#F5F8FC` | Background light                                                          |
| `landing.line`                        | `#E3EAF4` | Borders light                                                             |
| `landing.ink`                         | `#0B1B33` | Texto escuro sobre claro                                                  |
| `landing.ink-2`                       | `#5B6B82` | Texto secundário sobre claro                                              |
| `landing.green`                       | `#18B884` | Sucesso geral                                                             |
| `landing.green-online` _(novo na E2)_ | `#2ecc8b` | Status online dot/pill                                                    |
| `landing.orange`                      | `#F59E0B` | Warning                                                                   |
| `landing.red`                         | `#EF4444` | Error                                                                     |
| `landing.text-body` _(novo na E2)_    | `#cdd9ee` | Texto body sobre dark                                                     |
| `landing.text-mute` _(novo na E2)_    | `#94a8c8` | Texto muted sobre dark                                                    |
| `landing.text-dim` _(novo na E2)_     | `#6b80a3` | Texto dim/labels uppercase                                                |
| `landing.border-base` _(novo na E2)_  | `#78aae6` | Cor base para borders blue-faint via opacity (`/05`, `/10`, `/18`, `/28`) |

### `ct.*` — paleta do app interno (espelha `--ct-*` em tokens.css)

| Token                                  | Hex                      | Uso típico                          |
| -------------------------------------- | ------------------------ | ----------------------------------- |
| **Brand**                              |                          |                                     |
| `ct.brand`                             | `#5f85db`                | Brand principal (azul Linear-style) |
| `ct.brand-hover`                       | `#90b8f8`                | Brand hover                         |
| `ct.brand-text`                        | `#90b8f8`                | Texto sobre brand                   |
| `ct.brand-soft`                        | `rgba(95,133,219,0.14)`  | Bg suave                            |
| `ct.brand-soft-hover`                  | `rgba(144,184,248,0.18)` | Bg suave hover                      |
| `ct.brand-soft-strong`                 | `rgba(144,184,248,0.24)` | Bg suave forte                      |
| `ct.brand-border`                      | `rgba(144,184,248,0.18)` | Border                              |
| `ct.brand-border-hover`                | `rgba(144,184,248,0.32)` | Border hover                        |
| **Surfaces**                           |                          |                                     |
| `ct.app-bg` / `ct.bg`                  | `#26282b`                | App background                      |
| `ct.surface`                           | `#353941`                | Card surface                        |
| `ct.surface-raised`                    | `#3e434d`                | Card elevated/hover                 |
| `ct.surface-subtle`                    | `#2d3036`                | Surface dim                         |
| `ct.surface-elev`                      | `#3e434d`                | Alias raised                        |
| `ct.surface-hover`                     | `#3e434d`                | Alias raised                        |
| `ct.border`                            | `rgba(144,184,248,0.16)` | Border padrão                       |
| `ct.border-strong`                     | `rgba(144,184,248,0.28)` | Border forte                        |
| **Text**                               |                          |                                     |
| `ct.text`                              | `#f4f7fb`                | Texto primário                      |
| `ct.text-muted`                        | `#c7d0e0`                | Texto secundário                    |
| `ct.text-faint`                        | `#98a4b8`                | Texto terciário                     |
| `ct.text-ghost`                        | `#7f8b9f`                | Texto fantasma                      |
| **Status**                             |                          |                                     |
| `ct.success` / `ct.whatsapp`           | `#4ade80`                | Sucesso/WhatsApp                    |
| `ct.success-soft` / `ct.whatsapp-soft` | `rgba(74,222,128,0.12)`  | Sucesso soft                        |
| `ct.info`                              | `#90b8f8`                | Info                                |
| `ct.info-soft`                         | `rgba(144,184,248,0.14)` | Info soft                           |
| `ct.warn`                              | `#fbbf24`                | Warning                             |
| `ct.warn-soft`                         | `rgba(251,191,36,0.13)`  | Warning soft                        |
| `ct.error`                             | `#fb7185`                | Error                               |
| `ct.error-soft`                        | `rgba(251,113,133,0.13)` | Error soft                          |
| **Premium tier**                       |                          |                                     |
| `ct.gold`                              | `#d9a441`                | Pro/premium                         |
| `ct.gold-soft`                         | `rgba(217,164,65,0.10)`  | Gold soft                           |
| `ct.gold-soft-hover`                   | `rgba(217,164,65,0.15)`  | Gold soft hover                     |
| `ct.gold-border`                       | `rgba(217,164,65,0.24)`  | Gold border                         |
| `ct.gold-border-hover`                 | `rgba(217,164,65,0.36)`  | Gold border hover                   |
| **Hovers/tints subtis**                |                          |                                     |
| `ct.hover-soft`                        | `rgba(144,184,248,0.08)` | Hover soft                          |
| `ct.hover-softer`                      | `rgba(144,184,248,0.05)` | Hover softer                        |
| `ct.card-tint`                         | `rgba(144,184,248,0.06)` | Tint de card                        |

> **Sincronia obrigatória**: qualquer mudança em [tokens.css](../src/assets/styles/tokens.css)
> deve refletir aqui em `ct.*` e vice-versa. As views legadas ainda
> referenciam `var(--ct-*)`, então tokens.css continua sendo fonte de
> verdade — `tailwind.config.cjs` é o espelho.

### Breakpoint extra

| Breakpoint | Min-width | Uso                                                                                             |
| ---------- | --------- | ----------------------------------------------------------------------------------------------- |
| `auth-md`  | `900px`   | Match de `@media (max-width: 900px)` legado. Use como `max-auth-md:` para `(max-width: 899px)`. |

Defaults Tailwind preservados (`sm` 640px, `md` 768px, `lg` 1024px,
`xl` 1280px, `2xl` 1536px). Use `max-sm:`, `max-xl:`, etc. para
queries reversas.

---

## 3. Padrões reutilizáveis em `@layer components`

Definidos em [src/assets/styles/app.css](../src/assets/styles/app.css).
Use como classe **adicional** ao lado da classe BEM contratual:

```html
<input class="auth-input auth-input-base" id="…" />
<label class="auth-label auth-label-base auth-label-base--first" for="…">…</label>
<button class="auth-btn auth-btn--secondary auth-btn-base auth-btn-base--secondary">…</button>
```

### Inventário

| Classe                                                                                                                                                                                       | Quando usar                                                                            | Equivalente Tailwind direto                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.auth-input-base`                                                                                                                                                                           | Input de texto/email/senha sobre fundo dark navy                                       | `tw-w-full tw-h-12 tw-px-3.5 tw-rounded-xl tw-text-[14.5px] tw-outline-none tw-transition-[border-color,box-shadow,background] tw-duration-150` + bg `rgba(6,14,28,0.7)`, border `rgba(120,170,230,0.1)`, focus `rgba(77,147,255,0.55)` |
| `.auth-label-base`                                                                                                                                                                           | Label de form sobre fundo dark                                                         | `tw-block tw-text-[12.5px] tw-font-semibold tw-text-landing-text-body tw-mt-3.5 tw-mb-[7px] tw-tracking-[0.01em]`                                                                                                                       |
| `.auth-label-base--first`                                                                                                                                                                    | Modificador do label que vem como primeiro item (zera margin-top)                      | `tw-mt-0`                                                                                                                                                                                                                               |
| `.auth-btn-base`                                                                                                                                                                             | CTA secundário em form auth (Entrar no app, Criar conta, Enviar link, Atualizar senha) | `tw-w-full tw-mt-5 tw-rounded-xl tw-h-[50px] tw-text-[14.5px] tw-font-bold tw-flex tw-items-center tw-justify-center tw-gap-2.5 tw-cursor-pointer hover:tw--translate-y-px active:tw-translate-y-0` + bg/border/box-shadow específicos  |
| `.auth-btn-base--secondary`                                                                                                                                                                  | Variante mais transparente                                                             | bg `rgba(7,21,40,0.48)` + hover border `rgba(64,196,255,0.58)`                                                                                                                                                                          |
| `.auth-btn-base.is-busy` (`.is-busy::after` também)                                                                                                                                          | Estado loading durante `runAsyncAction` (cursor progress + spinner 12×12)              | Não tem equivalente direto — usa `@keyframes button-spin`                                                                                                                                                                               |
| `.auth-btn-forgot.is-busy` (idem `::after`)                                                                                                                                                  | Idem para botão `.auth-btn-forgot` (espelha `.auth-btn-base.is-busy`)                  | —                                                                                                                                                                                                                                       |
| `.auth-google-base`                                                                                                                                                                          | CTA branco com G colorido (Google sign-in/up)                                          | `tw-w-full tw-rounded-2xl tw-h-[52px] tw-text-[15px] tw-font-extrabold tw-flex tw-items-center tw-justify-center tw-gap-3` + gradient white→#e9eef7 + box-shadow cyan glow                                                              |
| `.auth-screen-bg`, `.auth-screen-grid::before`                                                                                                                                               | Background do overlay raiz (gradient navy + grid mask radial)                          | Únicos no Login; arbitrary value seria de 200+ chars.                                                                                                                                                                                   |
| `.auth-card-bg`, `.auth-card-glow::before`                                                                                                                                                   | Card do form com glow gradient via mask-composite                                      | Únicos; ::before com mask não traduz para utilities                                                                                                                                                                                     |
| `.auth-tab-pill`, `.auth-tab.active`                                                                                                                                                         | Container das tabs e estado ativo                                                      | Únicos                                                                                                                                                                                                                                  |
| `.auth-trust-card-bg`, `.auth-trust-card-icon-bg`                                                                                                                                            | Pill verde "Acesso seguro e criptografado"                                             | Únicos                                                                                                                                                                                                                                  |
| `.auth-phone-bg`, `.auth-phone-notch::before`, `.auth-phone-screen-bg`, `.auth-phone-hero-bg`, `.auth-phone-card-bg`, `.auth-phone-card-bg--alt`, `.auth-phone-kpi-bg`, `.auth-phone-nav-bg` | Mockup do phone (decorativo, `aria-hidden`)                                            | Únicos                                                                                                                                                                                                                                  |
| `.auth-strength-seg-empty`                                                                                                                                                                   | Estado vazio do segment do strength meter                                              | `tw-bg-landing-border-base/10` daria, mas o JS sobrescreve `style.background` por score, então fica como classe                                                                                                                         |
| `.auth-screen :is(button,input,[role='tab'],a):focus-visible`                                                                                                                                | Focus visible global do overlay                                                        | Não cabe em utility (escopa em descendentes)                                                                                                                                                                                            |
| `.auth-phone__nav-item.is-active`                                                                                                                                                            | Estado active do nav item phone                                                        | `tw-text-landing-cyan`, mas JS toggla a classe                                                                                                                                                                                          |

### Quando criar novo padrão em `@layer components`

Use o critério **3+ ocorrências** para padrões verdadeiros, e o critério
**arbitrary value > ~100 chars** para extrair backgrounds/gradients/
pseudo-elements únicos. Sempre comente a origem (qual view/PR
introduziu) na regra para facilitar limpeza futura.

Quando criar novo padrão para uma view, **adicione um modifier no
nome** que indique a view: `.dash-card-base`, `.equip-hero-bg`, etc.
Mantém escopo claro e evita colisões entre views.

---

## 4. Padrão de uso BEM + Tailwind

### Regra

**Classes BEM (`auth-*`, `equip-*`, `dash-*`, etc.) permanecem como
contratos. Classes `tw-*` aplicam estilo. NÃO remover as BEM mesmo que
pareça redundante.**

### Por quê

1. **Testes**: ~30 asserções em [authscreen.redesign.test.js](../src/__tests__/authscreen.redesign.test.js)
   verificam classes como `.auth-screen`, `.auth-stage`,
   `.auth-brand__headline`, `.auth-tabs`, etc. Outras views têm padrão
   similar.
2. **JS lifecycle**: `querySelector('.auth-input')`,
   `querySelectorAll('.auth-input-wrap')`, `classList.toggle('active')`,
   `getElementById` etc. dependem das classes/IDs BEM.
3. **CSS legado em outros arquivos**: pode haver regras `.auth-input`
   em CSS que ainda não inventariamos (e.g. acessibilidade global,
   print stylesheet). Manter a classe é seguro.
4. **Auditoria visual**: dev-tools fica mais legível com classes
   semânticas (`auth-card`) do que com 30 utilities anônimas.

### Exemplo

```html
<!-- BEM (contrato) + Tailwind (estilo) -->
<input class="auth-input auth-input-base" id="signin-email" type="email" />
```

A classe `auth-input` continua sendo:

- Selector pelo JS: `overlay.querySelector('.auth-input')`
- Fallback para se Tailwind quebrar (continua "input" semanticamente)
- Hook para regras CSS futuras se virarem necessárias (ex: print)

A classe `auth-input-base` é onde mora o estilo (via `@apply` em
`@layer components`).

### Não-exemplos

❌ Trocar `.auth-input` por `.tw-form-input` (quebra teste)
❌ Trocar `class="auth-input"` por classes utility puras inline (perde
o contrato BEM, não passa nos testes)
❌ Renomear `.auth-input-base` para `.auth-input` (compete com
selector legado, gera ambiguidade de cascata)

---

## 5. Ordem sugerida de migração das próximas views

Organizada por (a) menor risco → maior risco, (b) progressão natural
de fluxo de UI:

| #   | View             | Arquivo principal                                                                                                         | Complexidade | Notas                                                                                                                     |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- | :----------: | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | **ProfileModal** | [src/ui/components/onboarding/profileModal.js](../src/ui/components/onboarding/profileModal.js)                           |    Baixa     | Modal isolado, pequeno. Valida o padrão em escopo pequeno antes de mergulhar em first-time experience com sub-componentes |
| 2   | **Onboarding**   | [src/ui/components/onboarding.js](../src/ui/components/onboarding.js) + [`onboarding/`](../src/ui/components/onboarding/) |    Média     | First-time experience, alguns CSS files dedicados (`_onboarding-checklist.css`)                                           |
| 3   | **Dashboard**    | [src/ui/views/dashboard.js](../src/ui/views/dashboard.js)                                                                 |     Alta     | 1294 linhas; KPIs, charts, header global. Várias ilhas React já existem (`#dash-*-root`) — mexer só no shell vanilla      |
| 4   | **Equipamentos** | [src/ui/views/equipamentos.js](../src/ui/views/equipamentos.js)                                                           |  Muito alta  | 2493 linhas, 12 CSS files dedicados (`_equip-*`, `_setor-*`)                                                              |
| 5   | **Registro**     | [src/ui/views/registro.js](../src/ui/views/registro.js)                                                                   |  Muito alta  | 1371 linhas, fluxo crítico (PDF/WhatsApp/assinatura)                                                                      |
| 6   | **Relatórios**   | [src/ui/views/relatorio.js](../src/ui/views/relatorio.js)                                                                 |     Alta     | 1030 linhas                                                                                                               |
| 7   | **Histórico**    | [src/ui/views/historico.js](../src/ui/views/historico.js)                                                                 |     Alta     | 1582 linhas                                                                                                               |
| 8   | **Alertas**      | [src/ui/views/alertas.js](../src/ui/views/alertas.js)                                                                     |    Baixa     | Já é ilha React; shell vanilla é mínimo                                                                                   |

> **Por que ProfileModal antes de Onboarding?** Complexidade crescente.
> ProfileModal é um modal isolado pequeno — bom para validar o padrão
> de migração em escopo controlado, antes de enfrentar a Onboarding,
> que é first-time experience com vários sub-componentes (checklist,
> push opt-in, install prompt). Erros no doc/padrão aparecem com
> menos impacto na ProfileModal.

> Cada view = 1 sessão dedicada = 1 PR pequeno. **Não migrar mais de
> 1 view por sessão**, conforme regra mecânica do prompt original.

---

## 6. Regras de ouro

> ### Estilos novos vão para Tailwind. É proibido adicionar regras a `.css` custom legado.
>
> ### Edição cirúrgica em legado é permitida APENAS para remoção de seletores migrados, e apenas com aprovação visual humana.

Detalhes:

- **Não** adicione novas regras a `redesign.css`,
  `internal-top-polish.css`, `theme-premium.css`, `components.css`,
  `layout.css`, `clientes-premium.css`, `ux-polish.css`,
  `desktop-fonts.css`, `tokens.css`, `base.css` ou qualquer arquivo em
  `src/assets/styles/components/`. Está tudo congelado conforme
  [css-freeze-policy.md](migration/css-freeze-policy.md).
- **Não** use `!important` em estilo novo. Se você sentir vontade, é
  sinal de que está fazendo errado — pare e reporte.
- **Não** edite `tokens.css` (mesmo durante migração). Os tokens
  espelhados em `tailwind.config.cjs > colors.ct.*` é onde adicionar
  novos.
- **Aprovação visual humana** (do dono do projeto) é obrigatória
  antes de remover qualquer regra `.X-*` legada de `components.css`
  ou outros arquivos. Sem exceção.
- **Não pushar** para `main` nem para a branch da migração no remoto
  sem autorização explícita.

---

## 7. Status atual da migração CSS → Tailwind

### Linha do tempo

| Etapa          | Commit        | Branch        | O que fechou                                                                                                            |
| -------------- | ------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **E1 — Setup** | `f784767`     | `style-reset` | Tailwind config estendido (tokens `ct.*`), `app.css` criado, importado em `src/app.js`, `@tailwindcss/vite` v4 removido |
| **E2 — Login** | `17a3b0a`     | `style-reset` | `authscreen.js` + `passwordRecoveryModal.js` migrados; 17 blocos `.auth-*` removidos de `components.css`                |
| **E3 — Doc**   | _este commit_ | `style-reset` | Padrão documentado                                                                                                      |

### Views

| View                                                 | Status          |
| ---------------------------------------------------- | --------------- |
| Login (overlay `auth-screen`)                        | ✅ migrada (E2) |
| `passwordRecoveryModal` (reset email + new password) | ✅ migrada (E2) |
| Onboarding                                           | ⏳ pendente     |
| ProfileModal                                         | ⏳ pendente     |
| Dashboard                                            | ⏳ pendente     |
| Equipamentos                                         | ⏳ pendente     |
| Registro                                             | ⏳ pendente     |
| Relatórios                                           | ⏳ pendente     |
| Histórico                                            | ⏳ pendente     |
| Alertas (shell vanilla)                              | ⏳ pendente     |

### Tamanho de `components.css`

| Momento                                          |     Linhas |        Δ |
| ------------------------------------------------ | ---------: | -------: |
| Antes da branch `style-reset` (commit `3a27d54`) | **20.732** |        — |
| Após Etapa 2                                     | **20.621** | **−111** |

> **Como medir**: a contagem é feita após `npm run format` (prettier
> `--write`), porque o pre-commit hook normaliza arquivos antes de
> commitar. A diferença entre o `--stat` bruto do `git diff`
> (`-127` net deletions na E2) e os `−111` finais vem dessas
> normalizações idempotentes do prettier (quebras de linha,
> alinhamento de tabelas, etc.) em outras partes do mesmo arquivo.

#### Detalhamento da Etapa 2 — remoções por componente

Refere-se a linhas em `src/assets/styles/components.css` no commit
base `3a27d54`. Todos os seletores listados foram removidos no
commit E2 (`17a3b0a`).

| Componente migrado            | Seletores `.auth-*` removidos                                                                                                                                                                                                                                           | Linhas no `3a27d54` |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Login (`authscreen.js`)**   | `.auth-label`, `.auth-input`, `.auth-input:focus`, `.auth-input::placeholder`, `.auth-btn`, `.auth-btn:hover`, `.auth-btn:disabled, .auth-btn-forgot:disabled`, `.auth-hint`, `.auth-hint--tight`, `.auth-actions-center`, `.auth-btn-forgot`, `.auth-btn-forgot:hover` | 9036–9132           |
| **passwordRecoveryModal**     | `.auth-recovery-modal-overlay`, `.auth-recovery-modal`, `.auth-recovery-modal__title`, `.auth-recovery-modal__actions`                                                                                                                                                  | 9134–9157           |
| **Compartilhada (cirúrgica)** | `.auth-btn.is-busy` e `.auth-btn-forgot.is-busy` removidos da lista de seletores em `.btn.is-busy { … }` e `.btn.is-busy::after { … }`. `.btn.is-busy` e `.btn.is-busy::after` permanecem **intactos** (contrato vivo do `.btn` legado).                                | 8959–8976           |

> Não removemos os outros 22 arquivos CSS legados (incluindo
> `_clientes.css`, `_pmoc.css`, `_setor-card.css`, etc.) porque eles
> servem outras views ainda não migradas.

---

## 8. Notas técnicas aprendidas no Login

Decisões não óbvias que vale registrar para próximas sessões.

### (a) `@apply` nem sempre cabe em gradientes/pseudo-elementos complexos

Tailwind v3 `@apply` funciona bem para conjuntos de utilities simples:

```css
.auth-label-base {
  @apply tw-block tw-text-[12.5px] tw-font-semibold tw-text-landing-text-body;
}
```

Mas **não** para:

- Gradientes multi-stop com radial overlapping (`auth-screen-bg`):
  Tailwind tem `bg-gradient-to-*`, mas múltiplos `radial-gradient` +
  `linear-gradient` empilhados não cabem em `@apply` sem virar uma
  string monstro. **Solução**: CSS puro dentro do `@layer components`.
- Pseudo-elementos `::before`/`::after` com `mask-composite`,
  `-webkit-mask`, e content gerado: também não cabem em `@apply`.
  **Solução**: CSS puro com `content: '';` etc.
- Animations com `@keyframes` referenciado: `@apply` não importa
  keyframe; precisa estar no mesmo arquivo CSS.

Para esses casos: **CSS puro dentro do `@layer components`** ou
**fora dele** se for `@keyframes` (ver (d) abaixo).

### (b) Classes BEM permanecem como contrato JS/teste

Já documentado em §4 acima — repetindo a essência:

> Trocar `class="auth-input"` por `class="tw-form-input"` quebra
> testes E2E + querySelectors do JS + plano de cleanup do CSS legado.

Estratégia única e correta: **manter BEM, adicionar `-base` ou
classe utility próximas**.

### (c) Tratamento cirúrgico de regras compartilhadas

Regras como `.btn.is-busy, .auth-btn.is-busy, .auth-btn-forgot.is-busy
{ … }` em `components.css` têm seletor compartilhado. Se você
**remove o bloco inteiro**, mata o `.btn.is-busy` que continua sendo
contrato vivo do `.btn` legado em todo o app.

**Padrão correto**: edição cirúrgica da lista de seletores. Tira
apenas os que migraram, deixa o resto.

```diff
-.btn.is-busy,
-.auth-btn.is-busy,
-.auth-btn-forgot.is-busy {
+.btn.is-busy {
   cursor: progress;
 }
```

Ao mesmo tempo, **antes de tirar do legado**, **porte** a regra para
`@layer components` no `app.css` com seletor migrado:

```css
.auth-btn-base.is-busy,
.auth-btn-forgot.is-busy {
  cursor: progress;
}
```

(Repare que `.auth-btn-forgot.is-busy` continua aparecendo lá — porque
ele ainda existe no DOM como classe BEM, e queremos que o estado
loading continue funcionando.)

### (d) `@keyframes` ficam fora de `@layer`

Spec do CSS não permite `@keyframes` dentro de `@layer`. Se você
tentar:

```css
@layer components {
  @keyframes button-spin {
    /* ... */
  } /* ❌ inválido */
}
```

O parser vai descartar o keyframe ou tratar errado. **Padrão
correto**: definir `@keyframes` no escopo top-level do CSS, fora dos
blocos `@layer`:

```css
@layer components {
  .auth-btn-base.is-busy::after {
    animation: button-spin 0.65s linear infinite;
  }
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}
```

CSS aceita keyframes redefinidos com mesmo nome em arquivos
diferentes. Por isso, ao portar uma animação de `components.css` para
`app.css`, **redefinir** lá é seguro mesmo que `components.css` ainda
contenha o original — a definição mais próxima do contexto vence.

### (e) Cascata Vite: `index.css` carrega após `<link>`s

O `app.css` é importado via `import './assets/styles/app.css'` em
`src/app.js`. Vite bundlea isso em um chunk CSS (`index.*.css` no
dist) que é carregado **após** os `<link>` do `index.html` (que
carregam `components.css`, `layout.css`, etc.).

Isso significa que `app.css` (com utilities Tailwind + `@layer
components`) sempre **vence em cascata** sobre o CSS legado de mesma
especificidade. Você pode confiar nisso, mas confirma sempre via
build + grep no dist:

```powershell
Get-ChildItem dist\assets\*.css
# index.*.css é maior; tailwind.*.css carrega em islands lazy.
```

### (f) Arbitrary opacity: `tw-bg-landing-cyan/[0.34]` vs `tw-bg-landing-cyan/34`

Para fração padrão (5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90,
95, 100), use o atalho:

```html
class="tw-bg-landing-cyan/10"
<!-- 0.10 -->
class="tw-bg-landing-cyan/30"
<!-- 0.30 -->
```

Para fração arbitrária (`0.08`, `0.18`, `0.34`, `0.55`, `0.82`),
use brackets:

```html
class="tw-bg-landing-cyan/[0.08]" class="tw-border-landing-cyan/[0.34]"
```

Algumas das opacities legadas (`0.06`, `0.18`, `0.28`) caem em
brackets — anote no markup quando usar.

### (g) `prefix: 'tw-'` afeta `@apply`

Quando usa `@apply` dentro de `@layer components`:

```css
.auth-input-base {
  @apply tw-w-full tw-h-12; /* ✅ com prefixo */
}
```

NÃO escreva `@apply w-full h-12` (sem prefixo) — não funciona neste
projeto porque o `prefix: 'tw-'` está ativo em
[tailwind.config.cjs](../tailwind.config.cjs#L9).

---

## 9. Checklist para a próxima view

Roteiro passo a passo. Marque cada item ao concluir.

### Antes de começar

- [ ] Leia este doc inteiro. Releia se for sua segunda+ migração.
- [ ] Confirme que está na branch `style-reset` (não em `main`).
- [ ] Working tree limpo (`git status` vazio).
- [ ] `npm run check` passa antes de qualquer mudança (baseline).
- [ ] Capture **baseline visual** antes de tocar em qualquer linha
      da view, pelo padrão abaixo.

#### Convenção de baseline visual

- **Pasta**: `_baseline/<view>/` na raiz do repo (ex.:
  `_baseline/profileModal/`, `_baseline/dashboard/`).
- **Não comitar**: o diretório `_baseline/` é local-only e fica em
  `.gitignore`. Adicione a entrada se ainda não estiver lá.
- **Viewports obrigatórios**: 3 PNGs por view, capturados com
  `npm run dev` rodando:
  - `375.png` — mobile (iPhone SE / Android compacto)
  - `1280.png` — desktop padrão (laptop comum)
  - `1920.png` — desktop largo (monitor full HD)
- **Estados a capturar**: pelo menos a tela default + os estados-chave
  da view (modal aberto, formulário com erro, loading, hover de CTA
  principal). Nomeie `<viewport>-<estado>.png`, e.g. `1280-error.png`.
- **Uso**: durante a migração e no momento da revalidação visual,
  compare side-by-side com a versão pós-migração. Tem que estar
  visualmente equivalente — não necessariamente idêntico ao pixel
  (Tailwind pode mudar arredondamento de 0.5px, anti-alias, etc.).
- **Quando descartar**: depois da remoção do legado validada,
  apague a pasta `_baseline/<view>/`. Sem PNGs órfãos no working
  tree.

### Reconhecimento (read-only)

- [ ] Identifique os arquivos da view: `src/ui/views/<nome>.js` (ou
      `src/ui/components/<nome>.js`), e qualquer subdiretório
      relacionado.
- [ ] `grep` por classes BEM exclusivas da view (`.<prefix>-`) em
      `src/assets/styles/**/*.css`. Liste seletores + linhas.
- [ ] Verifique se há `<style>` inline na view (template literal). Se
      sim, é o "Login pattern" (CSS auto-contido).
- [ ] Identifique testes que asseguram classes BEM como contratos.
      Lista deles em `src/__tests__/<nome>*.test.js`.
- [ ] Reporte o achado e **espere confirmação** antes de seguir.

### Migração

- [ ] Estenda `tailwind.config.cjs > colors` apenas se houver tokens
      novos com chance de reuso. Aposte em `landing.*` ou `ct.*`. Não
      crie namespaces específicos da view sem necessidade.
- [ ] Crie classes `.<view>-*-base` em `@layer components` apenas
      para padrões 3+x ou para gradientes/pseudo complexos. Comente
      origem.
- [ ] Migre o markup adicionando `tw-*` ao lado das classes BEM
      existentes. **Nunca remova BEM.**
- [ ] Se tiver `<style>` inline na view, remove ele depois de
      migrado o markup.
- [ ] Não toque em handlers, querySelectors, IDs, data-\*,
      `classList.toggle()`, fluxos de auth/storage/PDF/etc. Só
      `class=`.
- [ ] Se uma regra usa `classList.toggle('active')`, o estilo do
      ativo entra em `@layer components` como `.<bem-class>.active`
      (não como `tw-aria-selected:*` ou variant). Documenta no
      comentário do bloco.

### Validação

- [ ] `npm run build` — limpo.
- [ ] Grep no `dist/assets/*.css` confirma que classes do `@layer`
      foram geradas.
- [ ] Suba `npm run dev` e teste manualmente os fluxos da view.
      Captura screenshots e compara com baseline.
- [ ] Rode os testes: `npx vitest run src/__tests__/<view>*.test.js`.
      Tem que passar 100%.

### Limpeza do legado (apenas após aprovação visual humana)

- [ ] Liste os seletores `.<prefix>-*` candidatos a remoção, com
      linhas exatas.
- [ ] **Pare e peça aprovação visual humana** explícita.
- [ ] Edição cirúrgica para regras com seletores compartilhados
      (`.btn.is-busy, .X-btn.is-busy, …`): tire apenas os
      seletores migrados.
- [ ] Remoção de blocos inteiros para regras 100% exclusivas.
- [ ] **Não edite `tokens.css`. Não edite `redesign.css`. Não edite
      qualquer outro arquivo CSS legado fora do escopo da view.**
- [ ] Build + check + testes anti-regressão depois da remoção.

### Encerramento

- [ ] Atualize a tabela de status em §7 deste doc (`view → ✅
migrada (Eᴺ)`).
- [ ] Atualize a tabela de tamanho de `components.css` em §7.
- [ ] Adicione novos padrões/tokens criados às tabelas em §2 e §3.
- [ ] Se aprendeu algo não óbvio, adicione em §8 (Notas técnicas
      aprendidas).
- [ ] Commit em uma mensagem por sub-step:
      `chore(styles): bootstrap <view>` (se houver),
      `refactor(<view>): migrar para tailwind e remover css legado`,
      `docs(styles): atualizar guia com aprendizados de <view>`.
- [ ] **Não pushe** sem autorização explícita.

---

## Referências cruzadas

- [docs/migration/css-freeze-policy.md](migration/css-freeze-policy.md)
  — política formal de congelamento do CSS legado (2026-05-01).
- [docs/migration/css-legacy-inventory.md](migration/css-legacy-inventory.md)
  — inventário das famílias CSS por prefixo.
- [docs/migration/react-tailwind-cleanup-plan.md](migration/react-tailwind-cleanup-plan.md)
  — plano de cleanup pós-migração das ilhas React (já concluída).
- [docs/migration/react-tailwind-final-status.md](migration/react-tailwind-final-status.md)
  — status final da migração visual React + Tailwind.
- [src/react/README.md](../src/react/README.md) — regras do subset React.
- [src/assets/styles/tokens.css](../src/assets/styles/tokens.css)
  — fonte de verdade dos tokens `--ct-*`.
- [tailwind.config.cjs](../tailwind.config.cjs) — config Tailwind.
- [src/assets/styles/app.css](../src/assets/styles/app.css) — entry CSS
  da app vanilla.
- [src/react/styles/tailwind.css](../src/react/styles/tailwind.css)
  — entry CSS dos islands React.
