/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        slate: {
          850: '#172033',
          950: '#0b1120',
        },
        amber: {
          350: '#fcd580',
        }
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        }
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-up-2':  'fadeUp 0.4s 0.1s ease both',
        'fade-up-3':  'fadeUp 0.4s 0.2s ease both',
        'fade-up-4':  'fadeUp 0.4s 0.3s ease both',
        shimmer:      'shimmer 1.4s infinite linear',
      }
    },
  },
  plugins: [],
}