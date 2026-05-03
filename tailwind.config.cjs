/** @type {import('tailwindcss').Config} */
module.exports = {
  // `content` cobre React + vanilla. Login/auth e demais views vanilla
  // passam a usar utilities Tailwind em `src/ui/**` durante a migracao
  // CSS -> Tailwind iniciada em `style-reset`.
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // ─ Breakpoints extras ───────────────────────────────────────────
      // Media query `(max-width: 900px)` aparece no CSS legado do Login
      // e nao tem match exato nos defaults do Tailwind. Adicionado em
      // `extend` para preservar todos os defaults do Tailwind. Uso como
      // `max-auth-md:` para `(max-width: 899px)`.
      screens: {
        'auth-md': '900px',
      },

      // ─ Paletas extendendo o tema padrao do Tailwind ──────────────────
      // Aditivos: nenhum override de chaves built-in (slate, blue, etc).
      // Namespaces:
      //   - landing.*: paleta da Landing React (PR 1 do landing-page-plan).
      //   - ct.*:      tokens do app interno, espelhados de
      //                `src/assets/styles/tokens.css` (--ct-*). Mantido
      //                em paralelo aos `landing.*` para que o Login (que
      //                usa palette landing) e as demais views (que usam
      //                tokens --ct-*) tenham nomes Tailwind nativos sem
      //                arbitrary values.
      colors: {
        landing: {
          navy: '#020B2D',
          'navy-2': '#031B4E',
          'navy-3': '#06245F',
          // Adicionado durante migracao do Login (Etapa 2 do
          // style-reset). Stops mais escuros do gradient navy.
          'navy-deep': '#03080f',
          blue: '#006DFF',
          'blue-vivid': '#159BFF',
          // Adicionado durante migracao do Login. Variante mais
          // brilhante do blue, usada em accents/glows do Login e
          // candidata a reuso em outras views auth-adjacent.
          'blue-bright': '#2c7cff',
          cyan: '#40C4FF',
          // Adicionado durante migracao do Login. Cyan mais suave,
          // usado em texto/icones sobre fundo escuro.
          'cyan-soft': '#67E8F9',
          off: '#F5F8FC',
          line: '#E3EAF4',
          ink: '#0B1B33',
          'ink-2': '#5B6B82',
          green: '#18B884',
          // Adicionado durante migracao do Login. Tom proximo de
          // landing.green mas distinto (status online dot/pill).
          'green-online': '#2ecc8b',
          orange: '#F59E0B',
          red: '#EF4444',
          // ─ Texto sobre fundo navy escuro ─────────────────────
          // Cores nucleares de texto da identidade Landing/Auth.
          // Fortes candidatas a reuso em qualquer view com fundo
          // dark; padronizar aqui evita fragmentar paleta.
          'text-body': '#cdd9ee', // body
          'text-mute': '#94a8c8', // muted
          'text-dim': '#6b80a3', // dim/labels uppercase
          // ─ Border base ───────────────────────────────────────
          // Cor base usada com opacity modifier (`/05`, `/10`,
          // `/18`, `/28`) para borders blue-faint dos cards/inputs.
          // Hex de rgb(120,170,230) que aparece em rgba(120,170,
          // 230,X) repetidamente no CSS legado.
          'border-base': '#78aae6',
        },
        // Espelha `src/assets/styles/tokens.css` (`--ct-*`). Manter em
        // sincronia: qualquer mudanca no tokens.css deve refletir aqui
        // (e vice-versa). `tokens.css` continua sendo fonte de verdade
        // para as views legadas que ainda referenciam `var(--ct-*)`.
        ct: {
          // Brand
          brand: '#5f85db',
          'brand-hover': '#90b8f8',
          'brand-text': '#90b8f8',
          'brand-soft': 'rgba(95, 133, 219, 0.14)',
          'brand-soft-hover': 'rgba(144, 184, 248, 0.18)',
          'brand-soft-strong': 'rgba(144, 184, 248, 0.24)',
          'brand-border': 'rgba(144, 184, 248, 0.18)',
          'brand-border-hover': 'rgba(144, 184, 248, 0.32)',

          // Surfaces
          'app-bg': '#26282b',
          bg: '#26282b',
          surface: '#353941',
          'surface-raised': '#3e434d',
          'surface-subtle': '#2d3036',
          'surface-elev': '#3e434d',
          'surface-hover': '#3e434d',
          border: 'rgba(144, 184, 248, 0.16)',
          'border-strong': 'rgba(144, 184, 248, 0.28)',

          // Text
          text: '#f4f7fb',
          'text-muted': '#c7d0e0',
          'text-faint': '#98a4b8',
          'text-ghost': '#7f8b9f',

          // Status
          success: '#4ade80',
          'success-soft': 'rgba(74, 222, 128, 0.12)',
          info: '#90b8f8',
          'info-soft': 'rgba(144, 184, 248, 0.14)',
          warn: '#fbbf24',
          'warn-soft': 'rgba(251, 191, 36, 0.13)',
          error: '#fb7185',
          'error-soft': 'rgba(251, 113, 133, 0.13)',
          whatsapp: '#4ade80',
          'whatsapp-soft': 'rgba(74, 222, 128, 0.12)',

          // Premium tier (Pro) — gold dessaturado
          gold: '#d9a441',
          'gold-soft': 'rgba(217, 164, 65, 0.10)',
          'gold-soft-hover': 'rgba(217, 164, 65, 0.15)',
          'gold-border': 'rgba(217, 164, 65, 0.24)',
          'gold-border-hover': 'rgba(217, 164, 65, 0.36)',

          // Subtle hovers / tints
          'hover-soft': 'rgba(144, 184, 248, 0.08)',
          'hover-softer': 'rgba(144, 184, 248, 0.05)',
          'card-tint': 'rgba(144, 184, 248, 0.06)',
        },
        // Espelha `src/assets/styles/tokens.css` (`--ct-*`). Manter em
        // sincronia: qualquer mudanca no tokens.css deve refletir aqui
        // (e vice-versa). `tokens.css` continua sendo fonte de verdade
        // para as views legadas que ainda referenciam `var(--ct-*)`.
        ct: {
          // Brand
          brand: '#5f85db',
          'brand-hover': '#90b8f8',
          'brand-text': '#90b8f8',
          'brand-soft': 'rgba(95, 133, 219, 0.14)',
          'brand-soft-hover': 'rgba(144, 184, 248, 0.18)',
          'brand-soft-strong': 'rgba(144, 184, 248, 0.24)',
          'brand-border': 'rgba(144, 184, 248, 0.18)',
          'brand-border-hover': 'rgba(144, 184, 248, 0.32)',

          // Surfaces
          'app-bg': '#26282b',
          bg: '#26282b',
          surface: '#353941',
          'surface-raised': '#3e434d',
          'surface-subtle': '#2d3036',
          'surface-elev': '#3e434d',
          'surface-hover': '#3e434d',
          border: 'rgba(144, 184, 248, 0.16)',
          'border-strong': 'rgba(144, 184, 248, 0.28)',

          // Text
          text: '#f4f7fb',
          'text-muted': '#c7d0e0',
          'text-faint': '#98a4b8',
          'text-ghost': '#7f8b9f',

          // Status
          success: '#4ade80',
          'success-soft': 'rgba(74, 222, 128, 0.12)',
          info: '#90b8f8',
          'info-soft': 'rgba(144, 184, 248, 0.14)',
          warn: '#fbbf24',
          'warn-soft': 'rgba(251, 191, 36, 0.13)',
          error: '#fb7185',
          'error-soft': 'rgba(251, 113, 133, 0.13)',
          whatsapp: '#4ade80',
          'whatsapp-soft': 'rgba(74, 222, 128, 0.12)',

          // Premium tier (Pro) — gold dessaturado
          gold: '#d9a441',
          'gold-soft': 'rgba(217, 164, 65, 0.10)',
          'gold-soft-hover': 'rgba(217, 164, 65, 0.15)',
          'gold-border': 'rgba(217, 164, 65, 0.24)',
          'gold-border-hover': 'rgba(217, 164, 65, 0.36)',

          // Subtle hovers / tints
          'hover-soft': 'rgba(144, 184, 248, 0.08)',
          'hover-softer': 'rgba(144, 184, 248, 0.05)',
          'card-tint': 'rgba(144, 184, 248, 0.06)',
        },
      },
    },
  },
  plugins: [],
};
