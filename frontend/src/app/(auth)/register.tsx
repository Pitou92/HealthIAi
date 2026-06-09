import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DF, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { register } from '@/services/api';
import { saveToken } from '@/services/token';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setError(null);
    setLoading(true);
    try {
      const { token } = await register(email, password);
      await saveToken(token);
      router.push(Routes.OnboardingStep1);
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.orb, styles.orbViolet]} />
      <View style={[styles.orb, styles.orbMint]} />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Nouveau ici ?</Text>
        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={DF.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor={DF.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={DF.mint} />
              : <Text style={styles.primaryBtnText}>Créer mon compte</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(Routes.Login)}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DF.bg,
    paddingHorizontal: Spacing.four,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999 },
  orbViolet: { width: 240, height: 240, top: -80, right: -80, backgroundColor: DF.orb2 },
  orbMint: { width: 160, height: 160, bottom: 100, left: -40, backgroundColor: DF.orb1 },

  back: { paddingVertical: Spacing.three },
  backText: { fontSize: 16, color: DF.mint },

  content: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: DF.violet,
    textTransform: 'uppercase',
  },
  title: { fontSize: 34, fontWeight: '800', color: DF.text, letterSpacing: -0.5 },

  card: {
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.borderViolet,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: DF.violet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },

  input: {
    backgroundColor: DF.bgInput,
    borderWidth: 1,
    borderColor: DF.borderDim,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    color: DF.text,
  },

  error: { fontSize: 13, color: DF.pink, textAlign: 'center' },

  primaryBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.14)',
    borderWidth: 1,
    borderColor: DF.borderViolet,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
    shadowColor: DF.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: DF.violet },

  linkText: { fontSize: 14, color: DF.textDim, textAlign: 'center', marginTop: Spacing.one },
});
