/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        opu: {
          pink: '#ec4899',
          orange: '#f97316',
          primary: '#ec4899',
          secondary: '#1a1a2e',
          accent: '#16213e',
          light: '#fdf2f8',
          dark: '#0a0a0a'
        }
      }
    },
  },
  plugins: [],
};
