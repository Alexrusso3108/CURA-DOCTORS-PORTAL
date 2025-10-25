/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cura-primary': '#0066CC',
        'cura-secondary': '#00A3E0',
        'cura-accent': '#00C9A7',
      },
    },
  },
  plugins: [],
}
