import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated';
import { Text } from './text';
import { cn } from '@/lib/utils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  icon?: string;
  label?: string;
  unit?: string;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  color = '#22C55E',
  icon,
  label,
  unit,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? clampedValue / max : 0;
  
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = withTiming(
      circumference - percentage * circumference,
      { duration: 1000 }
    );
    return { strokeDashoffset };
  }, [percentage, circumference]);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          stroke="#27272A"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center justify-center gap-1">
        {icon && <Text className="text-xl">{icon}</Text>}
        <View className="flex-row items-baseline gap-0.5">
          <Text className="text-2xl font-bold">{Math.round(value)}</Text>
          {unit && <Text className="text-xs text-muted-foreground">{unit}</Text>}
        </View>
      </View>
    </View>
  );
}
