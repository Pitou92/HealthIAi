import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { ActivityLevel, ActivityType } from '@/types/user';

const FREQUENCIES = [1, 2, 3, 4, 5, 6, 7];

const ACTIVITY_TYPES: { label: string; value: ActivityType }[] = [
  { label: 'Cardio', value: 'cardio' },
  { label: 'Musculation', value: 'strength' },
  { label: 'Mixte', value: 'mixed' },
  { label: 'Yoga', value: 'yoga' },
];

const LEVELS: { label: string; value: ActivityLevel }[] = [
  { label: 'Débutant', value: 'sedentary' },
  { label: 'Intermédiaire', value: 'light' },
  { label: 'Avancé', value: 'moderate' },
  { label: 'Expert', value: 'intense' },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const { setStep3 } = useOnboardingStore();

  const [frequency, setFrequency] = useState<number | null>(null);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [level, setLevel] = useState<ActivityLevel | null>(null);

  const canFinish = frequency !== null && activityType !== null && level !== null;

  function handleFinish() {
    if (!canFinish) return;
    setStep3({ activityFrequency: frequency, activityType, activityLevel: level });
    router.push(Routes.AILoading);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Étape 3 sur 3</Text>
        <Text style={styles.title}>Votre activité</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Séances par semaine</Text>
          <View style={styles.chips}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, frequency === f && styles.chipActive]}
                onPress={() => setFrequency(f)}>
                <Text style={[styles.chipText, frequency === f && styles.chipTextActive]}>
                  {f}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{"Type d'activité"}</Text>
          <View style={styles.grid}>
            {ACTIVITY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.gridItem, activityType === t.value && styles.gridItemActive]}
                onPress={() => setActivityType(t.value)}>
                <Text style={[styles.gridText, activityType === t.value && styles.gridTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Niveau</Text>
          <View style={styles.grid}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l.value}
                style={[styles.gridItem, level === l.value && styles.gridItemActive]}
                onPress={() => setLevel(l.value)}>
                <Text style={[styles.gridText, level === l.value && styles.gridTextActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !canFinish && styles.nextBtnDisabled]}
        onPress={handleFinish}
        disabled={!canFinish}>
        <Text style={styles.nextBtnText}>Générer mon plan IA ✨</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progress: { flexDirection: 'row', gap: 4, marginBottom: 24 },
  dot: { height: 5, flex: 1, borderRadius: 3 },
  dotActive: { backgroundColor: '#007AFF' },
  dotDone: { backgroundColor: '#34C759' },
  content: { flex: 1, gap: 24 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 34, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  section: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  chipActive: { backgroundColor: 'rgba(0,122,255,0.1)' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  chipTextActive: { color: '#007AFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gridItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFF',
    minWidth: '45%',
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  gridItemActive: { backgroundColor: 'rgba(0,122,255,0.1)' },
  gridText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  gridTextActive: { color: '#007AFF' },
  nextBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtnDisabled: { opacity: 0.38 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
