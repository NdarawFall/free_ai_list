/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111315',
        cloud: '#f7f7f2',
        moss: '#667761',
        clay: '#b76e55',
        petrol: '#225560',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(17, 19, 21, 0.12)',
      },
    },
  },
  plugins: [],
}
