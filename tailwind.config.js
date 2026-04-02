/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jungle: '#6b9080',
        muted: '#a4c3b2',
        frozen: '#cce3de',
        azure: '#eaf4f4',
        mint: '#f6fff8',
        alert: '#e63946',
        warning: '#fbc02d'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
