const family = {
  sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
} as const;

export const typography = {
  Display: { fontFamily: family.sans, fontSize: '3rem', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.03em' },
  Headline: { fontFamily: family.sans, fontSize: '2rem', fontWeight: '700', lineHeight: '1.2', letterSpacing: '-0.02em' },
  Title: { fontFamily: family.sans, fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4', letterSpacing: '-0.01em' },
  Body: { fontFamily: family.sans, fontSize: '1rem', fontWeight: '400', lineHeight: '1.6', letterSpacing: '0' },
  Caption: { fontFamily: family.sans, fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.45', letterSpacing: '0' },
  Label: { fontFamily: family.sans, fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.25', letterSpacing: '0.01em' },
  Code: { fontFamily: family.mono, fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.5', letterSpacing: '0' },
} as const;
