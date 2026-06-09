import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { OW, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { useOnboardingStore } from '@/store/onboarding';
import type { Sex } from '@/types/user';

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Autre', value: 'other' },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const setStep1 = useOnboardingStore((s) => s.setStep1);

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedAge = parseInt(age, 10);
  const parsedHeight = parseInt(height, 10);
  const parsedWeight = parseFloat(weight);

  const isValid =
    sex !== null &&
    age !== '' && !isNaN(parsedAge) && parsedAge > 0 && parsedAge < 130 &&
    height !== '' && !isNaN(parsedHeight) && parsedHeight > 50 && parsedHeight < 280 &&
    weight !== '' && !isNaN(parsedWeight) && parsedWeight > 10 && parsedWeight < 500;

  function handleNext() {
    if (!isValid) { setError('Veuillez renseigner des valeurs valides.'); return; }
    setStep1({ age: parsedAge, height: parsedHeight, weight: parsedWeight, sex: sex! });
    router.push(Routes.OnboardingStep2);
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground intensity="soft" />

      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Étape 1 sur 3</Text>
        <Text style={styles.title}>Parlez-nous{'\n'}de vous</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Âge</Text>
              <TextInput
                style={styles.input}
                placeholder="28"
                placeholderTextColor={OW.textMuted}
                keyboardType="numeric"
                value={age}
                onChangeText={(v) => { setAge(v); setError(null); }}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Taille (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                placeholderTextColor={OW.textMuted}
                keyboardType="numeric"
                value={height}
                onChangeText={(v) => { setHeight(v); setError(null); }}
              />
            </View>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="70"
              placeholderTextColor={OW.textMuted}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={(v) => { setWeight(v); setError(null); }}
            />
          </View>

          <View>
            <Text style={styles.label}>Sexe</Text>
            <View style={styles.chips}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, sex === opt.value && styles.chipActive]}
                  onPress={() => { setSex(opt.value); setError(null); }}>
                  <Text style={[styles.chipText, sex === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !isValid && styles.nextBtnDisabled]}
        onPress={handleNext}>
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
  dotInactive: { backgroundColor: 'rgba(249, 115, 22, 0.18)' },

  content: { flex: 1, gap: Spacing.three },
  eyebrow: { fontSize: 12, fontWeight: '700', color: OW.orange, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '800', color: OW.text, letterSpacing: -0.5, lineHeight: 38 },

  form: { gap: Spacing.three, marginTop: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two },
  halfField: { flex: 1, gap: Spacing.one },
  fullField: { gap: Spacing.one },
  label: { fontSize: 13, fontWeight: '600', color: OW.textDim },

  input: {
    backgroundColor: OW.bgInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
    color: OW.text,
    borderWidth: 1,
    borderColor: OW.borderDim,
  },

  chips: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  chip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: OW.bgCard,
    borderWidth: 1.5,
    borderColor: OW.borderDim,
  },
  chipActive: { backgroundColor: 'rgba(249, 115, 22, 0.08)', borderColor: OW.orange },
  chipText: { fontSize: 15, fontWeight: '600', color: OW.textDim },
  chipTextActive: { color: OW.orange },

  error: { fontSize: 13, color: '#E53E3E', textAlign: 'center' },

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
