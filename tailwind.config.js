/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 покрывает все файлы в src
    "./app/**/*.{js,ts,jsx,tsx}", // (если есть app/)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};