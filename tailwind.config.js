/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dnd': {
          'red': '#922610',
          'gold': '#C9AD6A',
          'black': '#1A1A1A',
          'gray': {
            100: '#F5F5F5',
            200: '#E5E5E5', 
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        }
      },
      fontFamily: {
        'dnd': ['Scala Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}