import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F6FE',
          100: '#DFEDFD',
          200: '#BFD6F3',
          300: '#8FB8EB',
          400: '#5F9AE3',
          500: '#3A7DDB',
          600: '#3D6EAF',
          700: '#2B5387',
          800: '#1E3A5F', // Brand Primary
          900: '#0F2340',
          950: '#081326',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Brand Accent
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
