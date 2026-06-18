import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppLogger } from '@/utils/logger';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark } = useAppColorScheme();

  useEffect(() => {
    AppLogger.init();
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} className={isDark ? "dark" : ""}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="nutrition/scan" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="logs" options={{ presentation: 'modal', headerShown: true, title: 'Logs Application', headerStyle: { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }, headerTintColor: isDark ? '#FFF' : '#000' }} />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
