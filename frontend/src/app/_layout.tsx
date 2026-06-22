import '../../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppLogger } from '@/utils/logger';

export default function RootLayout() {
  useEffect(() => {
    AppLogger.init();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111827' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="logs" options={{ presentation: 'modal', headerShown: true, title: 'Logs Application', headerStyle: { backgroundColor: '#1C1C1E' }, headerTintColor: '#FFF' }} />
      </Stack>
    </>
  );
}
