import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AILoader } from '@/components/ai-loader';
import { AnimatedBackground } from '@/components/animated-background';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Routes } from '@/navigation/routes';
import { removeToken } from '@/services/token';
import { useAppStore } from '@/store/app';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function todayFR() { return DAYS_FR[new Date().getDay()] ?? ''; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatDate() {
  const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export default function DashboardScreen() {
  const router = useRouter();
  const { loading, error, recommendations: data, loadRecommendations, reset } = useAppStore();

  useEffect(() => { if (!data) loadRecommendations(); }, []);

  async function handleLogout() {
    await removeToken();
    reset();
    router.replace(Routes.Welcome);
  }

  const today = todayFR();
  const todayWorkout = data?.sport?.weeklyPlan.find(d => d.day === today);
  const noProfile = !data && !loading;

  if (noProfile) {
    return (
      <View className="flex-1 bg-bg">
        <AnimatedBackground intensity="soft" />
        <SafeAreaView className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="text-2xl font-extrabold text-fg text-center">Aucun plan actif</Text>
          <Text className="text-base text-muted text-center leading-6">
            Complétez l'onboarding pour générer votre plan IA personnalisé.
          </Text>
          <TouchableOpacity
            className="mt-2 rounded-2xl bg-primary px-8 py-4"
            onPress={() => { reset(); router.replace(Routes.OnboardingStep1); }}>
            <Text className="text-base font-bold text-white">Commencer l'onboarding</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const totalMacroG = data ? data.macros.proteins + data.macros.carbs + data.macros.fats : 1;
  const scoreColor = data
    ? data.activityScore >= 80 ? '#22C55E' : data.activityScore >= 60 ? '#3B82F6' : '#9CA3AF'
    : '#9CA3AF';

  return (
    <View className="flex-1 bg-bg">
      <AILoader visible={loading} />

      {data && (
        <SafeAreaView className="flex-1">
          <AnimatedBackground intensity="soft" />
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-4 pb-28 gap-3"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Header ── */}
            <View className="flex-row items-start justify-between pt-6">
              <View className="gap-0.5">
                <Text className="text-3xl font-extrabold text-fg tracking-tight">{getGreeting()}</Text>
                <Text className="text-sm text-muted">{formatDate()}</Text>
              </View>
              <TouchableOpacity
                className="mt-2 rounded-lg border border-white/8 px-3 py-1.5"
                onPress={handleLogout}>
                <Text className="text-sm text-muted font-medium">Déconnexion</Text>
              </TouchableOpacity>
            </View>

            {/* ── Score d'activité ── */}
            <Card>
              <CardHeader>
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Score d'activité
                </Text>
              </CardHeader>
              <CardContent>
                <View className="flex-row items-center justify-between">
                  <View className="gap-2">
                    <Badge
                      variant={data.activityScore >= 80 ? 'success' : data.activityScore >= 60 ? 'secondary' : 'muted'}
                      label={data.activityScore >= 80 ? 'Excellent 🔥' : data.activityScore >= 60 ? 'Bien 👍' : 'À améliorer 💪'}
                    />
                    <Progress value={data.activityScore} color={scoreColor} className="w-48" />
                  </View>
                  <View className="flex-row items-end">
                    <Text className="text-6xl font-extrabold text-fg leading-none">{data.activityScore}</Text>
                    <Text className="text-xl text-muted font-medium mb-1">/100</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* ── KPIs ── */}
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-primary/20 bg-primary/8 p-5 gap-1">
                <Text className="text-2xl">🔥</Text>
                <Text className="text-2xl font-extrabold text-fg">
                  {data.calories.target.toLocaleString('fr')}
                </Text>
                <Text className="text-xs text-muted font-medium">kcal / jour</Text>
              </View>
              <View className="flex-1 rounded-2xl border border-secondary/20 bg-secondary/8 p-5 gap-1">
                <Text className="text-2xl">💧</Text>
                <Text className="text-2xl font-extrabold text-fg">
                  {(data.hydration.targetMl / 1000).toFixed(1)}
                </Text>
                <Text className="text-xs text-muted font-medium">litres / jour</Text>
              </View>
            </View>

            {/* ── Macronutriments ── */}
            <Card>
              <CardHeader>
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Macronutriments
                </Text>
              </CardHeader>
              <CardContent>
                <MacroRow label="Protéines" value={data.macros.proteins}
                  pct={data.macros.proteins / totalMacroG} color="#22C55E" />
                <MacroRow label="Glucides"  value={data.macros.carbs}
                  pct={data.macros.carbs / totalMacroG}    color="#3B82F6" />
                <MacroRow label="Lipides"   value={data.macros.fats}
                  pct={data.macros.fats / totalMacroG}     color="#A78BFA" />
              </CardContent>
            </Card>

            {/* ── Entraînement du jour ── */}
            {todayWorkout && (
              <Card>
                <CardHeader>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
                      Entraînement du jour
                    </Text>
                    <Badge
                      variant={todayWorkout.duration === 0 ? 'muted' : 'success'}
                      label={todayWorkout.duration === 0 ? 'Repos' : `${todayWorkout.duration} min`}
                    />
                  </View>
                </CardHeader>
                <CardContent>
                  <Text className="text-lg font-bold text-fg">{todayWorkout.type}</Text>
                  {todayWorkout.duration > 0 && (
                    <View className="gap-1.5">
                      {todayWorkout.exercises.map((ex, i) => (
                        <View key={i} className="flex-row items-center gap-2.5">
                          <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <Text className="text-sm text-fg-dim flex-1">{ex}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Plan des repas ── */}
            <Card>
              <CardHeader>
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Plan des repas
                </Text>
              </CardHeader>
              <CardContent>
                {data.nutrition.meals.map((meal, i) => (
                  <View key={meal.id}>
                    {i > 0 && <Separator className="my-1" />}
                    <View className="gap-1 py-1.5">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5">
                          <Text className="text-xs font-semibold text-muted w-10">{meal.time}</Text>
                          <Text className="text-base font-bold text-fg">{meal.name}</Text>
                        </View>
                        <Text className="text-sm font-bold text-primary">{meal.calories} kcal</Text>
                      </View>
                      <Text className="text-sm text-muted pl-12 leading-5">
                        {meal.items.join(' · ')}
                      </Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* ── Plan de la semaine ── */}
            <Card>
              <CardHeader>
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Semaine d'entraînement
                </Text>
              </CardHeader>
              <CardContent>
                {data.weeklyPlan.map((s) => {
                  const isToday = s.day === today;
                  const isRest = s.duration === 0;
                  return (
                    <View
                      key={s.day}
                      className={`flex-row items-center gap-2.5 rounded-xl px-2 py-2 ${isToday ? 'bg-primary/7' : ''}`}
                    >
                      <View className={`w-2 h-2 rounded-full ${
                        isRest ? 'border border-white/20 bg-transparent'
                        : isToday ? 'bg-primary'
                        : 'bg-white/20'
                      }`} />
                      <Text className={`text-sm font-semibold w-24 ${
                        isToday ? 'text-primary' : isRest ? 'text-muted' : 'text-fg-dim'
                      }`}>{s.day}</Text>
                      <Text className={`text-sm flex-1 ${isRest ? 'text-muted italic' : 'text-fg-dim'}`}>
                        {s.type}
                      </Text>
                      <Text className="text-sm text-muted">
                        {isRest ? 'Repos' : `${s.duration} min`}
                      </Text>
                    </View>
                  );
                })}
              </CardContent>
            </Card>

            {/* ── Conseils IA ── */}
            {data.nutrition.tips.length > 0 && (
              <Card className="border-primary/20 bg-primary/4">
                <CardHeader>
                  <Text className="text-xs font-semibold uppercase tracking-widest text-muted">
                    Conseils IA
                  </Text>
                </CardHeader>
                <CardContent>
                  {data.nutrition.tips.map((tip, i) => (
                    <View key={i} className="flex-row gap-2.5 items-start">
                      <Text className="text-xs text-primary mt-0.5">✦</Text>
                      <Text className="text-sm text-fg-dim flex-1 leading-5">{tip}</Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

function MacroRow({ label, value, pct, color }: {
  label: string; value: number; pct: number; color: string;
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row justify-between">
        <Text className="text-sm text-muted">{label}</Text>
        <Text className="text-sm font-semibold text-fg-dim">{value} g</Text>
      </View>
      <Progress value={Math.round(pct * 100)} color={color} />
    </View>
  );
}
