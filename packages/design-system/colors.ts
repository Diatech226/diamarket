export const olive = {
  50: '#f7f8f2', 100: '#ecefdd', 200: '#d9dfbb', 300: '#c0ca8e',
  400: '#a6b260', 500: '#8a9944', 600: '#6f7c34', 700: '#556B2F',
  800: '#464d23', 900: '#3b411f', 950: '#202412',
} as const;

export const gold = { 500: '#C9A227' } as const;

export const colors = {
  light: {
    Primary: olive[700], PrimaryHover: olive[800], PrimarySoft: olive[100],
    Secondary: olive[900], Accent: gold[500], Success: '#15803d', Warning: '#b45309', Danger: '#b91c1c',
    Surface: '#ffffff', SurfaceAlt: '#f7f8f2', Border: '#d9dfbb', Divider: '#ecefdd',
    Text: '#1f2937', TextMuted: '#6b7280', Sidebar: '#202412', SidebarActive: olive[700], SidebarHover: '#3b411f',
    Card: '#ffffff', CardHover: '#f7f8f2', Overlay: 'rgba(32, 36, 18, 0.64)',
    Input: '#ffffff', InputFocus: olive[700], Skeleton: '#ecefdd', Placeholder: '#9ca3af',
  },
  dark: {
    Primary: olive[300], PrimaryHover: olive[200], PrimarySoft: '#2f3519',
    Secondary: '#f7f8f2', Accent: gold[500], Success: '#4ade80', Warning: '#fbbf24', Danger: '#f87171',
    Surface: '#11140a', SurfaceAlt: '#202412', Border: '#464d23', Divider: '#3b411f',
    Text: '#f9fafb', TextMuted: '#cbd5e1', Sidebar: '#0b0d06', SidebarActive: '#2f3519', SidebarHover: '#202412',
    Card: '#161a0d', CardHover: '#202412', Overlay: 'rgba(0, 0, 0, 0.72)',
    Input: '#161a0d', InputFocus: olive[300], Skeleton: '#2f3519', Placeholder: '#94a3b8',
  },
} as const;

export type ColorToken = keyof typeof colors.light;
export const semanticColors = colors.light;
