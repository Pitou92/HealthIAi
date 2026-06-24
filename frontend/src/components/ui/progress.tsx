import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof View> {
  value: number; // 0-100
  color?: string;
  className?: string;
}

function Progress({ value, color = '#22C55E', className, style, ...props }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${clamped}%`, { damping: 20, stiffness: 90 }),
    };
  }, [clamped]);

  return (
    <View
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <Animated.View
        style={[
          animatedStyle,
          { backgroundColor: color, height: '100%', borderRadius: 999 },
          style as any
        ]}
      />
    </View>
  );
}

export { Progress };
