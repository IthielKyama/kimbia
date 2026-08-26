/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FF4C29',
        background: '#0B0F19',
        surface: '#161F30',
        placeholder: '#9CA3AF',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
