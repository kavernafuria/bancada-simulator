import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kavers: {
          dark: "#0A0A0C",
          card: "#131722",
          border: "#2A2F3D",
          purple: {
            DEFAULT: "#8B5CF6",
            hover: "#7C3AED",
          },
          magenta: {
            DEFAULT: "#EC4899",
            hover: "#DB2777",
          },
          emerald: {
            DEFAULT: "#10B981",
            hover: "#059669",
          },
          flame: {
            DEFAULT: "#F97316",
            hover: "#EA580C",
          },
          light: "#F8F7F4",
          "light-card": "#FFFFFF",
          "light-border": "#E5E0D8",
        },
        stadium: {
          dark: "#0A0A0C",
          card: "#131722",
          border: "#2A2F3D",
        },
        volt: {
          DEFAULT: "#10B981",
          hover: "#059669",
        },
        flame: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
        },
        paper: {
          light: "#F8F7F4",
          card: "#FFFFFF",
          border: "#E5E0D8",
        },
        grass: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
        },
        terracotta: {
          DEFAULT: "#EC4899",
          hover: "#DB2777",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shake: "shake 0.4s cubic-bezier(.36,.07,.19,.97) both",
        "spin-once": "spin 0.5s ease-in-out",
        "card-pop": "cardPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        cardPop: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
