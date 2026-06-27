import type { Config } from 'tailwindcss';
import diamarketPreset from '@diamarket/design-system/tailwind-preset';

const config: Config = {
  presets: [diamarketPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/design-system/**/*.{ts,tsx}'],
  plugins: [],
};

export default config;
