import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app';
import { useRouter } from 'expo-router';

export default function NutritionScreen() {
  const router = useRouter();
  const { recommendations: data, dailyProgress: progress, nutritionLogs: logs, favoriteMeals } = useAppStore();

  if (!data || !progress) return null;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Nutrition</Text>

          {/* Actions principales */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/nutrition/scan' as any)}>
              <Text style={styles.actionIcon}>📸</Text>
              <Text style={styles.actionTitle}>Scanner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FF9500' }]} onPress={() => router.push('/nutrition/search' as any)}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Rechercher</Text>
            </TouchableOpacity>
          </View>

          {/* Favoris */}
          {favoriteMeals && favoriteMeals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Repas Favoris</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {favoriteMeals.map((fav, i) => (
                  <View key={i} style={styles.favCard}>
                    <Text style={styles.favIcon}>⭐</Text>
                    <View>
                      <Text style={styles.favName}>{fav.name}</Text>
                      <Text style={styles.favKcal}>{fav.calories} kcal</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Résumé du jour */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Aujourd'hui</Text>
              <Text style={styles.kcalLeft}>{progress.calories_target - progress.calories_consumed} kcal restants</Text>
            </View>
            <View style={styles.macroGrid}>
              <MacroItem label="Protéines" current={progress.protein_consumed} target={progress.protein_target} color="#FF9500" />
              <MacroItem label="Glucides" current={progress.carbs_consumed} target={progress.carbs_target} color="#34C759" />
              <MacroItem label="Lipides" current={progress.fat_consumed} target={progress.fat_target} color="#AF52DE" />
            </View>
          </View>

          {/* Journal de bord */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Journal de bord</Text>
            <View style={styles.card}>
              {logs.length === 0 ? (
                <Text style={styles.emptyText}>Aucun repas enregistré aujourd'hui.</Text>
              ) : (
                logs.map((log, i) => (
                  <View key={i} style={[styles.logItem, i < logs.length - 1 && styles.divider]}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.logName}>{log.name}</Text>
                        <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                      <Text style={styles.logKcal}>{log.calories} <Text style={styles.logUnit}>kcal</Text></Text>
                    </View>
                    <Text style={styles.logItems}>{log.items.join(', ')}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Recommandations IA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan IA</Text>
            <View style={styles.card}>
              {data.nutrition.meals.map((meal, i) => (
                <View key={i} style={[styles.mealItem, i < data.nutrition.meals.length - 1 && styles.divider]}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealKcal}>{meal.calories} kcal</Text>
                  </View>
                  <Text style={styles.mealItems}>{meal.items.join(', ')}</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MacroItem({ label, current, target, color }: any) {
  const progress = Math.min(current / target, 1);
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>{Math.round(current)}<Text style={styles.macroTarget}>/{target}g</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  title: { fontSize: 34, fontWeight: '800', color: '#000', marginTop: 10 },
  
  actionGrid: { flexDirection: 'row', gap: 12, marginTop: 10 },
  actionCard: { 
    flex: 1, backgroundColor: '#007AFF', borderRadius: 16, padding: 16, 
    alignItems: 'center', gap: 8 
  },
  actionIcon: { fontSize: 28 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  section: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  kcalLeft: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  
  macroGrid: { flexDirection: 'row', gap: 12 },
  macroItem: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 12, gap: 6 },
  macroLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
  macroTrack: { height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden' },
  macroFill: { height: '100%' },
  macroValue: { fontSize: 15, fontWeight: '700', color: '#000' },
  macroTarget: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },

  card: { 
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  emptyText: { textAlign: 'center', color: '#8E8E93', fontSize: 15, paddingVertical: 10 },
  
  logItem: { paddingVertical: 4, gap: 4 },
  logName: { fontSize: 17, fontWeight: '600', color: '#000' },
  logTime: { fontSize: 13, color: '#8E8E93' },
  logKcal: { fontSize: 17, fontWeight: '700', color: '#000' },
  logUnit: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  logItems: { fontSize: 14, color: '#8E8E93', lineHeight: 18 },

  mealItem: { paddingVertical: 4, gap: 4 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#000' },
  mealKcal: { fontSize: 15, fontWeight: '700', color: '#007AFF' },
  mealItems: { fontSize: 14, color: '#8E8E93', lineHeight: 18 },

  favCard: { 
    backgroundColor: '#FFF', borderRadius: 12, padding: 12, width: 140,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
    gap: 6
  },
  favIcon: { fontSize: 20 },
  favName: { fontSize: 15, fontWeight: '600', color: '#000' },
  favKcal: { fontSize: 13, color: '#FF9500', fontWeight: '500' },

  divider: { borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA', paddingBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
