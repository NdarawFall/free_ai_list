/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#eef2ff',
        cloud: '#070812',
        violet: '#8b5cf6',
        cyan: '#22d3ee',
        rose: '#fb7185',
        lime: '#bef264',
      },
      boxShadow: {
        glow: '0 24px 90px rgba(34, 211, 238, 0.16)',
        violet: '0 24px 100px rgba(139, 92, 246, 0.22)',
      },
    },
  },
  plugins: [],
}
