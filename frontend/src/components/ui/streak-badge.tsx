import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function StreakBadge({ days, className }: { days: number; className?: string }) {
  const isHot = days >= 3;
  
  const animatedStyle = useAnimatedStyle(() => {
    if (!isHot) return { transform: [{ scale: 1 }] };
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.2, { duration: 800 }),
              withTiming(1, { duration: 800 })
            ),
            -1,
            true
          )
        }
      ]
    };
  }, [isHot]);

  return (
    <View className={cn("flex-row items-center self-start gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 border border-orange-500/30", className)}>
      <Animated.View style={animatedStyle}>
        <Text className="text-base">🔥</Text>
      </Animated.View>
      <Text className="text-sm font-bold text-orange-500">{days} Jours</Text>
    </View>
  );
}
