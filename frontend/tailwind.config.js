/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
        heading: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      colors: {
        border: 'hsl(210, 18%, 87%)',
        input: 'hsl(210, 18%, 87%)',
        ring: 'hsl(215, 85%, 45%)',
        background: 'hsl(210, 20%, 98%)',
        foreground: 'hsl(215, 25%, 15%)',
        primary: {
          DEFAULT: 'hsl(215, 85%, 45%)',
          foreground: 'hsl(0, 0%, 100%)',
          hover: 'hsl(215, 85%, 38%)',
          active: 'hsl(215, 85%, 32%)'
        },
        secondary: {
          DEFAULT: 'hsl(210, 15%, 92%)',
          foreground: 'hsl(215, 25%, 20%)',
          hover: 'hsl(210, 15%, 88%)'
        },
        destructive: {
          DEFAULT: 'hsl(0, 72%, 51%)',
          foreground: 'hsl(0, 0%, 100%)'
        },
        muted: {
          DEFAULT: 'hsl(210, 15%, 92%)',
          foreground: 'hsl(215, 16%, 47%)'
        },
        accent: {
          DEFAULT: 'hsl(210, 15%, 92%)',
          foreground: 'hsl(215, 25%, 20%)'
        },
        popover: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(215, 25%, 15%)'
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(215, 25%, 15%)'
        },
        neutral: {
          50: 'hsl(210, 20%, 98%)',
          100: 'hsl(210, 20%, 95%)',
          200: 'hsl(210, 18%, 90%)',
          300: 'hsl(210, 16%, 82%)',
          400: 'hsl(210, 14%, 66%)',
          500: 'hsl(210, 12%, 50%)',
          600: 'hsl(210, 14%, 38%)',
          700: 'hsl(210, 18%, 28%)',
          800: 'hsl(215, 22%, 18%)',
          900: 'hsl(215, 25%, 12%)'
        },
        status: {
          pending: 'hsl(38, 92%, 50%)',
          approved: 'hsl(145, 65%, 42%)',
          rejected: 'hsl(0, 72%, 51%)',
          draft: 'hsl(210, 14%, 66%)',
          'in-progress': 'hsl(200, 85%, 48%)',
          completed: 'hsl(145, 65%, 42%)',
          'low-stock': 'hsl(0, 72%, 51%)',
          'adequate-stock': 'hsl(145, 65%, 42%)'
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
