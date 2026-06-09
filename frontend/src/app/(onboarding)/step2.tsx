import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DF, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { Goal } from '@/types/user';

const GOALS: { label: string; description: string; value: Goal; accent: string }[] = [
  { label: 'Perte de poids', description: 'Brûler des graisses et affiner la silhouette', value: 'weight_loss', accent: DF.mint },
  { label: 'Prise de masse', description: 'Développer la masse musculaire', value: 'muscle_gain', accent: DF.violet },
  { label: 'Forme générale', description: 'Améliorer santé et endurance', value: 'fitness', accent: DF.green },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const setStep2 = useOnboardingStore((s) => s.setStep2);
  const [goal, setGoal] = useState<Goal | null>(null);

  function handleNext() {
    if (!goal) return;
    setStep2({ goal });
    router.push(Routes.OnboardingStep3);
  }

  const activeGoal = GOALS.find((g) => g.value === goal);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.orb, styles.orbViolet]} />
      <View style={[styles.orb, styles.orbMint]} />

      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotInactive]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Étape 2 sur 3</Text>
        <Text style={styles.title}>Votre{'\n'}objectif</Text>

        <View style={styles.options}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.card, goal === g.value && { borderColor: g.accent, backgroundColor: `${g.accent}10` }]}
              onPress={() => setGoal(g.value)}>
              <View style={[styles.cardDot, { backgroundColor: goal === g.value ? g.accent : DF.borderDim }]} />
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, goal === g.value && { color: g.accent }]}>
                  {g.label}
                </Text>
                <Text style={styles.cardDesc}>{g.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.nextBtn,
          !goal && styles.nextBtnDisabled,
          activeGoal && { borderColor: activeGoal.accent, backgroundColor: `${activeGoal.accent}20` },
        ]}
        onPress={handleNext}
        disabled={!goal}>
        <Text style={[styles.nextBtnText, activeGoal && { color: activeGoal.accent }]}>
          Suivant →
        </Text>
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
  orbViolet: { width: 220, height: 220, top: -70, left: -70, backgroundColor: DF.orb2 },
  orbMint: { width: 140, height: 140, bottom: 100, right: -30, backgroundColor: DF.orb1 },

  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.three },
  dot: { height: 4, flex: 1, borderRadius: 2 },
  dotActive: { backgroundColor: DF.mint },
  dotDone: { backgroundColor: 'rgba(0, 255, 214, 0.45)' },
  dotInactive: { backgroundColor: DF.borderDim },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: DF.mint, textTransform: 'uppercase', letterSpacing: 0.2 },
  title: { fontSize: 32, fontWeight: '800', color: DF.text, letterSpacing: -0.5, lineHeight: 38 },

  options: { gap: Spacing.two, marginTop: Spacing.one },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: DF.bgCard,
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: DF.borderDim,
  },
  cardDot: { width: 10, height: 10, borderRadius: 5 },
  cardText: { flex: 1, gap: 3 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: DF.text },
  cardDesc: { fontSize: 13, color: DF.textDim },

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
