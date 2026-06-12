import * as React from 'react';
import { Text as RNText } from 'react-native';

type TextProps = React.ComponentPropsWithoutRef<typeof RNText> & {
  className?: string;
};

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText ref={ref} className={className} {...props} />
  )
);
Text.displayName = 'Text';

export { Text };
