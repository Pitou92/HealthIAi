import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import { postOnboarding } from '@/services/api';
import { Spacing } from '@/constants/theme';
import type { ActivityLevel, ActivityType, UserProfile } from '@/types/user';

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
  const { data, setStep3, reset } = useOnboardingStore();

  const [frequency, setFrequency] = useState<number | null>(null);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [level, setLevel] = useState<ActivityLevel | null>(null);
  const [loading, setLoading] = useState(false);

  const canFinish = frequency !== null && activityType !== null && level !== null;

  async function handleFinish() {
    if (!canFinish) return;
    setStep3({ activityFrequency: frequency, activityType, activityLevel: level });

    const onboardingData: UserProfile = {
      age: data.age!,
      height: data.height!,
      weight: data.weight!,
      sex: data.sex!,
      goal: data.goal!,
      activityFrequency: frequency,
      activityType,
      activityLevel: level,
    };

    setLoading(true);
    try {
      await postOnboarding(onboardingData);
      reset();
      router.replace(Routes.Dashboard);
    } catch {
      router.replace(Routes.Dashboard);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Votre activité</Text>
        <Text style={styles.subtitle}>Étape 3 sur 3</Text>

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
          <Text style={styles.label}>Type d'activité</Text>
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
        disabled={!canFinish || loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.nextBtnText}>Voir mes recommandations IA</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.four },
  dot: { height: 6, flex: 1, borderRadius: 3, backgroundColor: '#E0E0E0' },
  dotActive: { backgroundColor: '#208AEF' },
  dotDone: { backgroundColor: '#6EC6FF' },
  content: { flex: 1, gap: Spacing.four },
  title: { fontSize: 28, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 14, color: '#888', marginTop: -Spacing.three },
  section: { gap: Spacing.two },
  label: { fontSize: 15, fontWeight: '600', color: '#333' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F0F0F3' },
  chipActive: { backgroundColor: '#208AEF' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#555' },
  chipTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  gridItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    minWidth: '45%',
    flex: 1,
    alignItems: 'center',
  },
  gridItemActive: { backgroundColor: '#208AEF' },
  gridText: { fontSize: 14, fontWeight: '600', color: '#555' },
  gridTextActive: { color: '#fff' },
  nextBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
