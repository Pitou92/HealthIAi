import * as React from 'react';
import { View } from 'react-native';

type ViewProps = React.ComponentPropsWithoutRef<typeof View> & {
  className?: string;
};

const Card = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={`rounded-2xl border border-white/8 bg-bg-card p-6 ${className ?? ''}`}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={`mb-2 gap-1 ${className ?? ''}`} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={`gap-3 ${className ?? ''}`} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardContent };
