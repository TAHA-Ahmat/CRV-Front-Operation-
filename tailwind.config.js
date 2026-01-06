/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crv-blue': '#2563eb',
        'crv-blue-dark': '#1d4ed8',
        'crv-dark': '#1f2937',
        'crv-darker': '#111827',
      },
    },
  },
  plugins: [],
}
