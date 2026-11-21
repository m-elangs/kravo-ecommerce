/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kravo: {
          dark: '#20251F',       // Dark Forest primary
          darkMuted: '#2D342C',  // Dark Forest secondary
          orange: '#E68A42',     // Warm Orange accent
          orangeHover: '#D47730',
          cream: '#F4EBDD',      // Warm Cream background
          creamLight: '#FAF5EE',
          creamBorder: '#E6D9C8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
