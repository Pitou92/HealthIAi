import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Routes } from '@/navigation/routes';
import { Spacing } from '@/constants/theme';
import type { Goal } from '@/types/user';

const GOALS: { label: string; description: string; value: Goal }[] = [
  { label: 'Perte de poids', description: 'Brûler des graisses et affiner la silhouette', value: 'weight_loss' },
  { label: 'Prise de masse', description: 'Développer la masse musculaire', value: 'muscle_gain' },
  { label: 'Forme générale', description: 'Améliorer santé et endurance', value: 'fitness' },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);

  function handleNext() {
    // TODO Sprint 5 : stocker dans le store global
    router.push(Routes.OnboardingStep3);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Votre objectif</Text>
        <Text style={styles.subtitle}>Étape 2 sur 3</Text>

        <View style={styles.options}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.card, goal === g.value && styles.cardActive]}
              onPress={() => setGoal(g.value)}>
              <Text style={[styles.cardLabel, goal === g.value && styles.cardLabelActive]}>
                {g.label}
              </Text>
              <Text style={[styles.cardDesc, goal === g.value && styles.cardDescActive]}>
                {g.description}
              </Text>
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
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  progress: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.four },
  dot: { height: 6, flex: 1, borderRadius: 3, backgroundColor: '#E0E0E0' },
  dotActive: { backgroundColor: '#208AEF' },
  dotDone: { backgroundColor: '#6EC6FF' },
  content: { flex: 1, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 14, color: '#888', marginTop: -Spacing.two },
  options: { gap: Spacing.two, marginTop: Spacing.two },
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { backgroundColor: '#EAF4FF', borderColor: '#208AEF' },
  cardLabel: { fontSize: 17, fontWeight: '700', color: '#000' },
  cardLabelActive: { color: '#208AEF' },
  cardDesc: { fontSize: 14, color: '#666' },
  cardDescActive: { color: '#208AEF' },
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
