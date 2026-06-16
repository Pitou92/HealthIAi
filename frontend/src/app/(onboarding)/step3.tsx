import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { SP, Spacing } from '@/constants/theme';
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

  async function handleFinish() {
    if (!canFinish) return;

    setStep3({ activityFrequency: frequency, activityType, activityLevel: level });
    router.push(Routes.AILoading);
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground intensity="soft" />

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
                  {f}×
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
        disabled={!canFinish}>
        <Text style={styles.nextBtnText}>Générer mon plan IA ✨</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SP.bg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },

  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.three },
  dot: { height: 5, flex: 1, borderRadius: 3 },
  dotActive: { backgroundColor: SP.primary },
  dotDone: { backgroundColor: 'rgba(34, 197, 94, 0.5)' },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: SP.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '800', color: SP.text, letterSpacing: -0.5 },

  section: { gap: Spacing.two },
  label: { fontSize: 13, fontWeight: '600', color: SP.textDim },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: SP.bgCard,
    borderWidth: 1.5,
    borderColor: SP.borderDim,
  },
  chipActive: { backgroundColor: 'rgba(34, 197, 94, 0.12)', borderColor: SP.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: SP.textDim },
  chipTextActive: { color: SP.primary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  gridItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: SP.bgCard,
    borderWidth: 1.5,
    borderColor: SP.borderDim,
    minWidth: '45%',
    flex: 1,
    alignItems: 'center',
  },
  gridItemActive: { backgroundColor: 'rgba(34, 197, 94, 0.12)', borderColor: SP.primary },
  gridText: { fontSize: 14, fontWeight: '600', color: SP.textDim },
  gridTextActive: { color: SP.primary },

  nextBtn: {
    backgroundColor: SP.primary,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: SP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnDisabled: { opacity: 0.38 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
