import type { Config } from 'tailwindcss';
import { colors, olive, gold } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';

const preset: Partial<Config> = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: { olive, gold, ds: colors.light, 'ds-dark': colors.dark },
      spacing,
      borderRadius: radius,
      boxShadow: shadows,
    },
  },
};

export default preset;
