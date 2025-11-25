/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#00ff88',
        'brand-cyan': '#00d4ff',
        'brand-dark': '#0a0e1a',
        'brand-navy': '#0d1117',
        'brand-surface': '#161b2e',
        'brand-border': '#1e2740',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #00ff88, #00d4ff)',
      }
    },
  },
  plugins: [],
}
