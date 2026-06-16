import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text';

type Variant = 'default' | 'secondary' | 'success' | 'muted';

interface BadgeProps extends React.ComponentPropsWithoutRef<typeof View> {
  variant?: Variant;
  label: string;
  className?: string;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  default:   { container: 'bg-primary/15 border border-primary/30', text: 'text-primary' },
  secondary: { container: 'bg-secondary/15 border border-secondary/30', text: 'text-secondary' },
  success:   { container: 'bg-primary/15 border border-primary/30', text: 'text-primary' },
  muted:     { container: 'bg-bg-input border border-white/8', text: 'text-muted' },
};

function Badge({ variant = 'default', label, className, ...props }: BadgeProps) {
  const v = variantClasses[variant];
  return (
    <View
      className={`flex-row items-center self-start rounded-full px-2.5 py-1 ${v.container} ${className ?? ''}`}
      {...props}
    >
      <Text className={`text-xs font-semibold ${v.text}`}>{label}</Text>
    </View>
  );
}

export { Badge };
