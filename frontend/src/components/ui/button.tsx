import * as React from 'react';
import { Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from './text';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl",
  {
    variants: {
      variant: {
        default: "bg-primary shadow-sm",
        destructive: "bg-destructive shadow-sm",
        outline: "border border-input bg-background shadow-sm",
        secondary: "bg-secondary shadow-sm",
        ghost: "bg-transparent",
        link: "bg-transparent underline-offset-4",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva(
  "text-sm font-semibold",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
        secondary: "text-secondary-foreground",
        ghost: "text-foreground",
        link: "text-primary underline",
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable>, VariantProps<typeof buttonVariants> {
  label?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, label, children, ...props }, ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          onPressIn={(e) => {
            scale.value = withSpring(0.96, { damping: 15 });
            props.onPressIn?.(e);
          }}
          onPressOut={(e) => {
            scale.value = withSpring(1, { damping: 15 });
            props.onPressOut?.(e);
          }}
          {...props}
        >
          {label ? (
            <Text className={cn(buttonTextVariants({ variant, size }))}>{label}</Text>
          ) : (
            children
          )}
        </Pressable>
      </Animated.View>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants, buttonTextVariants };
