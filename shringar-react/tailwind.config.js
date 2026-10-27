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
          // Emergent Luxury Palette Tokens
          henna: '#4A2511',
          'henna-hover': '#3A1D0D',
          'gold-royal': '#B58E34',
          'gold-soft': '#d6b367',
          'sand-bg': '#FDFBF7',
          'sand-surface': '#FFFFFF',
          'sand-surface-2': '#F3EFE6',
          'sand-border': '#E6DFD3',
          'sand-text': '#2C160A',
          'sand-muted': '#7A6356',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'serif-cormorant': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'serif-luxury': ['"Cinzel Decorative"', '"Cinzel"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
