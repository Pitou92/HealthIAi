import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { DF } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(5, 12, 10, 0.96)',
          borderTopColor: DF.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: DF.mint,
        tabBarInactiveTintColor: DF.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'book.fill', android: 'book', web: 'book' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
