/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sprout: {
          green: "#5CB85C",
          yellow: "#FFF3B0",
          mint: "#D4EDDA",
          sky: "#76E4F7",
          amber: "#F6AD55",
          lavender: "#D6BCFA",
          coral: "#FC8181",
          bg: "#FFFDE7",
          bgalt: "#F3F9F0",
        },
        engineer: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          accent: "#6366F1",
        },
      },
      fontFamily: {
        child: ["'Nunito'", "system-ui", "sans-serif"],
        engineer: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        pulse_slow: "pulse 3s ease-in-out infinite",
        burst: "burst 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        burst: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
