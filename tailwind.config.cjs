/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/react/**/*.{js,jsx,ts,tsx}'],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
