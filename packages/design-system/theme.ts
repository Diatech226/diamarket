import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animations } from './animations';

export const createTheme = (mode: keyof typeof colors = 'light') => ({ colors: colors[mode], typography, spacing, radius, shadows, animations, mode });
export const theme = createTheme('light');
export const darkTheme = createTheme('dark');
export type DiamarketTheme = ReturnType<typeof createTheme>;
