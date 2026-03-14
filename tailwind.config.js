/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        secondary: '#2D6A4F',
        accent: '#52B788',
      }
    },
  },
  plugins: [],
}
