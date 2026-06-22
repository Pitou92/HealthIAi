import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
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
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingVertical: Spacing.three,
  },

  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.four },
  dot: { height: 5, flex: 1, borderRadius: 3 },
  dotActive: { backgroundColor: '#007AFF' },
  dotDone: { backgroundColor: '#34C759' },
  dotInactive: { backgroundColor: '#E5E5EA' },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 34, fontWeight: '800', color: '#000', letterSpacing: -0.5 },

  options: { gap: Spacing.two, marginTop: Spacing.one },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardActive: { backgroundColor: 'rgba(0,122,255,0.06)' },
  cardEmoji: { fontSize: 28 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  cardLabelActive: { color: '#007AFF' },
  cardDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#007AFF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },

  nextBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  nextBtnDisabled: { opacity: 0.38 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
