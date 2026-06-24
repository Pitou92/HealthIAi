import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "text-base",
      h1: "text-3xl font-extrabold tracking-tight lg:text-4xl",
      h2: "text-2xl font-semibold tracking-tight",
      h3: "text-xl font-semibold tracking-tight",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface TextProps extends React.ComponentPropsWithoutRef<typeof RNText>, VariantProps<typeof textVariants> {}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, variant, ...props }, ref) => (
    <RNText ref={ref} className={cn(textVariants({ variant }), className)} {...props} />
  )
);
Text.displayName = 'Text';

export { Text, textVariants };
