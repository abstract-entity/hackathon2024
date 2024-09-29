/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'light-blue-stef': '#009EE0',
        'dark-blue-stef': '#2D4C9C',
      }
    },
  },
  plugins: [],
}

