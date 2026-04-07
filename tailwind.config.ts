import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0f1e",
        panel: "#111a2d",
        accent: "#7c3aed",
        success: "#10b981"
      }
    }
  },
  plugins: []
};

export default config;
