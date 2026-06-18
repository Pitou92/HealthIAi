import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '@/store/app';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type ScanStep = 'pick' | 'uploading' | 'analyzing' | 'result';

export default function ScanMealScreen() {
  const router = useRouter();
  const scanMeal = useAppStore(s => s.scanMeal);

  function safeGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/nutrition');
    }
  }
  
  const [step, setStep] = useState<ScanStep>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'pick', label: 'Image' },
    { id: 'uploading', label: 'Envoi' },
    { id: 'analyzing', label: 'IA' },
    { id: 'result', label: 'Fini' },
  ];

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      startAnalysis(uri);
    }
  }

  async function startAnalysis(uri: string) {
    setError(null);
    setAnalysis(null);
    setStep('uploading');
    
    try {
      const resultPromise = scanMeal(uri);
      setTimeout(() => {
        if (analysis === null) setStep('analyzing');
      }, 800);

      const result = await resultPromise;
      setAnalysis(result);
      setStep('result');
    } catch (e) {
      console.error('Erreur scan:', e);
      setError(e instanceof Error ? e.message : "Erreur lors de l'analyse");
      setStep('pick');
    }
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
          <TouchableOpacity onPress={safeGoBack} className="w-16">
            <Text className="text-primary font-medium text-base">Annuler</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-lg">Analyse IA</Text>
          <View className="w-16" />
        </View>

        {/* Stepper */}
        <View className="flex-row justify-center gap-6 py-5 border-b border-border bg-card/50">
          {steps.map((s, i) => {
            const isActive = step === s.id;
            const isDone = steps.findIndex(st => st.id === step) > i;
            return (
              <View key={s.id} className="items-center gap-1.5">
                <View className={`w-6 h-6 rounded-full border items-center justify-center ${isActive ? 'bg-primary border-primary' : isDone ? 'bg-secondary border-secondary' : 'border-muted-foreground'}`}>
                  {isDone ? (
                    <Text className="text-secondary-foreground text-sm font-bold">✓</Text>
                  ) : (
                    <Text className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{i + 1}</Text>
                  )}
                </View>
                <Text className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-primary' : isDone ? 'text-secondary' : 'text-muted-foreground'}`}>{s.label}</Text>
              </View>
            );
          })}
        </View>

        <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
          {step === 'pick' && (
            <View className="items-center mt-8 gap-6">
              <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
                <Text className="text-5xl">🥗</Text>
              </View>
              <View className="gap-2 px-4 items-center">
                <Text variant="h2" className="text-center">Qu'avez-vous mangé ?</Text>
                <Text variant="muted" className="text-center text-base">
                  Notre IA va identifier les aliments et calculer les calories pour vous.
                </Text>
              </View>
              
              <Button label="Choisir une photo" onPress={pickImage} className="w-full mt-4" size="lg" />
              {error && <Text className="text-destructive font-medium">{error}</Text>}
            </View>
          )}

          {(step === 'uploading' || step === 'analyzing') && (
            <View className="items-center mt-6 gap-6">
              <View className="w-full aspect-4/3 rounded-2xl overflow-hidden relative">
                {imageUri && <Image source={{ uri: imageUri }} className="w-full h-full" />}
                <View className="absolute inset-0 bg-background/60 items-center justify-center backdrop-blur-sm">
                  <ActivityIndicator size="large" color="#22C55E" />
                </View>
              </View>
              <View className="items-center gap-1">
                <Text variant="h3">{step === 'uploading' ? "Envoi de l'image..." : "L'IA analyse votre plat..."}</Text>
                <Text variant="muted">{step === 'uploading' ? "Nous préparons vos données." : "Identification des ingrédients en cours."}</Text>
              </View>
            </View>
          )}

          {step === 'result' && analysis && (
            <View className="gap-6">
              <View className="w-full h-32 rounded-xl overflow-hidden">
                 {imageUri && <Image source={{ uri: imageUri }} className="w-full h-full opacity-80" />}
              </View>

              <Card className="gap-3 p-5">
                <View className="gap-1">
                  <Text variant="h3">Analyse terminée !</Text>
                  <Text className="text-foreground leading-relaxed">{analysis.analysis_summary}</Text>
                </View>
                
                <Separator className="my-2" />
                
                <View className="flex-row justify-around items-center">
                  <View className="items-center">
                    <Text className="text-2xl font-black text-secondary">{Math.round(analysis.total_calories)}</Text>
                    <Text variant="muted" className="text-xs uppercase font-bold">kcal</Text>
                  </View>
                  <View className="w-px h-8 bg-border" />
                  <View className="items-center">
                    <Text className="text-xl font-bold">{Math.round(analysis.total_protein)}g</Text>
                    <Text variant="muted" className="text-xs uppercase font-bold">Prot</Text>
                  </View>
                  <View className="w-px h-8 bg-border" />
                  <View className="items-center">
                    <Text className="text-xl font-bold">{Math.round(analysis.total_carbs)}g</Text>
                    <Text variant="muted" className="text-xs uppercase font-bold">Gluc</Text>
                  </View>
                </View>
              </Card>

              <View className="gap-3">
                <Text variant="large">Aliments détectés</Text>
                <Card className="p-0 border-none overflow-hidden">
                  {analysis.detected_foods.map((food: any, i: number) => (
                    <View key={i} className={`flex-row justify-between items-center p-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                      <View>
                        <Text className="font-semibold text-base">{food.name}</Text>
                        <Text variant="muted" className="text-sm">{food.estimated_quantity}</Text>
                      </View>
                      <Text className="font-bold text-base">{food.calories} kcal</Text>
                    </View>
                  ))}
                </Card>
              </View>

              <Button 
                label="Ajouter à mon journal" 
                size="lg"
                onPress={async () => {
                  await useAppStore.getState().confirmMeal(analysis);
                  safeGoBack();
                }}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
