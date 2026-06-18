import * as React from 'react';
import { TextInput, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <View className="gap-1.5 w-full">
        {label && <Text className="text-sm font-medium leading-none text-foreground">{label}</Text>}
        <TextInput
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base text-foreground",
            isFocused && "border-ring",
            error && "border-destructive text-destructive",
            className
          )}
          placeholderTextColor="#A1A1AA"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && <Text className="text-sm font-medium text-destructive">{error}</Text>}
      </View>
    );
  }
);
Input.displayName = "Input";

export { Input };
