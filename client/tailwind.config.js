/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#f0b429', dark: '#e07b1a', light: '#f5c842' },
        accent: '#ff6b35',
        bg: { DEFAULT: '#0a0a0f', 2: '#12121a', 3: '#1a1a26', 4: '#22223a' },
        card: { DEFAULT: '#14141f', 2: '#1e1e2e' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
