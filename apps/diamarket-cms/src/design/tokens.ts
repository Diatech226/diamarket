import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} as const;

export type DesignTokens = typeof tokens;
