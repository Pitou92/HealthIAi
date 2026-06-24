import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

interface ColorSchemeState {
  colorScheme: 'light' | 'dark' | 'system';
  isDark: boolean;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  toggleColorScheme: () => void;
}

export const useAppColorScheme = create<ColorSchemeState>()(
  persist(
    (set, get) => ({
      colorScheme: 'system',
      isDark: Appearance.getColorScheme() === 'dark',
      setColorScheme: (scheme) => {
        const systemDark = Appearance.getColorScheme() === 'dark';
        const isDark = scheme === 'system' ? systemDark : scheme === 'dark';
        set({ colorScheme: scheme, isDark });
      },
      toggleColorScheme: () => {
        const current = get().isDark;
        set({ colorScheme: current ? 'light' : 'dark', isDark: !current });
      },
    }),
    {
      name: 'healthai-theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.colorScheme === 'system') {
           state.isDark = Appearance.getColorScheme() === 'dark';
        }
      }
    }
  )
);
