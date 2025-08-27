/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/theme");

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // Include all JS/TS files in src/app/
    "./src/components/**/*.{js,ts,jsx,tsx}", // Include all component files
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()],
};
