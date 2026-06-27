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
      },
    },
  },
  plugins: [],
};

export default config;
