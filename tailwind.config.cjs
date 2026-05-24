/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/app-v2/**/*.{ts,tsx}'],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // Paleta da landing page React antiga preservada no runtime.
      // Aditivo: namespace `landing.*` evita conflito com cores existentes.
      // Valores extraidos do mockup aprovado em cooltrackpro.html.
      colors: {
        landing: {
          navy: '#020B2D',
          'navy-2': '#031B4E',
          'navy-3': '#06245F',
          blue: '#006DFF',
          'blue-vivid': '#159BFF',
          cyan: '#40C4FF',
          off: '#F5F8FC',
          line: '#E3EAF4',
          ink: '#0B1B33',
          'ink-2': '#5B6B82',
          green: '#18B884',
          orange: '#F59E0B',
          red: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
