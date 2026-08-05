/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f1',
          100: '#feeedb',
          200: '#fdd9b5',
          300: '#fbbd84',
          400: '#FFB74D', // Accent
          500: '#F57C00', // Primary Orange
          600: '#e65100',
          700: '#bf360c',
          800: '#982b0e',
          900: '#7b260f',
          950: '#431005',
        },
        ssmiet: {
          orange: '#F57C00',
          accent: '#FFB74D',
          dark: '#0F172A',
          cardDark: '#1E293B',
          borderDark: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
