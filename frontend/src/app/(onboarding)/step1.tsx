import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Routes } from '@/navigation/routes';
import { Spacing } from '@/constants/theme';

type Sex = 'male' | 'female' | 'other';

export default function OnboardingStep1() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);

  const sexOptions: { label: string; value: Sex }[] = [
    { label: 'Homme', value: 'male' },
    { label: 'Femme', value: 'female' },
    { label: 'Autre', value: 'other' },
  ];

  function handleNext() {
    // TODO Sprint 5 : stocker dans le store global
    router.push(Routes.OnboardingStep2);
  }

  const canContinue = age && height && weight && sex;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Parlez-nous de vous</Text>
        <Text style={styles.subtitle}>Étape 1 sur 3</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Âge</Text>
              <TextInput
                style={styles.input}
                placeholder="28"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Taille (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="70"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View>
            <Text style={styles.label}>Sexe</Text>
            <View style={styles.chips}>
              {sexOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, sex === opt.value && styles.chipActive]}
                  onPress={() => setSex(opt.value)}>
                  <Text style={[styles.chipText, sex === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!canContinue}>
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
  dot: {
    height: 6,
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dotActive: { backgroundColor: '#208AEF' },
  content: { flex: 1, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 14, color: '#888', marginTop: -Spacing.two },
  form: { gap: Spacing.three, marginTop: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  halfField: { flex: 1, gap: Spacing.one },
  fullField: { gap: Spacing.one },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  input: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  chips: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  chip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  chipActive: { backgroundColor: '#208AEF' },
  chipText: { fontSize: 15, fontWeight: '600', color: '#555' },
  chipTextActive: { color: '#fff' },
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
