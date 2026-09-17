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
        'brand-dark': '#0a0e1a',
        'brand-navy': '#0d1117',
        'brand-surface': '#161b2e',
        'brand-border': '#1e2740',
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
