import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("p-6 pb-2 gap-1.5", className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("p-6 pt-0 gap-3", className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardContent };
