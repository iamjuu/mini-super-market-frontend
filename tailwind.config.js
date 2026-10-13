/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#edf2ff',
          100: '#dbe5fe',
          200: '#bfd1fe',
          300: '#93b4fd',
          400: '#5a86f7',
          500: '#2c60ee',
          600: '#1b43c6',
          700: '#18308c',
          800: '#13256e',
          900: '#0e1b50',
          DEFAULT: '#18308c',
          hover: '#122470',
          light: '#ebf1fd',
        },
        accent: {
          orange: '#ff7824',
          'orange-hover': '#e56312',
          gold: '#ffba18',
          'gold-hover': '#e5a50e',
          DEFAULT: '#ff7824',
        },
        sidebar: {
          bg: '#0e1b50',
          card: '#18308c',
          border: '#2444b0',
          text: '#f8fafc',
          muted: '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
