/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chilliblue: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#005ce6',
          600: '#0047b3',
          700: '#003380',
          800: '#001f4d',
          900: '#000a1a',
        },
        steel: {
          100: '#e0e4e8',
          200: '#c1c9d1',
          300: '#a3aeba',
          400: '#8494a3',
          500: '#657a8c',
          600: '#516170',
          700: '#3d4954',
          800: '#283038',
          900: '#14181c',
        }
      }
    },
  },
  plugins: [],
}
