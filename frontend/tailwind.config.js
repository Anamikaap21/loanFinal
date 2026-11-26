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
          red: "#D71938",          // Primary Red (Brand Identity)
          deepRed: "#B5122D",      // Deep Red (Hover, Accents, Focus)
          redAccent: "#D71938",    // Accent Red
          redLight: "#FFF1F3",     // Light Red Background tint
          white: "#FFFFFF",        // Pure White
          bg: "#F8F8FA",           // Light Page Background
          textPrimary: "#242424",  // Primary Body / Heading Text
          textSecondary: "#666666",// Secondary Subtitle / Label Text
          border: "#E5E5E5",       // Global Clean Border
          card: "#FFFFFF",         // Card Background
          cardBorder: "#E5E5E5",   // Card Border
          dark: "#FFFFFF",         // Mapped to White for light-theme card surfaces
          black: "#F8F8FA",        // Mapped to Light Background for light-theme page viewports
          grey: "#666666",         // Secondary Text
          lightGrey: "#4A4A4A",    // Medium readable neutral text
          surface: "#FFFFFF",      // Surface white
          subtle: "#F4F4F6",       // Subtle grey fill
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(215, 25, 56, 0.1), 0 8px 10px -6px rgba(215, 25, 56, 0.06)',
        'red': '0 4px 14px 0 rgba(215, 25, 56, 0.25)',
      }
    },
  },
  plugins: [],
}
