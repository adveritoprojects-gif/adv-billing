/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#F0F4F1",
        surface: "#FFFFFF",
        surfaceAlt: "#E4ECE6",
        ink: "#1E2A24",
        inkSoft: "#5B6B61",
        border: "#CBD8CF",
        tealDeep: "#14453F",
        teal: "#1F6F63",
        tealLight: "#E6F0EE",
        amber: "#B0721F",
        rose: "#B23B3B",
        roseLight: "#FCEAEA",
        green: "#2E7D4F",
      },
      fontFamily: {
        head: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
