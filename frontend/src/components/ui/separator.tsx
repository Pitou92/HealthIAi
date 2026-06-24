import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

function Separator({ className }: { className?: string }) {
  return (
    <View className={cn("h-[1px] w-full bg-border", className)} />
  );
}

export { Separator };
