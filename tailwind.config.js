/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'ui-serif', 'serif'],
      },
      colors: {
        obsidian: '#090907',
        porcelain: '#f2eeda',
        acid: '#d7ff45',
        copper: '#c87941',
        graphite: '#151712',
      },
      boxShadow: {
        acid: '0 26px 90px rgba(215, 255, 69, 0.18)',
        luxury: '0 30px 110px rgba(0, 0, 0, 0.42)',
      },
    },
  },
  plugins: [],
}
