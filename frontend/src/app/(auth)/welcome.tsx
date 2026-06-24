import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '@/components/animated-background';
import { Routes } from '@/navigation/routes';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AnimatedBackground />

      <View className="flex-1 items-center justify-center gap-6 px-6">
        <View className="w-24 h-24 rounded-[28px] bg-primary items-center justify-center shadow-lg shadow-primary/40 mb-2">
          <Text className="text-[52px] font-black text-primary-foreground">H</Text>
        </View>

        <View className="flex-row items-baseline gap-1">
          <Text className="text-5xl font-black text-primary tracking-tight">Health</Text>
          <Text className="text-5xl font-black text-foreground tracking-tight">IAi</Text>
        </View>

        <Text variant="muted" className="text-center text-[17px] leading-relaxed px-4">
          Votre santé, guidée par{'\n'}l'intelligence artificielle
        </Text>

        <View className="flex-row items-center gap-2 mt-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Text className="text-[10px] text-primary">●</Text>
          <Text className="text-xs font-semibold text-primary">Nutrition · Sport · IA personnalisée</Text>
        </View>
      </View>

      <View className="bg-card rounded-t-[32px] px-6 pt-6 pb-10 gap-4 shadow-2xl shadow-black/10 border-t border-border">
        <Button 
          label="Commencer gratuitement" 
          size="lg" 
          onPress={() => router.push(Routes.Register)} 
        />
        <Button 
          label="J'ai déjà un compte" 
          variant="outline" 
          size="lg" 
          onPress={() => router.push(Routes.Login)} 
        />
      </View>
    </SafeAreaView>
  );
}
