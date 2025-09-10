/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/theme");

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/tabs/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/navbar/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/link/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/table/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/chip/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/button/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        "3xl": "1600px",
        "4xl": "1920px",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "3rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1400px",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui(),
    require('@tailwindcss/line-clamp'),
  ],
};
