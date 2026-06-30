import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        surface: "#111111",
        surfaceHover: "#1a1a1a",
        border: "#1f1f1f",
        accent: {
          DEFAULT: "#00B4D8",
          hover: "#0096B4",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#F0F0F0",
          muted: "#A0A0A0",
        },
        error: "#f87171",
        success: "#4ade80",
      },
    },
  },
  plugins: [],
};
export default config;
