import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AILoader } from '@/components/ai-loader';
import { WaterModal } from '@/components/water-modal';
import { Routes } from '@/navigation/routes';
import { useAppStore } from '@/store/app';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StreakBadge } from '@/components/ui/streak-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function todayFR() { return DAYS_FR[new Date().getDay()] ?? ''; }

function formatDate() {
  const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export default function DashboardScreen() {
  const router = useRouter();
  const [waterVisible, setWaterVisible] = useState(false);
  const { 
    loading, 
    error, 
    recommendations: data, 
    dailyProgress: progress,
    streak,
    loadRecommendations, 
    reset,
    weightUnit,
  } = useAppStore();

  useEffect(() => { if (!data) loadRecommendations(); }, []);

  const today = todayFR();
  const todayWorkout = data?.sport?.weeklyPlan.find(d => d.day === today);

  const showEmpty = !data && !loading;
  if (showEmpty || error === 'NO_PROFILE') {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 items-center justify-center p-10 gap-4">
          <Text variant="h2" className="text-center">Prêt à commencer ?</Text>
          <Text variant="muted" className="text-center text-base">
            Générez votre plan personnalisé pour voir vos KPIs ici.
          </Text>
          <Button 
            className="mt-2"
            label="Créer mon plan"
            onPress={() => { reset(); router.replace(Routes.OnboardingStep1); }}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AILoader visible={loading} />
      <WaterModal visible={waterVisible} onClose={() => setWaterVisible(false)} />

      {data && progress && (
        <SafeAreaView className="flex-1" edges={['top']}>
          <ScrollView contentContainerClassName="px-5 pb-10 gap-6" showsVerticalScrollIndicator={false}>

            {/* ── Header ── */}
            <View className="flex-row justify-between items-start mt-2">
              <View className="gap-1">
                <Text variant="muted" className="uppercase font-semibold tracking-wider text-xs">{formatDate()}</Text>
                <Text variant="h1">Résumé</Text>
              </View>
              <View className="flex-row items-center gap-3">
                {streak && streak.current_streak > 0 && (
                  <StreakBadge days={streak.current_streak} />
                )}
                <ThemeToggle />
              </View>
            </View>

            {/* ── Principaux KPIs ── */}
            <View className="flex-row gap-3">
              <Card className="flex-1 p-4 gap-4 items-center border-none">
                <View className="items-center gap-1 w-full">
                  <Text className="font-semibold">Calories</Text>
                </View>
                <CircularProgress 
                  value={progress.calories_consumed} 
                  max={progress.calories_target} 
                  color="#EF4444"
                  icon="🔥"
                  size={100}
                />
                <Text variant="muted" className="text-xs">/ {progress.calories_target} kcal</Text>
              </Card>

              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => setWaterVisible(true)}
                className="flex-1"
              >
                <Card className="flex-1 p-4 gap-4 items-center border-none">
                  <View className="items-center gap-1 w-full">
                    <Text className="font-semibold">Hydratation</Text>
                  </View>
                  <CircularProgress 
                    value={progress.water_consumed_ml} 
                    max={progress.water_target_ml} 
                    color="#3B82F6"
                    icon="💧"
                    size={100}
                  />
                  <Text variant="muted" className="text-xs">/ {progress.water_target_ml} ml</Text>
                </Card>
              </TouchableOpacity>
            </View>

            {/* ── Macros ── */}
            <View className="gap-3">
              <Text variant="large">Macronutriments</Text>
              <Card className="p-4 gap-4 border-none">
                <MacroBar label="Protéines" current={progress.protein_consumed} target={progress.protein_target} color="#F59E0B" />
                <MacroBar label="Glucides" current={progress.carbs_consumed} target={progress.carbs_target} color="#10B981" />
                <MacroBar label="Lipides" current={progress.fat_consumed} target={progress.fat_target} color="#8B5CF6" />
              </Card>
            </View>

            {/* ── Physique & Sport ── */}
            <View className="gap-3">
              <Text variant="large">Physique & Sport</Text>
              <Card className="p-4 gap-4 border-none flex-row justify-between items-center">
                <View>
                  <Text className="font-medium text-foreground">Poids actuel</Text>
                  <View className="flex-row items-baseline gap-1 mt-1">
                    <Text className="font-bold text-2xl">
                      {progress.current_weight_kg 
                        ? (weightUnit === 'lbs' 
                          ? Math.round(progress.current_weight_kg * 2.20462 * 10) / 10
                          : progress.current_weight_kg)
                        : '--'}
                    </Text>
                    <Text variant="muted">{weightUnit ?? 'kg'}</Text>
                  </View>
                </View>
              </Card>
              {todayWorkout && todayWorkout.type !== 'Repos' && (
                <Card className="p-4 bg-primary/10 border-primary/20">
                  <Text className="text-primary font-bold text-lg mb-1">{todayWorkout.type}</Text>
                  <Text className="text-primary/80 font-medium">Séance du jour • {todayWorkout.intensity}</Text>
                </Card>
              )}
            </View>

          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

function MacroBar({ label, current, target, color }: any) {
  return (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="font-semibold text-sm">{label}</Text>
        <Text className="font-bold text-sm">{Math.round(current)}g <Text variant="muted" className="font-normal">/ {target}g</Text></Text>
      </View>
      <Progress value={(current / target) * 100} color={color} className="h-1.5" />
    </View>
  );
}
