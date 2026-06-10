import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AILoader } from '@/components/ai-loader';
import { AnimatedBackground } from '@/components/animated-background';
import { SP, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { removeToken } from '@/services/token';
import { useAppStore } from '@/store/app';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatDate() {
  const d = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function todayFR() {
  return DAYS_FR[new Date().getDay()] ?? '';
}

export default function DashboardScreen() {
  const router = useRouter();
  const { loading, recommendations: data, loadRecommendations, reset } = useAppStore();

  useEffect(() => {
    if (!data) loadRecommendations();
  }, []);

  async function handleLogout() {
    await removeToken();
    reset();
    router.replace(Routes.Welcome);
  }

  const today = todayFR();
  const todayWorkout = data?.sport?.weeklyPlan.find(d => d.day === today);

  return (
    <View style={styles.root}>
      {data && (
        <SafeAreaView style={styles.safe}>
          <AnimatedBackground intensity="soft" />
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                <Text style={styles.date}>{formatDate()}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Déco</Text>
              </TouchableOpacity>
            </View>

            {/* Score */}
            <View style={[styles.card, styles.scoreCard]}>
              <View>
                <Text style={styles.cardTitle}>Score d'activité</Text>
                <Text style={styles.scoreLabel}>
                  {data.activityScore >= 80
                    ? 'Excellent 🔥'
                    : data.activityScore >= 60
                    ? 'Bien 👍'
                    : 'À améliorer 💪'}
                </Text>
              </View>
              <Text style={styles.scoreValue}>
                {data.activityScore}
                <Text style={styles.scoreMax}>/100</Text>
              </Text>
            </View>

            {/* Objectifs du jour */}
            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { borderLeftColor: SP.primary }]}>
                <Text style={styles.kpiLabel}>Calories / jour</Text>
                <Text style={[styles.kpiValue, { color: SP.primary }]}>
                  {data.calories.target}
                  <Text style={styles.kpiUnit}> kcal</Text>
                </Text>
              </View>
              <View style={[styles.kpiCard, { borderLeftColor: SP.secondary }]}>
                <Text style={styles.kpiLabel}>Hydratation</Text>
                <Text style={[styles.kpiValue, { color: SP.secondary }]}>
                  {(data.hydration.targetMl / 1000).toFixed(1)}
                  <Text style={styles.kpiUnit}> L</Text>
                </Text>
              </View>
            </View>

            {/* Macronutriments */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Macronutriments</Text>
              <View style={styles.macrosRow}>
                <MacroStat label="Protéines" value={data.macros.proteins} color={SP.primary} />
                <MacroStat label="Glucides" value={data.macros.carbs} color="#10B981" />
                <MacroStat label="Lipides" value={data.macros.fats} color={SP.secondary} />
              </View>
            </View>

            {/* Entraînement du jour */}
            {todayWorkout && (
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>Entraînement du jour</Text>
                  <View style={[styles.badge, todayWorkout.duration === 0 && styles.badgeRest]}>
                    <Text style={[styles.badgeText, todayWorkout.duration === 0 && styles.badgeTextRest]}>
                      {todayWorkout.duration === 0 ? 'Repos' : `${todayWorkout.duration} min`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workoutType}>{todayWorkout.type}</Text>
                {todayWorkout.duration > 0 &&
                  todayWorkout.exercises.map((ex, i) => (
                    <View key={i} style={styles.exerciseRow}>
                      <View style={styles.exerciseDot} />
                      <Text style={styles.exerciseText}>{ex}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* Plan des repas */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Plan des repas</Text>
              {data.nutrition.meals.map((meal, i) => (
                <View
                  key={meal.id}
                  style={[
                    styles.mealRow,
                    i < data.nutrition.meals.length - 1 && styles.mealRowBorder,
                  ]}
                >
                  <View style={styles.mealHeader}>
                    <View style={styles.mealLeft}>
                      <Text style={styles.mealTime}>{meal.time}</Text>
                      <Text style={styles.mealName}>{meal.name}</Text>
                    </View>
                    <Text style={styles.mealCal}>{meal.calories} kcal</Text>
                  </View>
                  <Text style={styles.mealFoods}>{meal.items.join(' · ')}</Text>
                </View>
              ))}
            </View>

            {/* Plan de la semaine */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Plan de la semaine</Text>
              <View style={styles.planList}>
                {data.weeklyPlan.map((s) => {
                  const isRest = s.duration === 0;
                  return (
                    <View key={s.day} style={styles.planRow}>
                      <View style={[styles.planDot, isRest && styles.planDotRest]} />
                      <Text style={[styles.planDay, isRest && styles.planDayRest]}>{s.day}</Text>
                      <Text style={[styles.planType, isRest && styles.planTypeRest]}>{s.type}</Text>
                      <Text style={styles.planDuration}>
                        {isRest ? 'Repos' : `${s.duration} min`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Conseils IA */}
            {data.nutrition.tips.length > 0 && (
              <View style={[styles.card, { marginBottom: Spacing.four }]}>
                <Text style={styles.cardTitle}>Conseils IA</Text>
                {data.nutrition.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>✦</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>
        </SafeAreaView>
      )}
      <AILoader visible={loading || !data} />
    </View>
  );
}

function MacroStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={macro.container}>
      <Text style={[macro.value, { color }]}>{value}</Text>
      <Text style={macro.unit}>g</Text>
      <Text style={macro.label}>{label}</Text>
    </View>
  );
}

const macro = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    backgroundColor: SP.bgInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SP.borderDim,
  },
  value: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 12, color: SP.textMuted, fontWeight: '500', marginTop: -4 },
  label: { fontSize: 12, color: SP.textMuted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SP.bg },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: 100, gap: Spacing.three },

  header: {
    paddingTop: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { gap: 4 },
  greeting: { fontSize: 26, fontWeight: '800', color: SP.text },
  date: { fontSize: 14, color: SP.textMuted },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SP.borderDim,
    marginTop: Spacing.two,
  },
  logoutText: { fontSize: 13, color: SP.textMuted, fontWeight: '600' },

  kpiRow: { flexDirection: 'row', gap: Spacing.two },
  kpiCard: {
    flex: 1,
    backgroundColor: SP.bgCard,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: SP.borderDim,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiLabel: { fontSize: 12, color: SP.textMuted, fontWeight: '600' },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiUnit: { fontSize: 13, fontWeight: '400', color: SP.textMuted },

  card: {
    backgroundColor: SP.bgCard,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: SP.borderDim,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: SP.textDim },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  scoreCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 13, color: SP.textMuted, marginTop: 2 },
  scoreValue: { fontSize: 48, fontWeight: '800', color: SP.primary },
  scoreMax: { fontSize: 20, fontWeight: '500', color: SP.textMuted },

  macrosRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeRest: { backgroundColor: SP.bgInput },
  badgeText: { fontSize: 12, fontWeight: '700', color: SP.primary },
  badgeTextRest: { color: SP.textMuted },
  workoutType: { fontSize: 16, fontWeight: '700', color: SP.text },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  exerciseDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: SP.primary },
  exerciseText: { fontSize: 14, color: SP.textDim, flex: 1 },

  mealRow: { gap: 6, paddingBottom: Spacing.two },
  mealRowBorder: { borderBottomWidth: 1, borderBottomColor: SP.borderDim },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealTime: { fontSize: 12, color: SP.textMuted, fontWeight: '600', width: 40 },
  mealName: { fontSize: 15, fontWeight: '700', color: SP.text },
  mealCal: { fontSize: 13, color: SP.primary, fontWeight: '700' },
  mealFoods: { fontSize: 13, color: SP.textMuted, paddingLeft: 48, lineHeight: 18 },

  planList: { gap: Spacing.two, marginTop: Spacing.one },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  planDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: SP.primary },
  planDotRest: { backgroundColor: SP.textMuted },
  planDay: { fontSize: 14, fontWeight: '600', color: SP.text, width: 90 },
  planDayRest: { color: SP.textMuted },
  planType: { fontSize: 14, color: SP.textDim, flex: 1 },
  planTypeRest: { color: SP.textMuted, fontStyle: 'italic' },
  planDuration: { fontSize: 13, color: SP.textMuted },

  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipBullet: { fontSize: 12, color: SP.primary, marginTop: 2 },
  tipText: { fontSize: 14, color: SP.textDim, flex: 1, lineHeight: 20 },
});
