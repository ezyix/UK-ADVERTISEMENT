/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: '#25D366', // Your main call-to-action color
        whatsappDark: '#128C7E', // For hover states
      }
    },
  },
  plugins: [],
}