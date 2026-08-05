import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", light: "#60A5FA", dark: "#1D4ED8" },
        secondary: { DEFAULT: "#7C3AED", light: "#A78BFA", dark: "#6D28D9" },
        success: "#16A34A",
        warning: "#EA580C",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        h1: ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["30px", { lineHeight: "1.25", fontWeight: "700" }],
        h3: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.5" }],
        small: ["14px", { lineHeight: "1.5" }],
        caption: ["12px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
