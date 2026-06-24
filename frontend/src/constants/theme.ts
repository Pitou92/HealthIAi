import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    foreground: '#09090B',
    card: '#FFFFFF',
    muted: '#E4E4E7',
    mutedForeground: '#71717A',
    border: '#E4E4E7',
    primary: '#22C55E',
  },
  dark: {
    background: '#09090B',
    foreground: '#FAFAFA',
    card: '#18181B',
    muted: '#27272A',
    mutedForeground: '#A1A1AA',
    border: '#27272A',
    primary: '#22C55E',
  },
} as const;

// Backward compatibility alias for ongoing migration
export const SP = {
  bg: '#09090B',
  bgCard: '#18181B',
  bgInput: '#27272A',
  text: '#FAFAFA',
  textDim: '#A1A1AA',
  textMuted: '#A1A1AA',
  primary: '#22C55E',
  primaryDeep: '#16A34A',
  secondary: '#3B82F6',
  accent: 'rgba(34, 197, 94, 0.45)',
  border: '#27272A',
  borderDim: 'rgba(255, 255, 255, 0.08)',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
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
