import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#f7f8f2",
          100: "#ecefdd",
          200: "#d9dfbb",
          300: "#c0ca8e",
          400: "#a6b260",
          500: "#8a9944",
          600: "#6f7c34",
          700: "#556B2F",
          800: "#464d23",
          900: "#3b411f",
          950: "#202412",
        }
      },
    },
  },
  plugins: []
};

export default config;
