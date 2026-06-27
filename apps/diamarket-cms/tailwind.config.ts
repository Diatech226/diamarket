import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0058BE',
          dark: '#091426',
          accent: '#F59E0B',
          surface: '#F8F9FF',
          border: '#E2E8F0',
          muted: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        olive: {
          50: '#F8FAF0',
          100: '#EEF3D8',
          500: '#8AA04B',
          600: '#6F8437',
          700: '#556B2F',
          800: '#435625',
          900: '#33421D',
        },
      },
    },
  },
  plugins: [],
};

export default config;
