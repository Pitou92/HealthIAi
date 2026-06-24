import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '@/components/animated-background';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { Goal } from '@/types/user';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

const GOALS: { label: string; description: string; value: Goal; emoji: string }[] = [
  { label: 'Perte de poids', description: 'Brûler des graisses et affiner la silhouette', value: 'weight_loss', emoji: '🔥' },
  { label: 'Prise de masse', description: 'Développer la masse musculaire', value: 'muscle_gain', emoji: '💪' },
  { label: 'Forme générale', description: 'Améliorer santé et endurance', value: 'fitness', emoji: '⚡️' },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const setStep2 = useOnboardingStore((s) => s.setStep2);
  const [goal, setGoal] = useState<Goal | null>(null);

  function handleNext() {
    if (!goal) return;
    setStep2({ goal });
    router.push(Routes.OnboardingStep3);
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-4">
      <AnimatedBackground intensity="soft" />
      <View className="flex-row gap-2 mb-8 mt-2">
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary/20" />
      </View>
      <View className="flex-1 gap-6">
        <Text variant="muted" className="font-bold uppercase tracking-wider text-primary">Étape 2 sur 3</Text>
        <Text variant="h1">Votre objectif</Text>
        <View className="gap-3 mt-2">
          {GOALS.map((g) => {
            const isActive = goal === g.value;
            return (
              <TouchableOpacity 
                key={g.value} 
                activeOpacity={0.7}
                className={`flex-row items-center p-5 rounded-2xl border ${isActive ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                onPress={() => setGoal(g.value)}
              >
                <View className="w-12 h-12 rounded-full bg-background items-center justify-center mr-4">
                  <Text className="text-2xl">{g.emoji}</Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text className={`font-bold text-lg ${isActive ? 'text-primary' : 'text-foreground'}`}>{g.label}</Text>
                  <Text variant="muted" className="text-sm leading-tight">{g.description}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isActive ? 'border-primary' : 'border-muted-foreground'}`}>
                  {isActive && <View className="w-3 h-3 rounded-full bg-primary" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Button 
        label="Suivant →" 
        size="lg" 
        className={!goal ? "opacity-50" : ""} 
        onPress={handleNext} 
        disabled={!goal} 
      />
    </SafeAreaView>
  );
}
