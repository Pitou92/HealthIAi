import '@/global.css';

import { Platform } from 'react-native';

// DepthFold dark neon palette — used across all screens
export const DF = {
  bg: '#050c0a',
  bgMid: '#0a1a12',
  bgCard: 'rgba(255, 255, 255, 0.048)',
  bgInput: 'rgba(255, 255, 255, 0.07)',

  text: '#e8fff8',
  textDim: 'rgba(180, 255, 232, 0.58)',
  textMuted: 'rgba(180, 255, 232, 0.32)',

  mint: '#00ffd6',
  violet: '#c084fc',
  green: '#4ade80',
  pink: '#f472b6',
  cyan: '#22d3ee',

  border: 'rgba(0, 255, 214, 0.22)',
  borderViolet: 'rgba(192, 132, 252, 0.28)',
  borderDim: 'rgba(255, 255, 255, 0.10)',

  orb1: 'rgba(0, 255, 214, 0.13)',
  orb2: 'rgba(192, 132, 252, 0.12)',
  orb3: 'rgba(8, 226, 96, 0.08)',
} as const;

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: DF.text,
    background: DF.bg,
    backgroundElement: DF.bgCard,
    backgroundSelected: 'rgba(0, 255, 214, 0.1)',
    textSecondary: DF.textDim,
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
