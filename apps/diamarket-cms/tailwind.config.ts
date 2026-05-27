import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: { 700: "#556B2F" },
        gold: { 500: "#C9A227" },
      },
    },
  },
  plugins: [],
};

export default config;
