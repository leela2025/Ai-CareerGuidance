/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct Theme Tokens (Forest Green + Warm Gold)
        primary: {
          DEFAULT: '#1B4332',       // deep forest green - main brand color
          light: '#2D6A4F',         // lighter forest green - hover states, secondary buttons
          dark: '#0F2A1D',          // near-black green - dark backgrounds, footer, navbar-dark mode
        },
        accent: {
          DEFAULT: '#D4A017',       // warm gold - CTAs, highlights, badges
          light: '#E8C468',         // lighter gold - hover states on accent elements
          dark: '#A67C00',          // deep gold/bronze - pressed states, borders
          50: '#FDF9EE',
          100: '#FAF1D4',
          200: '#F5E3A9',
          300: '#E8C468',
          400: '#DFC24B',
          500: '#D4A017',           // warm gold
          600: '#B8860B',
          700: '#A67C00',           // deep gold / bronze
          800: '#7B5B00',
          900: '#4D3900',
        },
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#B9F1D0',
          300: '#74DFA2',
          400: '#40C281',
          500: '#2D6A4F',           // lighter forest green
          600: '#1B4332',           // deep forest green - main brand color
          700: '#143527',
          800: '#0F2A1D',           // near-black green
          900: '#0B1F15',
          950: '#081710',
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#E8C468',
          dark: '#A67C00',
          50: '#FDF9EE',
          100: '#FAF1D4',
          200: '#F5E3A9',
          300: '#E8C468',
          400: '#DFC24B',
          500: '#D4A017',
          600: '#B8860B',
          700: '#A67C00',
          800: '#7B5B00',
          900: '#4D3900',
        },
        forest: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          dark: '#0F2A1D',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#B9F1D0',
          300: '#74DFA2',
          400: '#40C281',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#143527',
          800: '#0F2A1D',
          900: '#0B1F15',
          950: '#10231A',
        },
        success: '#2D6A4F',         // reuse primary-light for success states
        warning: '#D4A017',         // reuse accent gold for warnings
        danger: '#9B2C2C',          // muted brick red - errors only
        surface: {
          DEFAULT: '#FFFFFF',       // card backgrounds
          dark: '#162C22',          // card backgrounds in dark mode
        },
        theme: {
          bg: '#FAF7F0',            // warm off-white/cream
          'bg-dark': '#10231A',     // deep green-black dark mode background
          surface: '#FFFFFF',
          'surface-dark': '#162C22',
          text: '#1A2E22',          // near-black with slight green undertone
          'text-muted': '#5B6F63',  // muted sage-gray for secondary text
          border: '#D9D2C2',        // warm light border color
          'border-dark': '#233F31', // dark mode border
        },
        // Ironclad Safety Fallbacks: Alias any legacy blue/purple/indigo/violet/teal to the new palette
        indigo: {
          50: '#FDF9EE',
          100: '#FAF1D4',
          200: '#F5E3A9',
          300: '#E8C468',
          400: '#DFC24B',
          500: '#D4A017',
          600: '#1B4332',
          700: '#143527',
          800: '#0F2A1D',
          900: '#0B1F15',
          950: '#10231A',
        },
        purple: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#B9F1D0',
          300: '#74DFA2',
          400: '#40C281',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#143527',
          800: '#0F2A1D',
          900: '#0B1F15',
          950: '#10231A',
        },
        violet: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#B9F1D0',
          300: '#74DFA2',
          400: '#40C281',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#143527',
          800: '#0F2A1D',
          900: '#0B1F15',
          950: '#10231A',
        },
        teal: {
          50: '#FDF9EE',
          100: '#FAF1D4',
          200: '#F5E3A9',
          300: '#E8C468',
          400: '#DFC24B',
          500: '#D4A017',
          600: '#2D6A4F',
          700: '#1B4332',
          800: '#0F2A1D',
          900: '#0B1F15',
          950: '#10231A',
        },
        blue: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#B9F1D0',
          300: '#74DFA2',
          400: '#2D6A4F',
          500: '#1B4332',
          600: '#143527',
          700: '#0F2A1D',
          800: '#0B1F15',
          900: '#081710',
          950: '#10231A',
        },
        cyan: {
          50: '#FDF9EE',
          100: '#FAF1D4',
          200: '#F5E3A9',
          300: '#E8C468',
          400: '#DFC24B',
          500: '#D4A017',
          600: '#B8860B',
          700: '#A67C00',
          800: '#7B5B00',
          900: '#4D3900',
          950: '#10231A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
