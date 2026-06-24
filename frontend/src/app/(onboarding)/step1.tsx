import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '@/components/animated-background';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { Sex } from '@/types/user';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Autre', value: 'other' },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const setStep1 = useOnboardingStore((s) => s.setStep1);

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedAge = parseInt(age, 10);
  const parsedHeight = parseInt(height, 10);
  const parsedWeight = parseFloat(weight);

  const isValid =
    sex !== null &&
    age !== '' && !isNaN(parsedAge) && parsedAge > 0 && parsedAge < 130 &&
    height !== '' && !isNaN(parsedHeight) && parsedHeight > 50 && parsedHeight < 280 &&
    weight !== '' && !isNaN(parsedWeight) && parsedWeight > 10 && parsedWeight < 500;

  function handleNext() {
    if (!isValid) { setError('Veuillez renseigner des valeurs valides.'); return; }
    setStep1({ age: parsedAge, height: parsedHeight, weight: parsedWeight, sex: sex! });
    router.push(Routes.OnboardingStep2);
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-4">
      <AnimatedBackground intensity="soft" />
      <View className="flex-row gap-2 mb-8 mt-2">
        <View className="h-1.5 flex-1 rounded-full bg-primary" />
        <View className="h-1.5 flex-1 rounded-full bg-primary/20" />
        <View className="h-1.5 flex-1 rounded-full bg-primary/20" />
      </View>
      <View className="flex-1 gap-6">
        <Text variant="muted" className="font-bold uppercase tracking-wider text-primary">Étape 1 sur 3</Text>
        <Text variant="h1" className="leading-tight">Parlez-nous{'\n'}de vous</Text>
        <View className="gap-5 mt-2">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input label="Âge" placeholder="28" keyboardType="numeric" value={age} onChangeText={(v) => { setAge(v); setError(null); }} />
            </View>
            <View className="flex-1">
              <Input label="Taille (cm)" placeholder="175" keyboardType="numeric" value={height} onChangeText={(v) => { setHeight(v); setError(null); }} />
            </View>
          </View>
          <View>
            <Input label="Poids (kg)" placeholder="70" keyboardType="decimal-pad" value={weight} onChangeText={(v) => { setWeight(v); setError(null); }} />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium leading-none text-foreground">Sexe</Text>
            <View className="flex-row gap-3">
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity 
                  key={opt.value} 
                  activeOpacity={0.7}
                  className={`flex-1 rounded-xl py-3.5 items-center border ${sex === opt.value ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                  onPress={() => { setSex(opt.value); setError(null); }}
                >
                  <Text className={`font-semibold ${sex === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {error && <Text className="text-destructive text-sm text-center font-medium">{error}</Text>}
        </View>
      </View>
      <Button 
        label="Suivant →" 
        size="lg" 
        className={!isValid ? "opacity-50" : ""} 
        onPress={handleNext} 
        disabled={!isValid} 
      />
    </SafeAreaView>
  );
}
