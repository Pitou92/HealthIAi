import * as React from 'react';
import { View } from 'react-native';

function Separator({ className }: { className?: string }) {
  return (
    <View className={`h-px w-full bg-white/8 ${className ?? ''}`} />
  );
}

export { Separator };
