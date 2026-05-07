# Audit de cores — seções 3 e 4

- Worktree: /home/user/Cool_Track_Pro
- Branch: claude/fix-desktop-dark-theme-SObCy
- Commit: abfec21
- Total de tokens declarados em tokens.css: 127
- Total de declarações fora de tokens.css: 335
- Total DUP-DIFF (crítico): 99
- Total DUP-SAME (trivial): 0
- Total NEW (token local): 236

## 3. Tokens declarados em `src/assets/styles/tokens.css`

| Token                         | Valor                              | Linha | Bloco                                                                              |
| ----------------------------- | ---------------------------------- | ----: | ---------------------------------------------------------------------------------- |
| `--ct-brand`                  | `#22d3ee`                          |    32 | `:root`                                                                            |
| `--ct-brand-hover`            | `#67e8f9`                          |    33 | `:root`                                                                            |
| `--ct-brand-text`             | `#0e7490`                          |    34 | `:root`                                                                            |
| `--ct-brand-soft`             | `rgba(34, 211, 238, 0.08)`         |    35 | `:root`                                                                            |
| `--ct-brand-soft-hover`       | `rgba(34, 211, 238, 0.12)`         |    36 | `:root`                                                                            |
| `--ct-brand-soft-strong`      | `rgba(34, 211, 238, 0.16)`         |    37 | `:root`                                                                            |
| `--ct-brand-border`           | `rgba(34, 211, 238, 0.18)`         |    38 | `:root`                                                                            |
| `--ct-brand-light`            | `#67e8f9`                          |    39 | `:root`                                                                            |
| `--ct-brand-shadow`           | `rgba(34, 211, 238, 0.3)`          |    40 | `:root`                                                                            |
| `--ct-brand-strong`           | `rgba(34, 211, 238, 0.6)`          |    41 | `:root`                                                                            |
| `--ct-brand-border-hover`     | `rgba(34, 211, 238, 0.3)`          |    42 | `:root`                                                                            |
| `--ct-bg`                     | `#090c10`                          |    45 | `:root`                                                                            |
| `--ct-surface`                | `#161b22`                          |    46 | `:root`                                                                            |
| `--ct-surface-elev`           | `#1c2330`                          |    47 | `:root`                                                                            |
| `--ct-surface-hover`          | `#222b3a`                          |    48 | `:root`                                                                            |
| `--ct-border`                 | `rgba(34, 211, 238, 0.16)`         |    49 | `:root`                                                                            |
| `--ct-border-strong`          | `rgba(34, 211, 238, 0.24)`         |    50 | `:root`                                                                            |
| `--ct-text`                   | `#e6edf3`                          |    53 | `:root`                                                                            |
| `--ct-text-muted`             | `#b5c2d1`                          |    54 | `:root`                                                                            |
| `--ct-text-faint`             | `#9aa4b2`                          |    55 | `:root`                                                                            |
| `--ct-text-ghost`             | `#7d8898`                          |    56 | `:root`                                                                            |
| `--ct-primary`                | `var(--ct-brand)`                  |    59 | `:root`                                                                            |
| `--ct-success`                | `#16a34a`                          |    60 | `:root`                                                                            |
| `--ct-danger`                 | `#dc2626`                          |    61 | `:root`                                                                            |
| `--ct-warning`                | `#d97706`                          |    62 | `:root`                                                                            |
| `--ct-surface-2`              | `var(--ct-surface-elev)`           |    63 | `:root`                                                                            |
| `--ct-text-2`                 | `var(--ct-text-muted)`             |    64 | `:root`                                                                            |
| `--ct-text-3`                 | `var(--ct-text-faint)`             |    65 | `:root`                                                                            |
| `--ct-success`                | `#16a34a`                          |    68 | `:root`                                                                            |
| `--ct-success-soft`           | `#d6f4e1`                          |    69 | `:root`                                                                            |
| `--ct-warn`                   | `#d97706`                          |    70 | `:root`                                                                            |
| `--ct-warn-soft`              | `#fde9c8`                          |    71 | `:root`                                                                            |
| `--ct-error`                  | `#dc2626`                          |    72 | `:root`                                                                            |
| `--ct-error-soft`             | `#fcdcdc`                          |    73 | `:root`                                                                            |
| `--ct-whatsapp`               | `#4fa779`                          |    74 | `:root`                                                                            |
| `--ct-whatsapp-soft`          | `rgba(79, 167, 121, 0.12)`         |    75 | `:root`                                                                            |
| `--ct-gold`                   | `#d9a441`                          |    77 | `:root`                                                                            |
| `--ct-gold-soft`              | `rgba(217, 164, 65, 0.1)`          |    78 | `:root`                                                                            |
| `--ct-gold-soft-hover`        | `rgba(217, 164, 65, 0.15)`         |    79 | `:root`                                                                            |
| `--ct-gold-border`            | `rgba(217, 164, 65, 0.24)`         |    80 | `:root`                                                                            |
| `--ct-gold-border-hover`      | `rgba(217, 164, 65, 0.36)`         |    81 | `:root`                                                                            |
| `--ct-hover-soft`             | `rgba(47, 123, 255, 0.06)`         |    84 | `:root`                                                                            |
| `--ct-hover-softer`           | `rgba(47, 123, 255, 0.035)`        |    85 | `:root`                                                                            |
| `--ct-card-tint`              | `rgba(47, 123, 255, 0.025)`        |    86 | `:root`                                                                            |
| `--primary`                   | `var(--ct-brand)`                  |    95 | `:root`                                                                            |
| `--primary-strong`            | `var(--ct-brand-hover)`            |    96 | `:root`                                                                            |
| `--primary-soft`              | `var(--ct-brand-soft)`             |    97 | `:root`                                                                            |
| `--primary-dim`               | `rgba(47, 123, 255, 0.08)`         |    98 | `:root`                                                                            |
| `--bg`                        | `var(--ct-bg)`                     |   101 | `:root`                                                                            |
| `--bg-soft`                   | `var(--ct-surface)`                |   102 | `:root`                                                                            |
| `--surface`                   | `var(--ct-surface)`                |   103 | `:root`                                                                            |
| `--surface-2`                 | `var(--ct-surface-elev)`           |   104 | `:root`                                                                            |
| `--surface-3`                 | `var(--ct-surface-hover)`          |   105 | `:root`                                                                            |
| `--surface-strong`            | `var(--ct-surface-elev)`           |   106 | `:root`                                                                            |
| `--card`                      | `var(--ct-surface)`                |   107 | `:root`                                                                            |
| `--card-hover`                | `var(--ct-surface-elev)`           |   108 | `:root`                                                                            |
| `--border`                    | `var(--ct-border)`                 |   111 | `:root`                                                                            |
| `--border-2`                  | `var(--ct-border-strong)`          |   112 | `:root`                                                                            |
| `--border-strong`             | `var(--ct-border-strong)`          |   113 | `:root`                                                                            |
| `--border-focus`              | `rgba(47, 123, 255, 0.45)`         |   114 | `:root`                                                                            |
| `--text`                      | `var(--ct-text)`                   |   117 | `:root`                                                                            |
| `--text-2`                    | `var(--ct-text-muted)`             |   118 | `:root`                                                                            |
| `--text-3`                    | `var(--ct-text-faint)`             |   119 | `:root`                                                                            |
| `--text-muted`                | `var(--ct-text-muted)`             |   120 | `:root`                                                                            |
| `--muted`                     | `var(--ct-text-faint)`             |   121 | `:root`                                                                            |
| `--muted-light`               | `var(--ct-text-ghost)`             |   122 | `:root`                                                                            |
| `--white`                     | `var(--ct-text)`                   |   123 | `:root`                                                                            |
| `--success`                   | `var(--ct-success)`                |   126 | `:root`                                                                            |
| `--success-soft`              | `var(--ct-success-soft)`           |   127 | `:root`                                                                            |
| `--success-dim`               | `rgba(63, 182, 139, 0.06)`         |   128 | `:root`                                                                            |
| `--warning`                   | `var(--ct-warn)`                   |   129 | `:root`                                                                            |
| `--warning-soft`              | `var(--ct-warn-soft)`              |   130 | `:root`                                                                            |
| `--warning-dim`               | `rgba(212, 148, 71, 0.06)`         |   131 | `:root`                                                                            |
| `--danger`                    | `var(--ct-error)`                  |   132 | `:root`                                                                            |
| `--danger-soft`               | `var(--ct-error-soft)`             |   133 | `:root`                                                                            |
| `--danger-dim`                | `rgba(217, 84, 77, 0.06)`          |   134 | `:root`                                                                            |
| `--neon-cyan`                 | `var(--ct-brand)`                  |   137 | `:root`                                                                            |
| `--neon-cyan-soft`            | `var(--ct-brand-soft)`             |   138 | `:root`                                                                            |
| `--neon-cyan-glow`            | `var(--ct-brand-soft-hover)`       |   139 | `:root`                                                                            |
| `--neon-cyan-faint`           | `rgba(47, 123, 255, 0.08)`         |   140 | `:root`                                                                            |
| `--neon-green`                | `var(--ct-success)`                |   141 | `:root`                                                                            |
| `--neon-green-soft`           | `var(--ct-success-soft)`           |   142 | `:root`                                                                            |
| `--neon-green-glow`           | `rgba(63, 182, 139, 0.18)`         |   143 | `:root`                                                                            |
| `--neon-red`                  | `var(--ct-error)`                  |   144 | `:root`                                                                            |
| `--neon-red-soft`             | `var(--ct-error-soft)`             |   145 | `:root`                                                                            |
| `--neon-red-glow`             | `rgba(217, 84, 77, 0.18)`          |   146 | `:root`                                                                            |
| `--neon-amber`                | `var(--ct-warn)`                   |   147 | `:root`                                                                            |
| `--neon-amber-soft`           | `var(--ct-warn-soft)`              |   148 | `:root`                                                                            |
| `--surface-premium`           | `var(--ct-bg)`                     |   151 | `:root`                                                                            |
| `--surface-card`              | `var(--ct-surface)`                |   152 | `:root`                                                                            |
| `--surface-card-hover`        | `var(--ct-surface-elev)`           |   153 | `:root`                                                                            |
| `--surface-elevated`          | `var(--ct-surface-elev)`           |   154 | `:root`                                                                            |
| `--border-premium`            | `var(--ct-border)`                 |   155 | `:root`                                                                            |
| `--border-premium-hover`      | `var(--ct-border-strong)`          |   156 | `:root`                                                                            |
| `--secondary`                 | `var(--ct-text-faint)`             |   159 | `:root`                                                                            |
| `--ct-bg`                     | `#f7f8fb`                          |   167 | `[data-theme='light']`                                                             |
| `--ct-surface`                | `#161b22`                          |   168 | `[data-theme='light']`                                                             |
| `--ct-surface-elev`           | `#f1f3f8`                          |   169 | `[data-theme='light']`                                                             |
| `--ct-surface-hover`          | `#e9edf3`                          |   170 | `[data-theme='light']`                                                             |
| `--ct-border`                 | `#e4e7ee`                          |   171 | `[data-theme='light']`                                                             |
| `--ct-border-strong`          | `#c7cdd8`                          |   172 | `[data-theme='light']`                                                             |
| `--ct-text`                   | `#1a1d26`                          |   173 | `[data-theme='light']`                                                             |
| `--ct-text-muted`             | `#5a6173`                          |   174 | `[data-theme='light']`                                                             |
| `--ct-text-faint`             | `#5b6478`                          |   175 | `[data-theme='light']`                                                             |
| `--ct-text-ghost`             | `#b5bac8`                          |   176 | `[data-theme='light']`                                                             |
| `--ct-brand`                  | `#0891b2`                          |   177 | `[data-theme='light']`                                                             |
| `--ct-brand-text`             | `#0e7490`                          |   178 | `[data-theme='light']`                                                             |
| `--ct-hover-soft`             | `rgba(0, 0, 0, 0.04)`              |   179 | `[data-theme='light']`                                                             |
| `--ct-hover-softer`           | `rgba(0, 0, 0, 0.02)`              |   180 | `[data-theme='light']`                                                             |
| `--ct-card-tint`              | `rgba(0, 0, 0, 0.015)`             |   181 | `[data-theme='light']`                                                             |
| `--ct-desktop-text-primary`   | `#e6edf3`                          |   191 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-desktop-text-secondary` | `#c8d4e3`                          |   192 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-desktop-text-tertiary`  | `#adbac7`                          |   193 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-desktop-text-disabled`  | `#98a6b7`                          |   194 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-desktop-brand-text`     | `#7dd3fc`                          |   195 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-text`                   | `var(--ct-desktop-text-primary)`   |   197 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-text-muted`             | `var(--ct-desktop-text-secondary)` |   198 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-text-faint`             | `var(--ct-desktop-text-tertiary)`  |   199 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-text-ghost`             | `var(--ct-desktop-text-disabled)`  |   200 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--ct-brand-text`             | `var(--ct-desktop-brand-text)`     |   201 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--text`                      | `var(--ct-desktop-text-primary)`   |   203 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--text-2`                    | `var(--ct-desktop-text-secondary)` |   204 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--text-3`                    | `var(--ct-desktop-text-tertiary)`  |   205 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--text-muted`                | `var(--ct-desktop-text-secondary)` |   206 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--muted`                     | `var(--ct-desktop-text-tertiary)`  |   207 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--muted-light`               | `var(--ct-desktop-text-disabled)`  |   208 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |
| `--secondary`                 | `var(--ct-desktop-text-tertiary)`  |   209 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])` |

## 4. Declarações fora de tokens.css

### 4.1 base.css

#### 4.1.1 DUP-DIFF (token existe em tokens.css com valor DIFERENTE — CRÍTICO)

| Token              | Valor canônico (tokens.css)                                                                                                                            | Valor declarado (base.css)  | Linha | Bloco em base.css      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ----: | ---------------------- |
| `--bg`             | `var(--ct-bg)` (:root)                                                                                                                                 | `#07111f`                   |     8 | `:root`                |
| `--bg-soft`        | `var(--ct-surface)` (:root)                                                                                                                            | `#0c1929`                   |     9 | `:root`                |
| `--surface`        | `var(--ct-surface)` (:root)                                                                                                                            | `#0c1929`                   |    10 | `:root`                |
| `--surface-2`      | `var(--ct-surface-elev)` (:root)                                                                                                                       | `#112236`                   |    11 | `:root`                |
| `--surface-3`      | `var(--ct-surface-hover)` (:root)                                                                                                                      | `#172d45`                   |    12 | `:root`                |
| `--card`           | `var(--ct-surface)` (:root)                                                                                                                            | `#0c1929`                   |    14 | `:root`                |
| `--card-hover`     | `var(--ct-surface-elev)` (:root)                                                                                                                       | `#112236`                   |    15 | `:root`                |
| `--border`         | `var(--ct-border)` (:root)                                                                                                                             | `rgba(255, 255, 255, 0.07)` |    17 | `:root`                |
| `--border-2`       | `var(--ct-border-strong)` (:root)                                                                                                                      | `rgba(255, 255, 255, 0.12)` |    18 | `:root`                |
| `--border-focus`   | `rgba(47, 123, 255, 0.45)` (:root)                                                                                                                     | `rgba(0, 200, 232, 0.45)`   |    19 | `:root`                |
| `--primary`        | `var(--ct-brand)` (:root)                                                                                                                              | `#00c8e8`                   |    21 | `:root`                |
| `--primary-strong` | `var(--ct-brand-hover)` (:root)                                                                                                                        | `#00aac8`                   |    22 | `:root`                |
| `--primary-soft`   | `var(--ct-brand-soft)` (:root)                                                                                                                         | `rgba(0, 200, 232, 0.1)`    |    23 | `:root`                |
| `--primary-dim`    | `rgba(47, 123, 255, 0.08)` (:root)                                                                                                                     | `rgba(0, 200, 232, 0.06)`   |    24 | `:root`                |
| `--success`        | `var(--ct-success)` (:root)                                                                                                                            | `#00c870`                   |    26 | `:root`                |
| `--success-soft`   | `var(--ct-success-soft)` (:root)                                                                                                                       | `rgba(0, 200, 112, 0.1)`    |    27 | `:root`                |
| `--success-dim`    | `rgba(63, 182, 139, 0.06)` (:root)                                                                                                                     | `rgba(0, 200, 112, 0.06)`   |    28 | `:root`                |
| `--warning`        | `var(--ct-warn)` (:root)                                                                                                                               | `#e8a020`                   |    30 | `:root`                |
| `--warning-soft`   | `var(--ct-warn-soft)` (:root)                                                                                                                          | `rgba(232, 160, 32, 0.12)`  |    31 | `:root`                |
| `--warning-dim`    | `rgba(212, 148, 71, 0.06)` (:root)                                                                                                                     | `rgba(232, 160, 32, 0.06)`  |    32 | `:root`                |
| `--danger`         | `var(--ct-error)` (:root)                                                                                                                              | `#e03040`                   |    34 | `:root`                |
| `--danger-soft`    | `var(--ct-error-soft)` (:root)                                                                                                                         | `rgba(224, 48, 64, 0.1)`    |    35 | `:root`                |
| `--danger-dim`     | `rgba(217, 84, 77, 0.06)` (:root)                                                                                                                      | `rgba(224, 48, 64, 0.06)`   |    36 | `:root`                |
| `--text`           | `var(--ct-text)` (:root) / `var(--ct-desktop-text-primary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))         | `#e8f2fa`                   |    38 | `:root`                |
| `--text-2`         | `var(--ct-text-muted)` (:root) / `var(--ct-desktop-text-secondary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])) | `#8aaac8`                   |    39 | `:root`                |
| `--text-3`         | `var(--ct-text-faint)` (:root) / `var(--ct-desktop-text-tertiary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#6a8ba8`                   |    40 | `:root`                |
| `--text-muted`     | `var(--ct-text-muted)` (:root) / `var(--ct-desktop-text-secondary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])) | `#8aaac8`                   |    41 | `:root`                |
| `--muted`          | `var(--ct-text-faint)` (:root) / `var(--ct-desktop-text-tertiary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#6a8ba8`                   |    42 | `:root`                |
| `--muted-light`    | `var(--ct-text-ghost)` (:root) / `var(--ct-desktop-text-disabled)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#5a7890`                   |    43 | `:root`                |
| `--surface-strong` | `var(--ct-surface-elev)` (:root)                                                                                                                       | `#112236`                   |    45 | `:root`                |
| `--border-strong`  | `var(--ct-border-strong)` (:root)                                                                                                                      | `rgba(255, 255, 255, 0.12)` |    46 | `:root`                |
| `--secondary`      | `var(--ct-text-faint)` (:root) / `var(--ct-desktop-text-tertiary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#4a6880`                   |    47 | `:root`                |
| `--white`          | `var(--ct-text)` (:root)                                                                                                                               | `#e8f2fa`                   |    48 | `:root`                |
| `--bg`             | `var(--ct-bg)` (:root)                                                                                                                                 | `#eff3f8`                   |   107 | `[data-theme='light']` |
| `--bg-soft`        | `var(--ct-surface)` (:root)                                                                                                                            | `#e6ecf2`                   |   108 | `[data-theme='light']` |
| `--surface`        | `var(--ct-surface)` (:root)                                                                                                                            | `#ffffff`                   |   109 | `[data-theme='light']` |
| `--surface-2`      | `var(--ct-surface-elev)` (:root)                                                                                                                       | `#eff3f8`                   |   110 | `[data-theme='light']` |
| `--surface-3`      | `var(--ct-surface-hover)` (:root)                                                                                                                      | `#e2e8ee`                   |   111 | `[data-theme='light']` |
| `--card`           | `var(--ct-surface)` (:root)                                                                                                                            | `#ffffff`                   |   113 | `[data-theme='light']` |
| `--card-hover`     | `var(--ct-surface-elev)` (:root)                                                                                                                       | `#eff3f8`                   |   114 | `[data-theme='light']` |
| `--border`         | `var(--ct-border)` (:root)                                                                                                                             | `#d8dee4`                   |   116 | `[data-theme='light']` |
| `--border-2`       | `var(--ct-border-strong)` (:root)                                                                                                                      | `#afb8c1`                   |   117 | `[data-theme='light']` |
| `--border-focus`   | `rgba(47, 123, 255, 0.45)` (:root)                                                                                                                     | `rgba(9, 105, 218, 0.45)`   |   118 | `[data-theme='light']` |
| `--primary`        | `var(--ct-brand)` (:root)                                                                                                                              | `#0096b4`                   |   120 | `[data-theme='light']` |
| `--primary-strong` | `var(--ct-brand-hover)` (:root)                                                                                                                        | `#007a96`                   |   121 | `[data-theme='light']` |
| `--primary-soft`   | `var(--ct-brand-soft)` (:root)                                                                                                                         | `rgba(0, 150, 180, 0.12)`   |   122 | `[data-theme='light']` |
| `--primary-dim`    | `rgba(47, 123, 255, 0.08)` (:root)                                                                                                                     | `rgba(0, 150, 180, 0.06)`   |   123 | `[data-theme='light']` |
| `--success`        | `var(--ct-success)` (:root)                                                                                                                            | `#1a7f37`                   |   125 | `[data-theme='light']` |
| `--success-soft`   | `var(--ct-success-soft)` (:root)                                                                                                                       | `rgba(26, 127, 55, 0.1)`    |   126 | `[data-theme='light']` |
| `--success-dim`    | `rgba(63, 182, 139, 0.06)` (:root)                                                                                                                     | `rgba(26, 127, 55, 0.05)`   |   127 | `[data-theme='light']` |
| `--warning`        | `var(--ct-warn)` (:root)                                                                                                                               | `#9a6700`                   |   129 | `[data-theme='light']` |
| `--warning-soft`   | `var(--ct-warn-soft)` (:root)                                                                                                                          | `rgba(154, 103, 0, 0.1)`    |   130 | `[data-theme='light']` |
| `--warning-dim`    | `rgba(212, 148, 71, 0.06)` (:root)                                                                                                                     | `rgba(154, 103, 0, 0.05)`   |   131 | `[data-theme='light']` |
| `--danger`         | `var(--ct-error)` (:root)                                                                                                                              | `#cf222e`                   |   133 | `[data-theme='light']` |
| `--danger-soft`    | `var(--ct-error-soft)` (:root)                                                                                                                         | `rgba(207, 34, 46, 0.08)`   |   134 | `[data-theme='light']` |
| `--danger-dim`     | `rgba(217, 84, 77, 0.06)` (:root)                                                                                                                      | `rgba(207, 34, 46, 0.04)`   |   135 | `[data-theme='light']` |
| `--text`           | `var(--ct-text)` (:root) / `var(--ct-desktop-text-primary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))         | `#0f172a`                   |   137 | `[data-theme='light']` |
| `--text-2`         | `var(--ct-text-muted)` (:root) / `var(--ct-desktop-text-secondary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])) | `#3e4c5e`                   |   138 | `[data-theme='light']` |
| `--text-3`         | `var(--ct-text-faint)` (:root) / `var(--ct-desktop-text-tertiary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#596878`                   |   139 | `[data-theme='light']` |
| `--text-muted`     | `var(--ct-text-muted)` (:root) / `var(--ct-desktop-text-secondary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])) | `#3e4c5e`                   |   140 | `[data-theme='light']` |
| `--muted`          | `var(--ct-text-faint)` (:root) / `var(--ct-desktop-text-tertiary)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#596878`                   |   141 | `[data-theme='light']` |
| `--muted-light`    | `var(--ct-text-ghost)` (:root) / `var(--ct-desktop-text-disabled)` (@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']))  | `#768496`                   |   142 | `[data-theme='light']` |
| `--surface-strong` | `var(--ct-surface-elev)` (:root)                                                                                                                       | `#e2e8ee`                   |   144 | `[data-theme='light']` |
| `--border-strong`  | `var(--ct-border-strong)` (:root)                                                                                                                      | `#afb8c1`                   |   145 | `[data-theme='light']` |
| `--white`          | `var(--ct-text)` (:root)                                                                                                                               | `#0f172a`                   |   146 | `[data-theme='light']` |

#### 4.1.3 NEW (token não existe em tokens.css — local ou candidato a subir)

| Token               | Valor                                                                 | Linha | Bloco                                | Comentário |
| ------------------- | --------------------------------------------------------------------- | ----: | ------------------------------------ | ---------- |
| `--black`           | `#07111f`                                                             |    49 | `:root`                              |            |
| `--font-display`    | `'Inter', sans-serif`                                                 |    51 | `:root`                              |            |
| `--font-body`       | `'Inter', sans-serif`                                                 |    52 | `:root`                              |            |
| `--font-mono`       | `'JetBrains Mono', monospace`                                         |    53 | `:root`                              |            |
| `--space-1`         | `4px`                                                                 |    55 | `:root`                              |            |
| `--space-2`         | `8px`                                                                 |    56 | `:root`                              |            |
| `--space-3`         | `12px`                                                                |    57 | `:root`                              |            |
| `--space-4`         | `16px`                                                                |    58 | `:root`                              |            |
| `--space-5`         | `24px`                                                                |    59 | `:root`                              |            |
| `--space-6`         | `32px`                                                                |    60 | `:root`                              |            |
| `--space-7`         | `40px`                                                                |    61 | `:root`                              |            |
| `--space-8`         | `48px`                                                                |    62 | `:root`                              |            |
| `--radius`          | `6px`                                                                 |    64 | `:root`                              |            |
| `--radius-sm`       | `4px`                                                                 |    65 | `:root`                              |            |
| `--radius-xs`       | `3px`                                                                 |    66 | `:root`                              |            |
| `--shadow`          | `0 2px 12px rgba(0, 0, 0, 0.5)`                                       |    68 | `:root`                              |            |
| `--shadow-lg`       | `0 8px 32px rgba(0, 0, 0, 0.6)`                                       |    69 | `:root`                              |            |
| `--shadow-elevated` | `0 4px 20px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.06)` |    70 | `:root`                              |            |
| `--layout-max`      | `1600px`                                                              |    75 | `:root`                              |            |
| `--layout-max`      | `1760px`                                                              |    80 | `@media (min-width: 1600px) > :root` |            |
| `--layout-max`      | `1880px`                                                              |    86 | `@media (min-width: 1920px) > :root` |            |
| `--black`           | `#ffffff`                                                             |   147 | `[data-theme='light']`               |            |
| `--shadow`          | `0 1px 2px rgba(27, 31, 36, 0.06), 0 0 0 1px rgba(27, 31, 36, 0.04)`  |   150 | `[data-theme='light']`               |            |
| `--shadow-lg`       | `0 8px 24px rgba(27, 31, 36, 0.12)`                                   |   151 | `[data-theme='light']`               |            |
| `--shadow-elevated` | `0 3px 6px rgba(27, 31, 36, 0.08), 0 0 0 1px rgba(27, 31, 36, 0.05)`  |   152 | `[data-theme='light']`               |            |

### 4.2 theme-premium.css

#### 4.2.1 DUP-DIFF (token existe em tokens.css com valor DIFERENTE — CRÍTICO)

| Token                    | Valor canônico (tokens.css)          | Valor declarado (theme-premium.css) | Linha | Bloco em theme-premium.css |
| ------------------------ | ------------------------------------ | ----------------------------------- | ----: | -------------------------- |
| `--neon-cyan`            | `var(--ct-brand)` (:root)            | `#00d4ff`                           |    19 | `:root`                    |
| `--neon-cyan-soft`       | `var(--ct-brand-soft)` (:root)       | `rgba(0, 212, 255, 0.15)`           |    20 | `:root`                    |
| `--neon-cyan-glow`       | `var(--ct-brand-soft-hover)` (:root) | `rgba(0, 212, 255, 0.25)`           |    21 | `:root`                    |
| `--neon-cyan-faint`      | `rgba(47, 123, 255, 0.08)` (:root)   | `rgba(0, 212, 255, 0.06)`           |    22 | `:root`                    |
| `--neon-green`           | `var(--ct-success)` (:root)          | `#00ff88`                           |    23 | `:root`                    |
| `--neon-green-soft`      | `var(--ct-success-soft)` (:root)     | `rgba(0, 255, 136, 0.12)`           |    24 | `:root`                    |
| `--neon-green-glow`      | `rgba(63, 182, 139, 0.18)` (:root)   | `rgba(0, 255, 136, 0.2)`            |    25 | `:root`                    |
| `--neon-red`             | `var(--ct-error)` (:root)            | `#ff4466`                           |    26 | `:root`                    |
| `--neon-red-soft`        | `var(--ct-error-soft)` (:root)       | `rgba(255, 68, 102, 0.12)`          |    27 | `:root`                    |
| `--neon-red-glow`        | `rgba(217, 84, 77, 0.18)` (:root)    | `rgba(255, 68, 102, 0.2)`           |    28 | `:root`                    |
| `--neon-amber`           | `var(--ct-warn)` (:root)             | `#ffb830`                           |    29 | `:root`                    |
| `--neon-amber-soft`      | `var(--ct-warn-soft)` (:root)        | `rgba(255, 184, 48, 0.12)`          |    30 | `:root`                    |
| `--surface-premium`      | `var(--ct-bg)` (:root)               | `#0d1117`                           |    31 | `:root`                    |
| `--surface-card`         | `var(--ct-surface)` (:root)          | `#161b22`                           |    32 | `:root`                    |
| `--surface-card-hover`   | `var(--ct-surface-elev)` (:root)     | `#1c2230`                           |    33 | `:root`                    |
| `--surface-elevated`     | `var(--ct-surface-elev)` (:root)     | `#1e2530`                           |    34 | `:root`                    |
| `--border-premium`       | `var(--ct-border)` (:root)           | `rgba(255, 255, 255, 0.06)`         |    35 | `:root`                    |
| `--border-premium-hover` | `var(--ct-border-strong)` (:root)    | `rgba(255, 255, 255, 0.1)`          |    36 | `:root`                    |
| `--surface-premium`      | `var(--ct-bg)` (:root)               | `var(--surface)`                    |  1092 | `[data-theme='light']`     |
| `--surface-card`         | `var(--ct-surface)` (:root)          | `var(--surface)`                    |  1093 | `[data-theme='light']`     |
| `--surface-card-hover`   | `var(--ct-surface-elev)` (:root)     | `var(--surface-2)`                  |  1094 | `[data-theme='light']`     |
| `--surface-elevated`     | `var(--ct-surface-elev)` (:root)     | `var(--surface-2)`                  |  1095 | `[data-theme='light']`     |
| `--border-premium`       | `var(--ct-border)` (:root)           | `var(--border)`                     |  1096 | `[data-theme='light']`     |
| `--border-premium-hover` | `var(--ct-border-strong)` (:root)    | `var(--border-2)`                   |  1097 | `[data-theme='light']`     |

#### 4.2.3 NEW (token não existe em tokens.css — local ou candidato a subir)

| Token                 | Valor  | Linha | Bloco   | Comentário |
| --------------------- | ------ | ----: | ------- | ---------- |
| `--premier-radius`    | `12px` |    16 | `:root` |            |
| `--premier-radius-sm` | `8px`  |    17 | `:root` |            |
| `--premier-radius-xs` | `6px`  |    18 | `:root` |            |

### 4.3 layout.css

#### 4.3.3 NEW (token não existe em tokens.css — local ou candidato a subir)

| Token                       | Valor                            | Linha | Bloco                               | Comentário |
| --------------------------- | -------------------------------- | ----: | ----------------------------------- | ---------- |
| `--app-header-top-height`   | `48px`                           |     7 | `:root`                             |            |
| `--app-header-stats-height` | `0px`                            |     8 | `:root`                             |            |
| `--app-header-total-height` | `var(--app-header-top-height)`   |     9 | `:root`                             |            |
| `--app-header-height`       | `var(--app-header-total-height)` |    10 | `:root`                             |            |
| `--app-content-top-gap`     | `16px`                           |    11 | `:root`                             |            |
| `--app-nav-height`          | `80px`                           |    12 | `:root`                             |            |
| `--hdr-accent`              | `#00c8e8`                        |   184 | `.app-header`                       |            |
| `--hdr-accent-dim`          | `rgba(0, 200, 232, 0.14)`        |   185 | `.app-header`                       |            |
| `--hdr-accent-soft`         | `rgba(0, 200, 232, 0.22)`        |   186 | `.app-header`                       |            |
| `--hdr-accent-text`         | `#02131f`                        |   187 | `.app-header`                       |            |
| `--hdr-accent`              | `#3a8ee6`                        |   190 | `.app-header[data-tier='plus']`     |            |
| `--hdr-accent-dim`          | `rgba(58, 142, 230, 0.14)`       |   191 | `.app-header[data-tier='plus']`     |            |
| `--hdr-accent-soft`         | `rgba(58, 142, 230, 0.22)`       |   192 | `.app-header[data-tier='plus']`     |            |
| `--hdr-accent-text`         | `#041530`                        |   193 | `.app-header[data-tier='plus']`     |            |
| `--hdr-accent`              | `#e8b94a`                        |   196 | `.app-header[data-tier='pro']`      |            |
| `--hdr-accent-dim`          | `rgba(232, 185, 74, 0.16)`       |   197 | `.app-header[data-tier='pro']`      |            |
| `--hdr-accent-soft`         | `rgba(232, 185, 74, 0.26)`       |   198 | `.app-header[data-tier='pro']`      |            |
| `--hdr-accent-text`         | `#2a1f04`                        |   199 | `.app-header[data-tier='pro']`      |            |
| `--app-header-top-height`   | `46px`                           |   741 | `@media (max-width: 640px) > :root` |            |
| `--app-header-stats-height` | `0px`                            |   742 | `@media (max-width: 640px) > :root` |            |
| `--app-header-total-height` | `var(--app-header-top-height)`   |   743 | `@media (max-width: 640px) > :root` |            |
| `--app-header-height`       | `var(--app-header-total-height)` |   744 | `@media (max-width: 640px) > :root` |            |
| `--app-content-top-gap`     | `0px`                            |   745 | `@media (max-width: 640px) > :root` |            |

### 4.4 components.css

#### 4.4.1 DUP-DIFF (token existe em tokens.css com valor DIFERENTE — CRÍTICO)

| Token            | Valor canônico (tokens.css)        | Valor declarado (components.css) | Linha | Bloco em components.css                 |
| ---------------- | ---------------------------------- | -------------------------------- | ----: | --------------------------------------- |
| `--primary-dim`  | `rgba(47, 123, 255, 0.08)` (:root) | `rgba(0, 200, 232, 0.32)`        | 13076 | `#view-historico,.hist-signature-modal` |
| `--primary-soft` | `var(--ct-brand-soft)` (:root)     | `rgba(0, 200, 232, 0.08)`        | 13077 | `#view-historico,.hist-signature-modal` |
| `--warning-dim`  | `rgba(212, 148, 71, 0.06)` (:root) | `rgba(232, 160, 32, 0.32)`       | 13078 | `#view-historico,.hist-signature-modal` |
| `--warning-soft` | `var(--ct-warn-soft)` (:root)      | `rgba(232, 160, 32, 0.08)`       | 13079 | `#view-historico,.hist-signature-modal` |
| `--danger-dim`   | `rgba(217, 84, 77, 0.06)` (:root)  | `rgba(224, 48, 64, 0.32)`        | 13080 | `#view-historico,.hist-signature-modal` |
| `--danger-soft`  | `var(--ct-error-soft)` (:root)     | `rgba(224, 48, 64, 0.1)`         | 13081 | `#view-historico,.hist-signature-modal` |
| `--success-dim`  | `rgba(63, 182, 139, 0.06)` (:root) | `rgba(0, 200, 112, 0.28)`        | 13082 | `#view-historico,.hist-signature-modal` |
| `--success-soft` | `var(--ct-success-soft)` (:root)   | `rgba(0, 200, 112, 0.08)`        | 13083 | `#view-historico,.hist-signature-modal` |
| `--primary-dim`  | `rgba(47, 123, 255, 0.08)` (:root) | `rgba(0, 200, 232, 0.32)`        | 14805 | `.sig-capture-modal`                    |
| `--primary-soft` | `var(--ct-brand-soft)` (:root)     | `rgba(0, 200, 232, 0.08)`        | 14806 | `.sig-capture-modal`                    |

#### 4.4.3 NEW (token não existe em tokens.css — local ou candidato a subir)

| Token                      | Valor                                                                  | Linha | Bloco                                                                            | Comentário                       |
| -------------------------- | ---------------------------------------------------------------------- | ----: | -------------------------------------------------------------------------------- | -------------------------------- |
| `--tone`                   | `var(--border-2)`                                                      |   198 | `.equip-card`                                                                    |                                  |
| `--tone-soft`              | `transparent`                                                          |   199 | `.equip-card`                                                                    |                                  |
| `--tone-edge`              | `var(--border-2)`                                                      |   200 | `.equip-card`                                                                    |                                  |
| `--tone-text`              | `var(--text-2)`                                                        |   201 | `.equip-card`                                                                    |                                  |
| `--tone`                   | `var(--border-2)`                                                      |   261 | `.equip-card--ok`                                                                |                                  |
| `--tone-soft`              | `transparent`                                                          |   262 | `.equip-card--ok`                                                                |                                  |
| `--tone-edge`              | `var(--border-2)`                                                      |   263 | `.equip-card--ok`                                                                |                                  |
| `--tone-text`              | `var(--text-2)`                                                        |   264 | `.equip-card--ok`                                                                |                                  |
| `--tone`                   | `var(--warning)`                                                       |   267 | `.equip-card--warn`                                                              |                                  |
| `--tone-soft`              | `color-mix(in srgb, var(--warning) 14%, transparent)`                  |   270 | `.equip-card--warn`                                                              |                                  |
| `--tone-edge`              | `color-mix(in srgb, var(--warning) 32%, var(--border-2))`              |   271 | `.equip-card--warn`                                                              |                                  |
| `--tone-text`              | `color-mix(in srgb, var(--warning) 70%, #ffffff)`                      |   272 | `.equip-card--warn`                                                              |                                  |
| `--tone`                   | `var(--danger)`                                                        |   276 | `.equip-card--danger`                                                            |                                  |
| `--tone-soft`              | `color-mix(in srgb, var(--danger) 16%, transparent)`                   |   277 | `.equip-card--danger`                                                            |                                  |
| `--tone-edge`              | `color-mix(in srgb, var(--danger) 35%, var(--border-2))`               |   278 | `.equip-card--danger`                                                            |                                  |
| `--tone-text`              | `color-mix(in srgb, var(--danger) 70%, #ffffff)`                       |   279 | `.equip-card--danger`                                                            |                                  |
| `--tone`                   | `var(--border-2)`                                                      |  4420 | `.eq-risk-panel`                                                                 |                                  |
| `--tone-soft`              | `transparent`                                                          |  4421 | `.eq-risk-panel`                                                                 |                                  |
| `--tone-edge`              | `var(--border-2)`                                                      |  4422 | `.eq-risk-panel`                                                                 |                                  |
| `--tone-text`              | `var(--text-2)`                                                        |  4423 | `.eq-risk-panel`                                                                 |                                  |
| `--tone`                   | `var(--success)`                                                       |  4453 | `.eq-risk-panel--baixo`                                                          |                                  |
| `--tone-soft`              | `color-mix(in srgb, var(--success) 10%, transparent)`                  |  4454 | `.eq-risk-panel--baixo`                                                          |                                  |
| `--tone-edge`              | `color-mix(in srgb, var(--success) 32%, var(--border-2))`              |  4455 | `.eq-risk-panel--baixo`                                                          |                                  |
| `--tone-text`              | `color-mix(in srgb, var(--success) 70%, #ffffff)`                      |  4456 | `.eq-risk-panel--baixo`                                                          |                                  |
| `--tone`                   | `var(--warning)`                                                       |  4459 | `.eq-risk-panel--medio`                                                          |                                  |
| `--tone-soft`              | `color-mix(in srgb, var(--warning) 10%, transparent)`                  |  4460 | `.eq-risk-panel--medio`                                                          |                                  |
| `--tone-edge`              | `color-mix(in srgb, var(--warning) 32%, var(--border-2))`              |  4461 | `.eq-risk-panel--medio`                                                          |                                  |
| `--tone-text`              | `color-mix(in srgb, var(--warning) 70%, #ffffff)`                      |  4462 | `.eq-risk-panel--medio`                                                          |                                  |
| `--tone`                   | `var(--danger)`                                                        |  4465 | `.eq-risk-panel--alto`                                                           |                                  |
| `--tone-soft`              | `color-mix(in srgb, var(--danger) 12%, transparent)`                   |  4466 | `.eq-risk-panel--alto`                                                           |                                  |
| `--tone-edge`              | `color-mix(in srgb, var(--danger) 35%, var(--border-2))`               |  4467 | `.eq-risk-panel--alto`                                                           |                                  |
| `--tone-text`              | `color-mix(in srgb, var(--danger) 70%, #ffffff)`                       |  4468 | `.eq-risk-panel--alto`                                                           |                                  |
| `--tone`                   | `var(--primary)`                                                       |  7216 | `.equip-idle-cluster`                                                            |                                  |
| `--tone-soft`              | `color-mix(in srgb, var(--primary) 8%, transparent)`                   |  7217 | `.equip-idle-cluster`                                                            |                                  |
| `--tone-edge`              | `color-mix(in srgb, var(--primary) 32%, var(--border-2))`              |  7218 | `.equip-idle-cluster`                                                            |                                  |
| `--chip-color`             | `var(--primary)`                                                       |  8203 | `.registro-quick-chip[data-color='info']`                                        |                                  |
| `--chip-bg`                | `var(--primary-soft)`                                                  |  8204 | `.registro-quick-chip[data-color='info']`                                        |                                  |
| `--chip-color`             | `var(--primary)`                                                       |  8207 | `.registro-quick-chip[data-color='primary']`                                     |                                  |
| `--chip-bg`                | `var(--primary-soft)`                                                  |  8208 | `.registro-quick-chip[data-color='primary']`                                     |                                  |
| `--chip-color`             | `var(--warning)`                                                       |  8211 | `.registro-quick-chip[data-color='warning']`                                     |                                  |
| `--chip-bg`                | `var(--warning-soft)`                                                  |  8212 | `.registro-quick-chip[data-color='warning']`                                     |                                  |
| `--chip-color`             | `var(--danger)`                                                        |  8215 | `.registro-quick-chip[data-color='danger']`                                      |                                  |
| `--chip-bg`                | `var(--danger-soft)`                                                   |  8216 | `.registro-quick-chip[data-color='danger']`                                      |                                  |
| `--chip-color`             | `var(--success)`                                                       |  8219 | `.registro-quick-chip[data-color='success']`                                     |                                  |
| `--chip-bg`                | `var(--success-soft)`                                                  |  8220 | `.registro-quick-chip[data-color='success']`                                     |                                  |
| `--acm-bg`                 | `var(--surface)`                                                       |  8483 | `.account-modal`                                                                 |                                  |
| `--acm-border`             | `var(--border)`                                                        |  8484 | `.account-modal`                                                                 |                                  |
| `--acm-divider`            | `var(--border)`                                                        |  8485 | `.account-modal`                                                                 |                                  |
| `--acm-gold`               | `#e8b94a`                                                              |  8486 | `.account-modal`                                                                 |                                  |
| `--acm-plus-blue`          | `#3a8ee6`                                                              |  8487 | `.account-modal`                                                                 |                                  |
| `--acm-red`                | `#ff5577`                                                              |  8488 | `.account-modal`                                                                 |                                  |
| `--acm-accent`             | `var(--text-2)`                                                        |  8490 | `.account-modal`                                                                 |                                  |
| `--acm-accent-dim`         | `color-mix(in srgb, var(--text-3) 30%, transparent)`                   |  8491 | `.account-modal`                                                                 |                                  |
| `--acm-accent-soft`        | `color-mix(in srgb, var(--text-3) 10%, transparent)`                   |  8492 | `.account-modal`                                                                 |                                  |
| `--acm-accent-glow`        | `color-mix(in srgb, var(--text-3) 14%, transparent)`                   |  8493 | `.account-modal`                                                                 |                                  |
| `--acm-badge-bg`           | `color-mix(in srgb, var(--text-3) 12%, transparent)`                   |  8494 | `.account-modal`                                                                 |                                  |
| `--acm-badge-border`       | `color-mix(in srgb, var(--text-3) 24%, transparent)`                   |  8495 | `.account-modal`                                                                 |                                  |
| `--acm-border`             | `rgba(58, 142, 230, 0.22)`                                             |  8543 | `.account-modal--plus`                                                           |                                  |
| `--acm-divider`            | `rgba(58, 142, 230, 0.1)`                                              |  8544 | `.account-modal--plus`                                                           |                                  |
| `--acm-accent`             | `var(--acm-plus-blue)`                                                 |  8545 | `.account-modal--plus`                                                           |                                  |
| `--acm-accent-dim`         | `rgba(58, 142, 230, 0.28)`                                             |  8546 | `.account-modal--plus`                                                           |                                  |
| `--acm-accent-soft`        | `rgba(58, 142, 230, 0.1)`                                              |  8547 | `.account-modal--plus`                                                           |                                  |
| `--acm-accent-glow`        | `rgba(58, 142, 230, 0.22)`                                             |  8548 | `.account-modal--plus`                                                           |                                  |
| `--acm-badge-bg`           | `rgba(58, 142, 230, 0.14)`                                             |  8549 | `.account-modal--plus`                                                           |                                  |
| `--acm-badge-border`       | `rgba(58, 142, 230, 0.32)`                                             |  8550 | `.account-modal--plus`                                                           |                                  |
| `--acm-accent`             | `#1d4f8e`                                                              |  8554 | `[data-theme='light'] .account-modal--plus`                                      |                                  |
| `--acm-border`             | `rgba(232, 185, 74, 0.2)`                                              |  8558 | `.account-modal--pro`                                                            |                                  |
| `--acm-divider`            | `rgba(232, 185, 74, 0.1)`                                              |  8559 | `.account-modal--pro`                                                            |                                  |
| `--acm-accent`             | `var(--acm-gold)`                                                      |  8560 | `.account-modal--pro`                                                            |                                  |
| `--acm-accent-dim`         | `rgba(232, 185, 74, 0.32)`                                             |  8561 | `.account-modal--pro`                                                            |                                  |
| `--acm-accent-soft`        | `rgba(232, 185, 74, 0.1)`                                              |  8562 | `.account-modal--pro`                                                            |                                  |
| `--acm-accent-glow`        | `rgba(232, 185, 74, 0.26)`                                             |  8563 | `.account-modal--pro`                                                            |                                  |
| `--acm-badge-border`       | `rgba(232, 185, 74, 0.36)`                                             |  8564 | `.account-modal--pro`                                                            |                                  |
| `--dsh-gold`               | `#e8b94a`                                                              | 11000 | `.dash`                                                                          |                                  |
| `--dsh-blue`               | `#3a8ee6`                                                              | 11001 | `.dash`                                                                          |                                  |
| `--dsh-red`                | `#ff5577`                                                              | 11002 | `.dash`                                                                          |                                  |
| `--dsh-neutral`            | `#8aaac8`                                                              | 11003 | `.dash`                                                                          | casa com --text-2 do tema escuro |
| `--dsh-accent`             | `var(--dsh-neutral)`                                                   | 11006 | `.dash`                                                                          |                                  |
| `--dsh-accent-dim`         | `rgba(138, 170, 200, 0.22)`                                            | 11007 | `.dash`                                                                          |                                  |
| `--dsh-accent-soft`        | `rgba(138, 170, 200, 0.08)`                                            | 11008 | `.dash`                                                                          |                                  |
| `--dsh-accent-strong`      | `rgba(138, 170, 200, 0.32)`                                            | 11009 | `.dash`                                                                          |                                  |
| `--dsh-accent-glow`        | `rgba(138, 170, 200, 0.14)`                                            | 11010 | `.dash`                                                                          |                                  |
| `--dsh-card-bg`            | `rgba(255, 255, 255, 0.025)`                                           | 11012 | `.dash`                                                                          |                                  |
| `--dsh-card-border`        | `rgba(255, 255, 255, 0.08)`                                            | 11013 | `.dash`                                                                          |                                  |
| `--dsh-card-border-strong` | `rgba(255, 255, 255, 0.16)`                                            | 11014 | `.dash`                                                                          |                                  |
| `--dsh-surface`            | `var(--surface)`                                                       | 11015 | `.dash`                                                                          |                                  |
| `--dsh-divider`            | `rgba(255, 255, 255, 0.06)`                                            | 11016 | `.dash`                                                                          |                                  |
| `--dsh-card-bg`            | `rgba(0, 30, 60, 0.025)`                                               | 11025 | `[data-theme='light'] .dash`                                                     |                                  |
| `--dsh-card-border`        | `rgba(0, 30, 60, 0.08)`                                                | 11026 | `[data-theme='light'] .dash`                                                     |                                  |
| `--dsh-card-border-strong` | `rgba(0, 30, 60, 0.16)`                                                | 11027 | `[data-theme='light'] .dash`                                                     |                                  |
| `--dsh-divider`            | `rgba(0, 30, 60, 0.06)`                                                | 11028 | `[data-theme='light'] .dash`                                                     |                                  |
| `--dsh-accent`             | `var(--dsh-blue)`                                                      | 11032 | `.dash[data-tier='plus']`                                                        |                                  |
| `--dsh-accent-dim`         | `rgba(58, 142, 230, 0.28)`                                             | 11033 | `.dash[data-tier='plus']`                                                        |                                  |
| `--dsh-accent-soft`        | `rgba(58, 142, 230, 0.08)`                                             | 11034 | `.dash[data-tier='plus']`                                                        |                                  |
| `--dsh-accent-strong`      | `rgba(58, 142, 230, 0.4)`                                              | 11035 | `.dash[data-tier='plus']`                                                        |                                  |
| `--dsh-accent-glow`        | `rgba(58, 142, 230, 0.2)`                                              | 11036 | `.dash[data-tier='plus']`                                                        |                                  |
| `--dsh-accent`             | `var(--dsh-gold)`                                                      | 11040 | `.dash[data-tier='pro']`                                                         |                                  |
| `--dsh-accent-dim`         | `rgba(232, 185, 74, 0.3)`                                              | 11041 | `.dash[data-tier='pro']`                                                         |                                  |
| `--dsh-accent-soft`        | `rgba(232, 185, 74, 0.1)`                                              | 11042 | `.dash[data-tier='pro']`                                                         |                                  |
| `--dsh-accent-strong`      | `rgba(232, 185, 74, 0.38)`                                             | 11043 | `.dash[data-tier='pro']`                                                         |                                  |
| `--dsh-accent-glow`        | `rgba(232, 185, 74, 0.22)`                                             | 11044 | `.dash[data-tier='pro']`                                                         |                                  |
| `--dsh-tone-accent`        | `var(--dsh-red)`                                                       | 11049 | `.dash[data-tone='alert']`                                                       |                                  |
| `--dsh-tone-strong`        | `rgba(255, 85, 119, 0.4)`                                              | 11050 | `.dash[data-tone='alert']`                                                       |                                  |
| `--dsh-tone-soft`          | `rgba(255, 85, 119, 0.1)`                                              | 11051 | `.dash[data-tone='alert']`                                                       |                                  |
| `--dsh-tone-glow`          | `rgba(255, 85, 119, 0.24)`                                             | 11052 | `.dash[data-tone='alert']`                                                       |                                  |
| `--r-surface-3`            | `#172d45`                                                              | 12025 | `#view-registro`                                                                 |                                  |
| `--r-border-soft`          | `rgba(255, 255, 255, 0.07)`                                            | 12026 | `#view-registro`                                                                 |                                  |
| `--r-accent-tint`          | `rgba(0, 200, 232, 0.32)`                                              | 12027 | `#view-registro`                                                                 |                                  |
| `--r-accent-soft`          | `rgba(0, 200, 232, 0.12)`                                              | 12028 | `#view-registro`                                                                 |                                  |
| `--r-accent-ghost`         | `rgba(0, 200, 232, 0.04)`                                              | 12029 | `#view-registro`                                                                 |                                  |
| `--r-warn-soft`            | `rgba(232, 160, 32, 0.14)`                                             | 12030 | `#view-registro`                                                                 |                                  |
| `--r-warn-tint`            | `rgba(232, 160, 32, 0.34)`                                             | 12031 | `#view-registro`                                                                 |                                  |
| `--r-danger-soft`          | `rgba(224, 48, 64, 0.14)`                                              | 12032 | `#view-registro`                                                                 |                                  |
| `--r-danger-tint`          | `rgba(224, 48, 64, 0.34)`                                              | 12033 | `#view-registro`                                                                 |                                  |
| `--r-success-soft`         | `rgba(0, 200, 112, 0.14)`                                              | 12034 | `#view-registro`                                                                 |                                  |
| `--r-radius-md`            | `10px`                                                                 | 12035 | `#view-registro`                                                                 |                                  |
| `--r-radius-lg`            | `16px`                                                                 | 12036 | `#view-registro`                                                                 |                                  |
| `--r-shadow-hero`          | `0 24px 48px rgba(0, 0, 0, 0.42), 0 4px 12px rgba(0, 200, 232, 0.06)`  | 12037 | `#view-registro`                                                                 |                                  |
| `--r-shadow-cta`           | `0 12px 24px rgba(0, 200, 232, 0.25)`                                  | 12038 | `#view-registro`                                                                 |                                  |
| `--r-surface-3`            | `#dbe3ec`                                                              | 12042 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-border-soft`          | `rgba(15, 23, 42, 0.08)`                                               | 12043 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-accent-tint`          | `rgba(0, 150, 180, 0.3)`                                               | 12044 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-accent-soft`          | `rgba(0, 150, 180, 0.12)`                                              | 12045 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-accent-ghost`         | `rgba(0, 150, 180, 0.05)`                                              | 12046 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-warn-soft`            | `rgba(154, 103, 0, 0.14)`                                              | 12047 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-warn-tint`            | `rgba(154, 103, 0, 0.32)`                                              | 12048 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-danger-soft`          | `rgba(207, 34, 46, 0.12)`                                              | 12049 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-danger-tint`          | `rgba(207, 34, 46, 0.3)`                                               | 12050 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-success-soft`         | `rgba(26, 127, 55, 0.12)`                                              | 12051 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-shadow-hero`          | `0 12px 28px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(0, 150, 180, 0.08)` | 12052 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--r-shadow-cta`           | `0 10px 20px rgba(0, 150, 180, 0.25)`                                  | 12053 | `[data-theme='light'] #view-registro`                                            |                                  |
| `--chip-bg`                | `rgba(0, 200, 232, 0.14)`                                              | 12369 | `#view-registro .registro-quick__tile[data-color='cyan']`                        |                                  |
| `--chip-fg`                | `var(--primary)`                                                       | 12370 | `#view-registro .registro-quick__tile[data-color='cyan']`                        |                                  |
| `--chip-bg`                | `var(--r-warn-soft)`                                                   | 12374 | `#view-registro .registro-quick__tile[data-color='amber']`                       |                                  |
| `--chip-fg`                | `var(--warning)`                                                       | 12375 | `#view-registro .registro-quick__tile[data-color='amber']`                       |                                  |
| `--chip-bg`                | `var(--r-danger-soft)`                                                 | 12379 | `#view-registro .registro-quick__tile[data-color='red']`                         |                                  |
| `--chip-fg`                | `var(--danger)`                                                        | 12380 | `#view-registro .registro-quick__tile[data-color='red']`                         |                                  |
| `--chip-bg`                | `rgba(0, 200, 112, 0.14)`                                              | 12384 | `#view-registro .registro-quick__tile[data-color='teal']`                        |                                  |
| `--chip-fg`                | `var(--success)`                                                       | 12385 | `#view-registro .registro-quick__tile[data-color='teal']`                        |                                  |
| `--chip-bg`                | `rgba(140, 120, 240, 0.14)`                                            | 12389 | `#view-registro .registro-quick__tile[data-color='violet']`                      |                                  |
| `--chip-fg`                | `#a99cff`                                                              | 12390 | `#view-registro .registro-quick__tile[data-color='violet']`                      |                                  |
| `--chip-fg`                | `#6555d0`                                                              | 12394 | `[data-theme='light'] #view-registro .registro-quick__tile[data-color='violet']` |                                  |
| `--info`                   | `#00b0a0`                                                              | 13084 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--info-dim`               | `rgba(0, 176, 160, 0.28)`                                              | 13085 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--info-soft`              | `rgba(0, 176, 160, 0.08)`                                              | 13086 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--violet`                 | `#a078ff`                                                              | 13087 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--violet-dim`             | `rgba(160, 120, 255, 0.28)`                                            | 13088 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--violet-soft`            | `rgba(160, 120, 255, 0.08)`                                            | 13089 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--border-soft`            | `rgba(255, 255, 255, 0.07)`                                            | 13090 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--r-chip`                 | `6px`                                                                  | 13091 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--r-card`                 | `10px`                                                                 | 13092 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--r-hero`                 | `16px`                                                                 | 13093 | `#view-historico,.hist-signature-modal`                                          |                                  |
| `--border-soft`            | `rgba(255, 255, 255, 0.07)`                                            | 14807 | `.sig-capture-modal`                                                             |                                  |

### 4.5 redesign.css

#### 4.5.3 NEW (token não existe em tokens.css — local ou candidato a subir)

| Token                       | Valor                                               | Linha | Bloco                                                                                   | Comentário |
| --------------------------- | --------------------------------------------------- | ----: | --------------------------------------------------------------------------------------- | ---------- |
| `--ct-internal-bg`          | `#090c10`                                           |  1012 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-internal-surface`     | `#161b22`                                           |  1013 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-internal-elev`        | `#1c2330`                                           |  1014 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-internal-border`      | `rgba(34, 211, 238, 0.16)`                          |  1015 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-internal-text`        | `#e6edf3`                                           |  1016 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-internal-text-2`      | `#9aa4b2`                                           |  1017 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-surface`       | `var(--ct-surface, #161b22)`                        |  1490 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-surface-elev`  | `var(--ct-surface-elev, #1c2330)`                   |  1491 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-surface-hover` | `var(--ct-surface-hover, #222b3a)`                  |  1492 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-border`        | `var(--ct-border, rgba(34, 211, 238, 0.16))`        |  1493 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-border-strong` | `var(--ct-border-strong, rgba(34, 211, 238, 0.24))` |  1494 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-text`          | `var(--ct-text, #e6edf3)`                           |  1495 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-polish-muted`         | `var(--ct-text-muted, #b5c2d1)`                     |  1496 | `body:not(.landing-active) #app`                                                        |            |
| `--ct-dx-bg`                | `#0d1117`                                           |  1808 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-dx-surface-1`         | `#0f1419`                                           |  1809 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-dx-surface-2`         | `#0a0e14`                                           |  1810 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-dx-surface-3`         | `#131923`                                           |  1811 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-dx-border`            | `rgba(181, 194, 209, 0.1)`                          |  1812 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-dx-border-strong`     | `rgba(181, 194, 209, 0.16)`                         |  1813 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-dx-border-brand`      | `rgba(34, 211, 238, 0.2)`                           |  1814 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light'])`      |            |
| `--ct-polish-surface`       | `var(--ct-dx-surface-2)`                            |  1821 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']) #app` |            |
| `--ct-polish-surface-elev`  | `var(--ct-dx-surface-1)`                            |  1822 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']) #app` |            |
| `--ct-polish-surface-hover` | `var(--ct-dx-surface-3)`                            |  1823 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']) #app` |            |
| `--ct-polish-border`        | `var(--ct-dx-border)`                               |  1824 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']) #app` |            |
| `--ct-polish-border-strong` | `var(--ct-dx-border-strong)`                        |  1825 | `@media (min-width: 1024px) > body:not(.landing-active):not([data-theme='light']) #app` |            |

### 4.6 ux-polish.css

#### 4.6.3 NEW (token não existe em tokens.css — local ou candidato a subir)

| Token                 | Valor                                                                  | Linha | Bloco   | Comentário |
| --------------------- | ---------------------------------------------------------------------- | ----: | ------- | ---------- |
| `--motion-fast`       | `140ms`                                                                |     7 | `:root` |            |
| `--motion-base`       | `220ms`                                                                |     8 | `:root` |            |
| `--motion-slow`       | `360ms`                                                                |     9 | `:root` |            |
| `--ease-standard`     | `cubic-bezier(0.2, 0, 0, 1)`                                           |    10 | `:root` |            |
| `--ease-soft`         | `cubic-bezier(0.22, 1, 0.36, 1)`                                       |    11 | `:root` |            |
| `--focus-ring`        | `0 0 0 2px rgba(0, 200, 232, 0.2)`                                     |    12 | `:root` |            |
| `--focus-ring-strong` | `0 0 0 1px rgba(0, 200, 232, 0.45), 0 0 0 3px rgba(0, 200, 232, 0.14)` |    13 | `:root` |            |

## 5. Tokens declarados em tokens.css mas NUNCA usados em outros arquivos

| Token                | Valor                      | Por que pode ser legado                                                    |
| -------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `--ct-brand-strong`  | `rgba(34, 211, 238, 0.6)`  | Sem ocorrências de `var(--ct-brand-strong)` em src/ — possível dead token  |
| `--ct-primary`       | `var(--ct-brand)`          | Sem ocorrências de `var(--ct-primary)` em src/ — possível dead token       |
| `--ct-warning`       | `#d97706`                  | Sem ocorrências de `var(--ct-warning)` em src/ — possível dead token       |
| `--ct-surface-2`     | `var(--ct-surface-elev)`   | Sem ocorrências de `var(--ct-surface-2)` em src/ — possível dead token     |
| `--ct-text-2`        | `var(--ct-text-muted)`     | Sem ocorrências de `var(--ct-text-2)` em src/ — possível dead token        |
| `--ct-text-3`        | `var(--ct-text-faint)`     | Sem ocorrências de `var(--ct-text-3)` em src/ — possível dead token        |
| `--ct-whatsapp`      | `#4fa779`                  | Sem ocorrências de `var(--ct-whatsapp)` em src/ — possível dead token      |
| `--ct-whatsapp-soft` | `rgba(79, 167, 121, 0.12)` | Sem ocorrências de `var(--ct-whatsapp-soft)` em src/ — possível dead token |
| `--surface-strong`   | `var(--ct-surface-elev)`   | Sem ocorrências de `var(--surface-strong)` em src/ — possível dead token   |
| `--muted-light`      | `var(--ct-text-ghost)`     | Sem ocorrências de `var(--muted-light)` em src/ — possível dead token      |
| `--white`            | `var(--ct-text)`           | Sem ocorrências de `var(--white)` em src/ — possível dead token            |
