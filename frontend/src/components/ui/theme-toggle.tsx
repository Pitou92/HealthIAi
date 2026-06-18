import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { cn } from '@/lib/utils';
import { Colors } from '@/constants/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleColorScheme } = useAppColorScheme();
  const rotation = useSharedValue(isDark ? 0 : 180);

  React.useEffect(() => {
    rotation.value = withSpring(isDark ? 0 : 180, { damping: 15 });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Pressable
      className={cn("h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm", className)}
      onPress={toggleColorScheme}
    >
      <Animated.View style={animatedStyle}>
        <SymbolView 
          name={isDark ? { ios: 'moon.stars.fill', android: 'dark_mode', web: 'dark_mode' } as any : { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' } as any} 
          size={20} 
          tintColor={isDark ? Colors.dark.foreground : Colors.light.foreground} 
        />
      </Animated.View>
    </Pressable>
  );
}
