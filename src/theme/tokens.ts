export const colors = {
  primary: '#3CB371',
  primaryDk: '#2E8B57',
  primarySoft: '#E6F4EC',
  navy: '#0F2C4F',
  yellow: '#FFC93C',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F7FB',
  border: '#E6E8EE',
  textHi: '#0F2C4F',
  textMd: '#5B6472',
  textLo: '#9AA1AC',
  danger: '#E5484D',
  success: '#3CB371',
  overlay: 'rgba(15, 44, 79, 0.5)',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

export const font = {
  family: {
    sans: 'System',
    arabic: 'System',
  },
  size: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 15,
    caption: 13,
    micro: 11,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    h1: 34,
    h2: 28,
    h3: 24,
    body: 22,
    caption: 18,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const tokens = { colors, radius, space, font, shadow } as const;

export type Tokens = typeof tokens;
