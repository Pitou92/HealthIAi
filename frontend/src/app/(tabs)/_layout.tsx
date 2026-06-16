import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { SP } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SP.bgCard,
          borderTopColor: SP.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: SP.primary,
        tabBarInactiveTintColor: SP.textMuted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Résumé',
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
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'leaf.fill', android: 'restaurant', web: 'restaurant' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sport"
        options={{
          title: 'Sport',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'figure.run', android: 'fitness_center', web: 'fitness_center' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
