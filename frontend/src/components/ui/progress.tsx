import * as React from 'react';
import { View } from 'react-native';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof View> {
  value: number; // 0-100
  color?: string;
  className?: string;
}

function Progress({ value, color = '#22C55E', className, style, ...props }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <View
      className={`h-1.5 w-full overflow-hidden rounded-full bg-bg-input ${className ?? ''}`}
      {...props}
    >
      <View
        style={[{ width: `${clamped}%` as any, backgroundColor: color, height: '100%', borderRadius: 999 }, style]}
      />
    </View>
  );
}

export { Progress };
