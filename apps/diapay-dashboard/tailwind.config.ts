import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        mint: '#15f5ba',
        ocean: '#2563eb',
        gold: '#f8c14a',
      },
      boxShadow: {
        premium: '0 24px 80px rgba(15, 23, 42, 0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
