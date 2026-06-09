import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { SP, Spacing } from '@/constants/theme';
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
      <AnimatedBackground intensity="soft" />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Bienvenue !</Text>
        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={SP.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor={SP.textMuted}
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
              ? <ActivityIndicator color="#fff" />
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
  container: { flex: 1, backgroundColor: SP.bg, paddingHorizontal: Spacing.four },

  back: { paddingVertical: Spacing.three },
  backText: { fontSize: 16, color: SP.primary, fontWeight: '600' },

  content: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  eyebrow: { fontSize: 14, color: SP.textDim },
  title: { fontSize: 34, fontWeight: '800', color: SP.text, letterSpacing: -0.5, marginTop: -Spacing.two },

  card: {
    backgroundColor: SP.bgCard,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: SP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: SP.border,
  },

  input: {
    backgroundColor: SP.bgInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    color: SP.text,
    borderWidth: 1,
    borderColor: SP.borderDim,
  },

  error: { fontSize: 13, color: '#F87171', textAlign: 'center' },

  primaryBtn: {
    backgroundColor: SP.primary,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
    shadowColor: SP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  linkText: { fontSize: 14, color: SP.primary, textAlign: 'center', marginTop: Spacing.one },
});
