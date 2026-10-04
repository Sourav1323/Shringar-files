/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: '#7a2c1a',
          'maroon-dark': '#4a150b',
          'maroon-light': '#9e3a24',
          gold: '#ffd700',
          'gold-dark': '#c9a227',
          'gold-light': '#fff1a8',
          cream: '#fdfbf7',
          'cream-dark': '#f5ede2',
          dark: '#241711',
          muted: '#6e5a4f',
        }
      },
      fontFamily: {
        serif: ['"Cinzel Decorative"', '"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
