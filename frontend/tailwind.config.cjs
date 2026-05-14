/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#03152E",      // fondo oscuro
        card: "#0B2545",         // card login
        lzbblue: "#1B5C99",      // azul botones
        input: "#021227",        // inputs
        accent: "#5BC0BE",
        dark: "#2E2E2E",
        light: "#FFFFFF",
      
        secondary: {
          100: "#1E1F25",
          900: "#131517",
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
