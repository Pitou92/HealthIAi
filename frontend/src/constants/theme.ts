import '@/global.css';

import { Platform } from 'react-native';

// Sport palette: Green × Blue × Dark
export const SP = {
  bg: '#111827',
  bgCard: '#1F2937',
  bgInput: '#374151',

  text: '#F9FAFB',
  textDim: '#D1D5DB',
  textMuted: '#9CA3AF',

  primary: '#22C55E',
  primaryDeep: '#16A34A',
  secondary: '#3B82F6',
  accent: 'rgba(34, 197, 94, 0.45)',

  border: 'rgba(34, 197, 94, 0.25)',
  borderDim: 'rgba(255, 255, 255, 0.08)',

  blob1: 'rgba(34, 197, 94, 0.15)',
  blob2: 'rgba(59, 130, 246, 0.12)',
  blob3: 'rgba(34, 197, 94, 0.08)',
} as const;

export const Colors = {
  light: {
    text: SP.text,
    background: SP.bg,
    backgroundElement: SP.bgInput,
    backgroundSelected: 'rgba(34, 197, 94, 0.15)',
    textSecondary: SP.textDim,
  },
  dark: {
    text: SP.text,
    background: SP.bg,
    backgroundElement: SP.bgInput,
    backgroundSelected: 'rgba(34, 197, 94, 0.15)',
    textSecondary: SP.textDim,
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
