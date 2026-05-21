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
        obsidian: '#090907',
        porcelain: '#F2EEDA',
        acid: '#BCFF00',
        copper: '#C67D3D',
        primary: '#0f172a',
        surface: '#1e293b',
        accent: '#BCFF00', // Aligning accent with acid as it's often used interchangeably in the CSS
        muted: '#64748b',
        text: '#f1f5f9',
        background: '#090907',
      },
      boxShadow: {
        acid: '0 26px 90px rgba(21, 94, 117, 0.18)',
        luxury: '0 30px 110px rgba(0, 0, 0, 0.42)',
      },
    },
  },
  plugins: [],
}
