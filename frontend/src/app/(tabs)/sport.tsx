import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app';

export default function SportScreen() {
  const { recommendations: data } = useAppStore();

  if (!data) return null;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Sport</Text>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Plan de la semaine</Text>
            {data.sport.weeklyPlan.map((day, i) => (
              <View key={i} style={[styles.dayItem, i < data.sport.weeklyPlan.length - 1 && styles.divider]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.dayName}>{day.day}</Text>
                  <Text style={styles.dayIntensity}>{day.intensity}</Text>
                </View>
                <Text style={styles.dayType}>{day.type}</Text>
                <View style={styles.exercises}>
                  {day.exercises.map((ex, j) => (
                    <Text key={j} style={styles.exercise}>{ex}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  title: { fontSize: 34, fontWeight: '800', color: '#000', marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  dayItem: { paddingVertical: 12, gap: 4 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayName: { fontSize: 17, fontWeight: '700', color: '#000' },
  dayIntensity: { fontSize: 13, fontWeight: '600', color: '#34C759', backgroundColor: 'rgba(52, 199, 89, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  dayType: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  exercises: { marginTop: 8, gap: 4 },
  exercise: { fontSize: 15, color: '#000' },
});
