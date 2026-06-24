import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '@/components/animated-background';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { ActivityLevel, ActivityType } from '@/types/user';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

const FREQUENCIES = [1, 2, 3, 4, 5, 6, 7];

const ACTIVITY_TYPES: { label: string; value: ActivityType }[] = [
  { label: 'Cardio', value: 'cardio' },
  { label: 'Musculation', value: 'strength' },
  { label: 'Mixte', value: 'mixed' },
  { label: 'Yoga', value: 'yoga' },
];

const LEVELS: { label: string; value: ActivityLevel }[] = [
  { label: 'Débutant', value: 'sedentary' },
  { label: 'Intermédiaire', value: 'light' },
  { label: 'Avancé', value: 'moderate' },
  { label: 'Expert', value: 'intense' },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const { setStep3 } = useOnboardingStore();

  const [frequency, setFrequency] = useState<number | null>(null);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [level, setLevel] = useState<ActivityLevel | null>(null);

  const canFinish = frequency !== null && activityType !== null && level !== null;

  function handleFinish() {
    if (!canFinish) return;
    setStep3({ activityFrequency: frequency, activityType, activityLevel: level });
    router.push(Routes.AILoading);
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-4">
      <AnimatedBackground intensity="soft" />
      <View className="flex-row gap-2 mb-8 mt-2">
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
      </View>
      <View className="flex-1 gap-6">
        <Text variant="muted" className="font-bold uppercase tracking-wider text-primary">Étape 3 sur 3</Text>
        <Text variant="h1">Votre profil sportif</Text>
        
        <View className="gap-6 mt-2">
          {/* Niveau */}
          <View className="gap-3">
            <Text className="font-semibold text-foreground">Niveau d'activité global</Text>
            <View className="flex-row flex-wrap gap-2">
              {LEVELS.map((lvl) => (
                <TouchableOpacity 
                  key={lvl.value} 
                  activeOpacity={0.7}
                  className={`rounded-xl px-4 py-2 border ${level === lvl.value ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                  onPress={() => setLevel(lvl.value)}
                >
                  <Text className={`font-semibold ${level === lvl.value ? 'text-primary' : 'text-muted-foreground'}`}>{lvl.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Type */}
          <View className="gap-3">
            <Text className="font-semibold text-foreground">Type d'entraînement préféré</Text>
            <View className="flex-row flex-wrap gap-2">
              {ACTIVITY_TYPES.map((type) => (
                <TouchableOpacity 
                  key={type.value} 
                  activeOpacity={0.7}
                  className={`rounded-xl px-4 py-2 border ${activityType === type.value ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                  onPress={() => setActivityType(type.value)}
                >
                  <Text className={`font-semibold ${activityType === type.value ? 'text-primary' : 'text-muted-foreground'}`}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fréquence */}
          <View className="gap-3">
            <Text className="font-semibold text-foreground">Séances par semaine</Text>
            <View className="flex-row gap-2">
              {FREQUENCIES.map((freq) => (
                <TouchableOpacity 
                  key={freq} 
                  activeOpacity={0.7}
                  className={`flex-1 rounded-xl py-3 items-center border ${frequency === freq ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                  onPress={() => setFrequency(freq)}
                >
                  <Text className={`font-bold ${frequency === freq ? 'text-primary' : 'text-muted-foreground'}`}>{freq}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
      <Button 
        label="Terminer" 
        size="lg" 
        className={!canFinish ? "opacity-50" : ""} 
        onPress={handleFinish} 
        disabled={!canFinish} 
      />
    </SafeAreaView>
  );
}
