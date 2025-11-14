/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'royal-gold': {
          50: '#fff9e6',
          100: '#fcefc2',
          200: '#f8e39a',
          300: '#f1d36e',
          400: '#e8c144',
          500: '#d4af37',
          600: '#b8931f',
          700: '#8e6f15',
          800: '#6b540f',
          900: '#4d3b0a',
        },
        primary: {
          50: '#fff9e6',
          100: '#fcefc2',
          200: '#f8e39a',
          300: '#f1d36e',
          400: '#e8c144',
          500: '#d4af37',
          600: '#b8931f',
          700: '#8e6f15',
          800: '#6b540f',
          900: '#4d3b0a',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float-delayed 3s ease-in-out infinite 1.5s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
