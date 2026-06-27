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
      },
    },
  },
  plugins: [],
};

export default config;
