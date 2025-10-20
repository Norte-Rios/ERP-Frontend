/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green-dark': '#134036',
        'brand-green-light': '#38806E',
        'brand-teal': '#55A894',
        'brand-orange': '#F0A23E',
        'brand-yellow': '#F8D87A',
      }
    },
  },
  plugins: [],
}