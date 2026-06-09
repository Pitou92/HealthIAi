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

  const caloriePct = data ? Math.min(data.calories.consumed / data.calories.target, 1) : 0;
  const remaining = data ? data.calories.target - data.calories.consumed : 0;
  const hydrationPct = data ? Math.min(data.hydration.consumedMl / data.hydration.targetMl, 1) : 0;
  const sleepPct = data ? Math.min(data.sleep.actualHours / data.sleep.targetHours, 1) : 0;

  return (
    <View style={styles.root}>
      {data && (
        <SafeAreaView style={styles.safe}>
          <AnimatedBackground intensity="soft" />
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                <Text style={styles.date}>{formatDate()}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Déco</Text>
              </TouchableOpacity>
            </View>

            {/* KPI row */}
            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { borderLeftColor: SP.secondary }]}>
                <Text style={styles.kpiLabel}>Hydratation</Text>
                <Text style={[styles.kpiValue, { color: SP.secondary }]}>
                  {(data.hydration.consumedMl / 1000).toFixed(1)}
                  <Text style={styles.kpiUnit}> / {data.hydration.targetMl / 1000}L</Text>
                </Text>
                <View style={styles.kpiTrack}>
                  <View style={[styles.kpiFill, { width: `${hydrationPct * 100}%`, backgroundColor: SP.secondary }]} />
                </View>
              </View>

              <View style={[styles.kpiCard, { borderLeftColor: '#8B5CF6' }]}>
                <Text style={styles.kpiLabel}>Sommeil</Text>
                <Text style={[styles.kpiValue, { color: '#8B5CF6' }]}>
                  {data.sleep.actualHours}h
                  <Text style={styles.kpiUnit}> / {data.sleep.targetHours}h</Text>
                </Text>
                <View style={styles.kpiTrack}>
                  <View style={[styles.kpiFill, { width: `${sleepPct * 100}%`, backgroundColor: '#8B5CF6' }]} />
                </View>
              </View>
            </View>

            {/* Calories */}
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>Calories du jour</Text>
                <Text style={styles.meta}>
                  <Text style={styles.accent}>{data.calories.consumed}</Text>
                  {' / '}
                  {data.calories.target} kcal
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${caloriePct * 100}%` }]} />
              </View>
              <Text style={styles.remaining}>{remaining} kcal restantes</Text>
            </View>

            {/* Macros */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Macronutriments</Text>
              <View style={styles.macrosRow}>
                <MacroBar label="Protéines" value={data.macros.proteins} max={200} color={SP.primary} />
                <MacroBar label="Glucides" value={data.macros.carbs} max={300} color="#10B981" />
                <MacroBar label="Lipides" value={data.macros.fats} max={100} color={SP.secondary} />
              </View>
            </View>

            {/* Score */}
            <View style={[styles.card, styles.scoreCard]}>
              <View>
                <Text style={styles.cardTitle}>Score d'activité</Text>
                <Text style={styles.scoreLabel}>
                  {data.activityScore >= 80 ? 'Excellent 🔥' : data.activityScore >= 60 ? 'Bien 👍' : 'À améliorer 💪'}
                </Text>
              </View>
              <Text style={styles.scoreValue}>
                {data.activityScore}
                <Text style={styles.scoreMax}>/100</Text>
              </Text>
            </View>

            {/* Weekly plan */}
            <View style={[styles.card, { marginBottom: Spacing.four }]}>
              <Text style={styles.cardTitle}>Plan de la semaine</Text>
              <View style={styles.planList}>
                {data.weeklyPlan.map((s) => (
                  <View key={s.day} style={styles.planRow}>
                    <View style={styles.planDot} />
                    <Text style={styles.planDay}>{s.day}</Text>
                    <Text style={styles.planType}>{s.type}</Text>
                    <Text style={styles.planDuration}>{s.duration} min</Text>
                  </View>
                ))}
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      )}

      <AILoader visible={loading || !data} />
    </View>
  );
}

function MacroBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={macro.container}>
      <Text style={macro.value}>{value}<Text style={macro.unit}>g</Text></Text>
      <View style={macro.track}>
        <View style={[macro.fill, { height: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={macro.label}>{label}</Text>
    </View>
  );
}

const macro = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: Spacing.one },
  value: { fontSize: 18, fontWeight: '700', color: SP.text },
  unit: { fontSize: 12, fontWeight: '500', color: SP.textMuted },
  track: {
    width: '100%', height: 80,
    backgroundColor: SP.bgInput,
    borderRadius: 8, overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: SP.borderDim,
  },
  fill: { width: '100%', borderRadius: 8 },
  label: { fontSize: 12, color: SP.textMuted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SP.bg },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.three,
  },
  header: { paddingTop: Spacing.four, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
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
  kpiValue: { fontSize: 18, fontWeight: '700' },
  kpiUnit: { fontSize: 13, fontWeight: '400', color: SP.textMuted },
  kpiTrack: { height: 4, backgroundColor: SP.bgInput, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  kpiFill: { height: '100%', borderRadius: 2 },

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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: SP.textDim },
  meta: { fontSize: 14, color: SP.textMuted },
  accent: { fontSize: 16, fontWeight: '700', color: SP.primary },
  track: { height: 8, backgroundColor: SP.bgInput, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: SP.primary, borderRadius: 4 },
  remaining: { fontSize: 12, color: SP.textMuted, textAlign: 'right' },
  macrosRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  scoreCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 13, color: SP.textMuted, marginTop: 2 },
  scoreValue: { fontSize: 48, fontWeight: '800', color: SP.primary },
  scoreMax: { fontSize: 20, fontWeight: '500', color: SP.textMuted },
  planList: { gap: Spacing.two, marginTop: Spacing.one },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  planDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: SP.primary },
  planDay: { fontSize: 14, fontWeight: '600', color: SP.text, width: 90 },
  planType: { fontSize: 14, color: SP.textDim, flex: 1 },
  planDuration: { fontSize: 13, color: SP.textMuted },
});
