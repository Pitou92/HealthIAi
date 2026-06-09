import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { SP, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { Goal } from '@/types/user';

const GOALS: { label: string; description: string; value: Goal; emoji: string }[] = [
  { label: 'Perte de poids', description: 'Brûler des graisses et affiner la silhouette', value: 'weight_loss', emoji: '🔥' },
  { label: 'Prise de masse', description: 'Développer la masse musculaire', value: 'muscle_gain', emoji: '💪' },
  { label: 'Forme générale', description: 'Améliorer santé et endurance', value: 'fitness', emoji: '⚡️' },
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

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground intensity="soft" />

      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotInactive]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Étape 2 sur 3</Text>
        <Text style={styles.title}>Votre objectif</Text>

        <View style={styles.options}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.card, goal === g.value && styles.cardActive]}
              onPress={() => setGoal(g.value)}>
              <Text style={styles.cardEmoji}>{g.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, goal === g.value && styles.cardLabelActive]}>
                  {g.label}
                </Text>
                <Text style={styles.cardDesc}>{g.description}</Text>
              </View>
              <View style={[styles.radio, goal === g.value && styles.radioActive]}>
                {goal === g.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !goal && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!goal}>
        <Text style={styles.nextBtnText}>Suivant →</Text>
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
  dotInactive: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: SP.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '800', color: SP.text, letterSpacing: -0.5 },

  options: { gap: Spacing.two, marginTop: Spacing.one },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: SP.bgCard,
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: SP.borderDim,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: SP.primary,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    shadowColor: SP.primary,
    shadowOpacity: 0.2,
  },
  cardEmoji: { fontSize: 28 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: SP.text },
  cardLabelActive: { color: SP.primary },
  cardDesc: { fontSize: 13, color: SP.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: SP.borderDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: SP.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: SP.primary },

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
