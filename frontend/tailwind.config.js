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
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Electric Violet
          600: '#9333ea', // Royal Purple (Primary)
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#2e1065', // Deep Obsidian Purple
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Vibrant Emerald / Mint
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warm: {
          400: '#fbbf24',
          500: '#f59e0b', // Warm Amber Gold
          600: '#d97706',
        },
        coral: {
          400: '#fb7185',
          500: '#f43f5e', // Radiant Rose
          600: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
