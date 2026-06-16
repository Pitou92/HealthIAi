import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AILoader } from '@/components/ai-loader';
import { SP, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { removeToken } from '@/services/token';
import { useAppStore } from '@/store/app';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function todayFR() { return DAYS_FR[new Date().getDay()] ?? ''; }

function formatDate() {
  const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export default function DashboardScreen() {
  const router = useRouter();
  const { 
    loading, 
    error, 
    recommendations: data, 
    dailyProgress: progress,
    loadRecommendations, 
    reset,
    addWater,
    updateWeight
  } = useAppStore();

  useEffect(() => { if (!data) loadRecommendations(); }, []);

  async function handleLogout() {
    await removeToken();
    reset();
    router.replace(Routes.Welcome);
  }

  const today = todayFR();
  const todayWorkout = data?.sport?.weeklyPlan.find(d => d.day === today);

  const showEmpty = !data && !loading;
  if (showEmpty || error === 'NO_PROFILE') {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.emptySafe}>
          <Text style={styles.emptyTitle}>Prêt à commencer ?</Text>
          <Text style={styles.emptyText}>
            Générez votre plan personnalisé pour voir vos KPIs ici.
          </Text>
          <TouchableOpacity
            className="mt-2 rounded-2xl bg-primary px-8 py-4"
            onPress={() => { reset(); router.replace(Routes.OnboardingStep1); }}>
            <Text style={styles.emptyBtnText}>Créer mon plan</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <AILoader visible={loading} />

      {data && progress && (
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* ── Header ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.date}>{formatDate()}</Text>
                <Text style={styles.title}>Résumé</Text>
              </View>
              <TouchableOpacity style={styles.profileCircle} onPress={() => router.push(Routes.Welcome)}>
                <Text style={styles.profileInitial}>H</Text>
              </TouchableOpacity>
            </View>

            {/* ── Principaux KPIs (Apple Health Style) ── */}
            <View style={styles.mainGrid}>
              <KPICard 
                title="Calories" 
                value={progress.calories_consumed} 
                target={progress.calories_target} 
                unit="kcal" 
                color="#FF3B30"
                icon="🔥"
              />
              <KPICard 
                title="Hydratation" 
                value={progress.water_consumed_ml} 
                target={progress.water_target_ml} 
                unit="ml" 
                color="#007AFF"
                icon="💧"
                onPress={() => addWater(250)}
              />
            </View>

            {/* ── Macros ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Macronutriments</Text>
              <View style={styles.card}>
                <MacroBar label="Protéines" current={progress.protein_consumed} target={progress.protein_target} color="#FF9500" />
                <MacroBar label="Glucides" current={progress.carbs_consumed} target={progress.carbs_target} color="#34C759" />
                <MacroBar label="Lipides" current={progress.fat_consumed} target={progress.fat_target} color="#AF52DE" />
              </View>
            </View>

            {/* ── Physique ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physique</Text>
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.bodyLabel}>Poids actuel</Text>
                  <Text style={styles.bodyValue}>{progress.current_weight_kg ?? '--'} <Text style={styles.bodyUnit}>kg</Text></Text>
                </View>
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

// ── Components ──────────────────────────────────────────────────────────────

function KPICard({ title, value, target, unit, color, icon, onPress }: any) {
  const progress = Math.min(value / target, 1);
  return (
    <TouchableOpacity style={styles.kpiCard} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiIcon}>{icon}</Text>
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
      <View style={styles.kpiValueContainer}>
        <Text style={[styles.kpiValue, { color }]}>{value.toLocaleString()}</Text>
        <Text style={styles.kpiTarget}>/ {target.toLocaleString()} {unit}</Text>
      </View>
      <View style={styles.kpiTrack}>
        <View style={[styles.kpiFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </TouchableOpacity>
  );
}

function MacroBar({ label, current, target, color }: any) {
  const progress = Math.min(current / target, 1);
  return (
    <View style={styles.macroRow}>
      <View style={styles.rowBetween}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{current}g <Text style={styles.macroTarget}>/ {target}g</Text></Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' }, // System Background
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },

  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 10,
  },
  date: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
  title: { fontSize: 34, fontWeight: '800', color: '#000' },
  profileCircle: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' 
  },
  profileInitial: { fontSize: 18, fontWeight: '600', color: '#8E8E93' },

  mainGrid: { flexDirection: 'row', gap: 12 },
  kpiCard: { 
    flex: 1, backgroundColor: '#FFF', borderRadius: 12, 
    padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiIcon: { fontSize: 16 },
  kpiTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  kpiValueContainer: { gap: 2 },
  kpiValue: { fontSize: 24, fontWeight: '800' },
  kpiTarget: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  kpiTrack: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden' },
  kpiFill: { height: '100%', borderRadius: 3 },

  section: { gap: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginLeft: 4 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },

  macroRow: { gap: 8 },
  macroLabel: { fontSize: 15, fontWeight: '600', color: '#000' },
  macroValue: { fontSize: 14, fontWeight: '700', color: '#000' },
  macroTarget: { color: '#8E8E93', fontWeight: '500' },
  macroTrack: { height: 8, backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 4 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  bodyLabel: { fontSize: 17, fontWeight: '500', color: '#000' },
  bodyValue: { fontSize: 17, fontWeight: '700', color: '#000' },
  bodyUnit: { color: '#8E8E93' },

  mealItem: { paddingVertical: 4, gap: 4 },
  mealDivider: { borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA', paddingBottom: 12 },
  mealName: { fontSize: 17, fontWeight: '600', color: '#000' },
  mealTime: { fontSize: 15, color: '#8E8E93' },
  mealItems: { fontSize: 15, color: '#8E8E93', lineHeight: 20 },

  workoutCard: { backgroundColor: '#34C759' },
  workoutType: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  workoutDuration: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },

  logoutBtn: { marginTop: 20, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },

  // Empty state
  emptySafe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#000', textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { backgroundColor: '#34C759', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14 },
  emptyBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
