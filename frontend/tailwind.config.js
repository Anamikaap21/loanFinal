/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#111111",
          dark: "#171717",
          card: "#1E1E22",
          cardBorder: "#27272A",
          red: "#C8102E",
          redAccent: "#EF3340",
          redLight: "#FFE4E6",
          grey: "#A1A1AA",
          lightGrey: "#E4E4E7",
          border: "#3F3F46",
          surface: "#1A1A1E"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
