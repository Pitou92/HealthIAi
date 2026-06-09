import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { OW, Spacing } from '@/constants/theme';
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
    backgroundColor: OW.bg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },

  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.three },
  dot: { height: 5, flex: 1, borderRadius: 3 },
  dotActive: { backgroundColor: OW.orange },
  dotDone: { backgroundColor: OW.peach },
  dotInactive: { backgroundColor: 'rgba(249, 115, 22, 0.18)' },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: OW.orange, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '800', color: OW.text, letterSpacing: -0.5 },

  options: { gap: Spacing.two, marginTop: Spacing.one },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: OW.bgCard,
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: OW.borderDim,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: OW.orange,
    backgroundColor: 'rgba(249, 115, 22, 0.04)',
    shadowColor: OW.orange,
    shadowOpacity: 0.12,
  },
  cardEmoji: { fontSize: 28 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: OW.text },
  cardLabelActive: { color: OW.orangeDeep },
  cardDesc: { fontSize: 13, color: OW.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: OW.borderDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: OW.orange },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: OW.orange },

  nextBtn: {
    backgroundColor: OW.orange,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: OW.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnDisabled: { opacity: 0.38 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
