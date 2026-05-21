/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'ui-serif', 'serif'],
      },
      colors: {
        primary: '#0f172a', // slate-900
        surface: '#1e293b', // slate-800
        accent: '#14b8a6', // teal-500
        muted: '#64748b', // slate-500
        text: '#f1f5f9', // slate-100
        background: '#0f172a',
      },
      boxShadow: {
        acid: '0 26px 90px rgba(21, 94, 117, 0.18)',
        luxury: '0 30px 110px rgba(0, 0, 0, 0.42)',
      },
    },
  },
  plugins: [],
}
