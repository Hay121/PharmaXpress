/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-hover': '#F8FAFC',
        'surface-active': '#F1F5F9',
        primary: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          subtle: '#CCFBF1',
          ring: '#CCFBF1',
        },
        status: {
          success: '#059669',
          warning: '#D97706',
          critical: '#DC2626',
          info: '#2563EB',
        },
        slate: {
          900: '#0F172A',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'fluid': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      }
    },
  },
  plugins: [],
}
