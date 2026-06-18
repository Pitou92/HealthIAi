import * as React from 'react';
import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from './text';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "flex-row items-center self-start rounded-full px-2.5 py-0.5 border",
  {
    variants: {
      variant: {
        default: "bg-primary border-transparent",
        secondary: "bg-secondary border-transparent",
        destructive: "bg-destructive border-transparent",
        outline: "bg-transparent border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const badgeTextVariants = cva(
  "text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        secondary: "text-secondary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends React.ComponentPropsWithoutRef<typeof View>, VariantProps<typeof badgeVariants> {
  label: string;
}

function Badge({ variant, label, className, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={badgeTextVariants({ variant })}>{label}</Text>
    </View>
  );
}

export { Badge, badgeVariants };
