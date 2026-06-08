import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecommendations } from '@/services/api';
import { Spacing } from '@/constants/theme';

type Recs = Awaited<ReturnType<typeof getRecommendations>>;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatDate() {
  const d = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export default function DashboardScreen() {
  const [data, setData] = useState<Recs | null>(null);

  useEffect(() => {
    getRecommendations().then(setData);
  }, []);

  if (!data) return null;

  const caloriePct = Math.min(data.calories.consumed / data.calories.target, 1);
  const remaining = data.calories.target - data.calories.consumed;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.date}>{formatDate()}</Text>
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
            <MacroBar label="Protéines" value={data.macros.proteins} max={200} color="#208AEF" />
            <MacroBar label="Glucides" value={data.macros.carbs} max={300} color="#34C759" />
            <MacroBar label="Lipides" value={data.macros.fats} max={100} color="#FF9500" />
          </View>
        </View>

        {/* Score */}
        <View style={[styles.card, styles.scoreCard]}>
          <View>
            <Text style={styles.cardTitle}>Score d'activité</Text>
            <Text style={styles.scoreLabel}>
              {data.activityScore >= 80 ? 'Excellent' : data.activityScore >= 60 ? 'Bien' : 'À améliorer'}
            </Text>
          </View>
          <Text style={styles.scoreValue}>
            {data.activityScore}
            <Text style={styles.scoreMax}>/100</Text>
          </Text>
        </View>

        {/* Weekly plan */}
        <View style={styles.card}>
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
  );
}

function MacroBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
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
  value: { fontSize: 18, fontWeight: '700', color: '#000' },
  unit: { fontSize: 12, fontWeight: '500', color: '#888' },
  track: {
    width: '100%',
    height: 80,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 8 },
  label: { fontSize: 12, color: '#888', textAlign: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
    gap: Spacing.three,
  },
  header: { paddingTop: Spacing.four, gap: 4 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#000' },
  date: { fontSize: 14, color: '#888' },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  meta: { fontSize: 14, color: '#888' },
  accent: { fontSize: 16, fontWeight: '700', color: '#208AEF' },
  track: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#208AEF',
    borderRadius: 5,
  },
  remaining: { fontSize: 13, color: '#aaa', textAlign: 'right' },
  macrosRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  scoreCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 13, color: '#888', marginTop: 2 },
  scoreValue: { fontSize: 48, fontWeight: '800', color: '#208AEF' },
  scoreMax: { fontSize: 20, fontWeight: '500', color: '#CCC' },
  planList: { gap: Spacing.two, marginTop: Spacing.one },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  planDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#208AEF' },
  planDay: { fontSize: 14, fontWeight: '600', color: '#000', width: 90 },
  planType: { fontSize: 14, color: '#555', flex: 1 },
  planDuration: { fontSize: 13, color: '#888' },
});
