import '@/global.css';

import { Platform } from 'react-native';

// Orange & White palette
export const OW = {
  bg: '#FFFAF5',
  bgCard: '#FFFFFF',
  bgInput: '#FFF3EA',

  text: '#1C0A00',
  textDim: '#7C4A2A',
  textMuted: '#C4956A',

  orange: '#F97316',
  orangeDeep: '#EA580C',
  amber: '#F59E0B',
  peach: '#FDBA74',

  border: 'rgba(249, 115, 22, 0.2)',
  borderDim: 'rgba(0, 0, 0, 0.07)',

  // Animated blob colors
  blob1: 'rgba(249, 115, 22, 0.12)',
  blob2: 'rgba(251, 191, 36, 0.10)',
  blob3: 'rgba(253, 186, 116, 0.14)',
} as const;

export const Colors = {
  light: {
    text: OW.text,
    background: OW.bg,
    backgroundElement: OW.bgInput,
    backgroundSelected: 'rgba(249, 115, 22, 0.12)',
    textSecondary: OW.textDim,
  },
  dark: {
    text: OW.text,
    background: OW.bg,
    backgroundElement: OW.bgInput,
    backgroundSelected: 'rgba(249, 115, 22, 0.12)',
    textSecondary: OW.textDim,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
