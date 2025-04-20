/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans src directory including App.jsx
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0A2540', // Deep Navy - Use for main actions, highlights
          accent: '#8C3B4A',    // Muted Maroon - Use sparingly for secondary actions, hover
          textPrimary: '#111827', // Dark Gray - Main text color
          textSecondary: '#4B5563', // Medium Gray - Subtext, descriptions
          bg: '#FFFFFF',         // White - Main background
          bgSubtle: '#F9FAFB',    // Very Light Gray - Section backgrounds
          border: '#E5E7EB'       // Light Gray - Borders, dividers
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Modern, accessible sans-serif
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // Removed for now to simplify debugging
  ],
} 