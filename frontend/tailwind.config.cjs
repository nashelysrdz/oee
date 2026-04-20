/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#131517",//"#0a1628",     // fondo azul fuerte
        secondary: "#0B2545",   // Navy
        lzbblue: "#0F4C81",     // LZB Blue
        accent: "#5BC0BE",      // Turquoise
        dark: "#2E2E2E",        // Dark Gray
        light: "#FFFFFF",       // White
        secondary: {
          100: "#1E1F25",
          900: "#131517",
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
