import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DF, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { postOnboarding } from '@/services/api';
import { useOnboardingStore } from '@/store/onboarding';
import type { ActivityLevel, ActivityType, UserProfile } from '@/types/user';

const FREQUENCIES = [1, 2, 3, 4, 5, 6, 7];

const ACTIVITY_TYPES: { label: string; value: ActivityType }[] = [
  { label: 'Cardio', value: 'cardio' },
  { label: 'Musculation', value: 'strength' },
  { label: 'Mixte', value: 'mixed' },
  { label: 'Yoga', value: 'yoga' },
];

const LEVELS: { label: string; value: ActivityLevel; accent: string }[] = [
  { label: 'Débutant', value: 'sedentary', accent: DF.cyan },
  { label: 'Intermédiaire', value: 'light', accent: DF.mint },
  { label: 'Avancé', value: 'moderate', accent: DF.violet },
  { label: 'Expert', value: 'intense', accent: DF.pink },
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
      <View style={[styles.orb, styles.orbMint]} />
      <View style={[styles.orb, styles.orbViolet]} />

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
                style={[
                  styles.gridItem,
                  level === l.value && { backgroundColor: `${l.accent}18`, borderColor: l.accent },
                ]}
                onPress={() => setLevel(l.value)}>
                <Text style={[styles.gridText, level === l.value && { color: l.accent }]}>
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
          ? <ActivityIndicator color={DF.mint} />
          : <Text style={styles.nextBtnText}>Voir mes recommandations IA</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DF.bg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999 },
  orbMint: { width: 180, height: 180, top: -50, left: -50, backgroundColor: DF.orb1 },
  orbViolet: { width: 160, height: 160, bottom: 120, right: -50, backgroundColor: DF.orb2 },

  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.three },
  dot: { height: 4, flex: 1, borderRadius: 2 },
  dotActive: { backgroundColor: DF.mint },
  dotDone: { backgroundColor: 'rgba(0, 255, 214, 0.45)' },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: DF.mint, textTransform: 'uppercase', letterSpacing: 0.2 },
  title: { fontSize: 32, fontWeight: '800', color: DF.text, letterSpacing: -0.5 },

  section: { gap: Spacing.two },
  label: { fontSize: 13, fontWeight: '600', color: DF.textDim },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.borderDim,
  },
  chipActive: { backgroundColor: 'rgba(0, 255, 214, 0.12)', borderColor: DF.mint },
  chipText: { fontSize: 14, fontWeight: '600', color: DF.textDim },
  chipTextActive: { color: DF.mint },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  gridItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.borderDim,
    minWidth: '45%',
    flex: 1,
    alignItems: 'center',
  },
  gridItemActive: { backgroundColor: 'rgba(0, 255, 214, 0.12)', borderColor: DF.mint },
  gridText: { fontSize: 14, fontWeight: '600', color: DF.textDim },
  gridTextActive: { color: DF.mint },

  nextBtn: {
    backgroundColor: 'rgba(0, 255, 214, 0.14)',
    borderWidth: 1,
    borderColor: DF.border,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: DF.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: DF.mint },
});
