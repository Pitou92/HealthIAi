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

  // No data and no loading: empty state
  const showEmpty = !data && !loading;
  const noProfile = error === 'NO_PROFILE' || showEmpty;

  if (noProfile) {
    return (
      <View style={styles.root}>
        <AnimatedBackground intensity="soft" />
        <SafeAreaView style={styles.emptySafe}>
          <Text style={styles.emptyTitle}>Aucun plan actif</Text>
          <Text style={styles.emptyText}>
            Complétez l'onboarding pour générer votre plan IA personnalisé.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => { reset(); router.replace(Routes.OnboardingStep1); }}>
            <Text style={styles.emptyBtnText}>Commencer l'onboarding</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const totalMacroG = data
    ? data.macros.proteins + data.macros.carbs + data.macros.fats
    : 1;

  return (
    <View style={styles.root}>
      <AILoader visible={loading} />

      {data && (
        <SafeAreaView style={styles.safe}>
          <AnimatedBackground intensity="soft" />
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* ── Header ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.date}>{formatDate()}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Déconnexion</Text>
              </TouchableOpacity>
            </View>

            {/* ── Score ── */}
            <View style={styles.card}>
              <View style={styles.scorRow}>
                <View style={styles.scoreLeft}>
                  <Text style={styles.label}>Score d'activité</Text>
                  <View style={styles.scoreTagRow}>
                    <View style={[
                      styles.scoreTag,
                      data.activityScore >= 80 ? styles.scoreTagGreen
                      : data.activityScore >= 60 ? styles.scoreTagBlue
                      : styles.scoreTagMuted,
                    ]}>
                      <Text style={[
                        styles.scoreTagText,
                        data.activityScore >= 80 ? styles.scoreTagTextGreen
                        : data.activityScore >= 60 ? styles.scoreTagTextBlue
                        : styles.scoreTagTextMuted,
                      ]}>
                        {data.activityScore >= 80 ? 'Excellent' : data.activityScore >= 60 ? 'Bien' : 'À améliorer'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.scoreNumber}>
                  {data.activityScore}
                  <Text style={styles.scoreDenom}>/100</Text>
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {
                  width: `${data.activityScore}%` as any,
                  backgroundColor: data.activityScore >= 80 ? SP.primary : data.activityScore >= 60 ? SP.secondary : SP.textMuted,
                }]} />
              </View>
            </View>

            {/* ── KPIs ── */}
            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, styles.kpiGreen]}>
                <Text style={styles.kpiEmoji}>🔥</Text>
                <Text style={styles.kpiVal}>{data.calories.target.toLocaleString('fr')}</Text>
                <Text style={styles.kpiUnit}>kcal / jour</Text>
              </View>
              <View style={[styles.kpiCard, styles.kpiBlue]}>
                <Text style={styles.kpiEmoji}>💧</Text>
                <Text style={styles.kpiVal}>{(data.hydration.targetMl / 1000).toFixed(1)}</Text>
                <Text style={styles.kpiUnit}>litres / jour</Text>
              </View>
            </View>

            {/* ── Macros ── */}
            <View style={styles.card}>
              <Text style={styles.label}>Macronutriments</Text>
              <MacroRow
                label="Protéines"
                value={data.macros.proteins}
                pct={data.macros.proteins / totalMacroG}
                color={SP.primary}
              />
              <MacroRow
                label="Glucides"
                value={data.macros.carbs}
                pct={data.macros.carbs / totalMacroG}
                color={SP.secondary}
              />
              <MacroRow
                label="Lipides"
                value={data.macros.fats}
                pct={data.macros.fats / totalMacroG}
                color="#A78BFA"
              />
            </View>

            {/* ── Entraînement du jour ── */}
            {todayWorkout && (
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Entraînement du jour</Text>
                  <View style={todayWorkout.duration === 0 ? styles.chipMuted : styles.chipGreen}>
                    <Text style={todayWorkout.duration === 0 ? styles.chipTextMuted : styles.chipTextGreen}>
                      {todayWorkout.duration === 0 ? 'Repos' : `${todayWorkout.duration} min`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workoutName}>{todayWorkout.type}</Text>
                {todayWorkout.duration > 0 && (
                  <View style={styles.exerciseList}>
                    {todayWorkout.exercises.map((ex, i) => (
                      <View key={i} style={styles.exerciseRow}>
                        <View style={styles.exerciseBullet} />
                        <Text style={styles.exerciseText}>{ex}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ── Plan des repas ── */}
            <View style={styles.card}>
              <Text style={styles.label}>Plan des repas</Text>
              {data.nutrition.meals.map((meal, i) => (
                <View
                  key={meal.id}
                  style={[styles.mealItem, i < data.nutrition.meals.length - 1 && styles.mealDivider]}
                >
                  <View style={styles.mealHeader}>
                    <View style={styles.mealMeta}>
                      <Text style={styles.mealTime}>{meal.time}</Text>
                      <Text style={styles.mealName}>{meal.name}</Text>
                    </View>
                    <Text style={styles.mealKcal}>{meal.calories} kcal</Text>
                  </View>
                  <Text style={styles.mealFoods}>{meal.items.join(' · ')}</Text>
                </View>
              ))}
            </View>

            {/* ── Plan de la semaine ── */}
            <View style={styles.card}>
              <Text style={styles.label}>Semaine d'entraînement</Text>
              {data.weeklyPlan.map((s) => {
                const isToday = s.day === today;
                const isRest = s.duration === 0;
                return (
                  <View key={s.day} style={[styles.weekRow, isToday && styles.weekRowToday]}>
                    <View style={[styles.weekDot, isRest ? styles.weekDotRest : isToday ? styles.weekDotToday : styles.weekDotDefault]} />
                    <Text style={[styles.weekDay, isToday && styles.weekDayToday, isRest && styles.weekDayRest]}>
                      {s.day}
                    </Text>
                    <Text style={[styles.weekType, isRest && styles.weekTypeRest]}>{s.type}</Text>
                    <Text style={styles.weekDuration}>
                      {isRest ? 'Repos' : `${s.duration} min`}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* ── Conseils IA ── */}
            {data.nutrition.tips.length > 0 && (
              <View style={[styles.card, styles.tipsCard, { marginBottom: Spacing.six }]}>
                <Text style={styles.label}>Conseils IA</Text>
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
    </View>
  );
}

// ── MacroRow component ──────────────────────────────────────────────────────

function MacroRow({ label, value, pct, color }: {
  label: string; value: number; pct: number; color: string;
}) {
  return (
    <View style={m.row}>
      <View style={m.labelRow}>
        <Text style={m.label}>{label}</Text>
        <Text style={m.value}>{value} g</Text>
      </View>
      <View style={m.track}>
        <View style={[m.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const m = StyleSheet.create({
  row: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, color: SP.textMuted },
  value: { fontSize: 13, fontWeight: '600', color: SP.textDim },
  track: { height: 6, backgroundColor: SP.bgInput, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SP.bg },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: 120, gap: Spacing.three },

  // Empty state
  emptySafe: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.five, gap: Spacing.three,
  },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: SP.text, textAlign: 'center' },
  emptyText: { fontSize: 15, color: SP.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    marginTop: Spacing.two,
    backgroundColor: SP.primary, borderRadius: 14,
    paddingHorizontal: Spacing.five, paddingVertical: Spacing.three,
  },
  emptyBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Header
  header: {
    paddingTop: Spacing.four,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  greeting: { fontSize: 28, fontWeight: '800', color: SP.text, letterSpacing: -0.5 },
  date: { fontSize: 14, color: SP.textMuted, marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: SP.borderDim,
    marginTop: Spacing.two,
  },
  logoutText: { fontSize: 13, color: SP.textMuted, fontWeight: '500' },

  // Base card
  card: {
    backgroundColor: SP.bgCard,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: SP.borderDim,
  },
  label: { fontSize: 12, fontWeight: '600', color: SP.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Score card
  scorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  scoreLeft: { gap: Spacing.one },
  scoreTagRow: { flexDirection: 'row' },
  scoreTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scoreTagGreen: { backgroundColor: 'rgba(34,197,94,0.15)' },
  scoreTagBlue: { backgroundColor: 'rgba(59,130,246,0.15)' },
  scoreTagMuted: { backgroundColor: SP.bgInput },
  scoreTagText: { fontSize: 12, fontWeight: '600' },
  scoreTagTextGreen: { color: SP.primary },
  scoreTagTextBlue: { color: SP.secondary },
  scoreTagTextMuted: { color: SP.textMuted },
  scoreNumber: { fontSize: 52, fontWeight: '800', color: SP.text, lineHeight: 56 },
  scoreDenom: { fontSize: 20, fontWeight: '500', color: SP.textMuted },
  progressTrack: { height: 4, backgroundColor: SP.bgInput, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  // KPI row
  kpiRow: { flexDirection: 'row', gap: Spacing.two },
  kpiCard: {
    flex: 1, borderRadius: 16, padding: Spacing.four, gap: 4,
    borderWidth: 1, alignItems: 'flex-start',
  },
  kpiGreen: { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' },
  kpiBlue: { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' },
  kpiEmoji: { fontSize: 22, marginBottom: 4 },
  kpiVal: { fontSize: 26, fontWeight: '800', color: SP.text },
  kpiUnit: { fontSize: 12, color: SP.textMuted, fontWeight: '500' },

  // Chips
  chipGreen: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.12)' },
  chipMuted: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: SP.bgInput },
  chipTextGreen: { fontSize: 12, fontWeight: '600', color: SP.primary },
  chipTextMuted: { fontSize: 12, fontWeight: '600', color: SP.textMuted },

  // Workout
  workoutName: { fontSize: 18, fontWeight: '700', color: SP.text },
  exerciseList: { gap: Spacing.one },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exerciseBullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: SP.primary },
  exerciseText: { fontSize: 14, color: SP.textDim, flex: 1 },

  // Meals
  mealItem: { gap: 4, paddingBottom: Spacing.two },
  mealDivider: { borderBottomWidth: 1, borderBottomColor: SP.borderDim },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealTime: { fontSize: 12, fontWeight: '600', color: SP.textMuted, width: 38 },
  mealName: { fontSize: 15, fontWeight: '700', color: SP.text },
  mealKcal: { fontSize: 13, fontWeight: '700', color: SP.primary },
  mealFoods: { fontSize: 13, color: SP.textMuted, paddingLeft: 48, lineHeight: 18 },

  // Weekly plan
  weekRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10,
  },
  weekRowToday: { backgroundColor: 'rgba(34,197,94,0.07)' },
  weekDot: { width: 8, height: 8, borderRadius: 4 },
  weekDotDefault: { backgroundColor: SP.borderDim },
  weekDotToday: { backgroundColor: SP.primary },
  weekDotRest: { backgroundColor: SP.bgInput, borderWidth: 1, borderColor: SP.borderDim },
  weekDay: { fontSize: 14, fontWeight: '600', color: SP.textDim, width: 88 },
  weekDayToday: { color: SP.primary },
  weekDayRest: { color: SP.textMuted },
  weekType: { fontSize: 14, color: SP.textDim, flex: 1 },
  weekTypeRest: { color: SP.textMuted, fontStyle: 'italic' },
  weekDuration: { fontSize: 13, color: SP.textMuted },

  // Tips
  tipsCard: { borderColor: 'rgba(34,197,94,0.2)', backgroundColor: 'rgba(34,197,94,0.04)' },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipBullet: { fontSize: 11, color: SP.primary, marginTop: 3 },
  tipText: { fontSize: 14, color: SP.textDim, flex: 1, lineHeight: 20 },
});
