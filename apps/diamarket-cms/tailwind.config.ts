import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: "class",
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          dark: 'var(--color-text)',
          accent: 'var(--color-accent)',
          surface: 'var(--color-surface)',
          'surface-alt': 'var(--color-surface-alt)',
          background: 'var(--color-background)',
          border: 'var(--color-border)',
          muted: 'var(--color-text-muted)',
          text: 'var(--color-text)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          error: 'var(--color-error)',
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
