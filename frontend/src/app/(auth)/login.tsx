import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DF, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { login } from '@/services/api';
import { saveToken } from '@/services/token';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(email, password);
      await saveToken(token);
      router.replace(Routes.Dashboard);
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.orb, styles.orbMint]} />
      <View style={[styles.orb, styles.orbViolet]} />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Bon retour</Text>
        <Text style={styles.title}>Connexion</Text>

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
            placeholder="Mot de passe"
            placeholderTextColor={DF.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={DF.mint} />
              : <Text style={styles.primaryBtnText}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(Routes.Register)}>
            <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
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
  orbMint: { width: 220, height: 220, top: -60, right: -60, backgroundColor: DF.orb1 },
  orbViolet: { width: 180, height: 180, bottom: 80, left: -60, backgroundColor: DF.orb2 },

  back: { paddingVertical: Spacing.three },
  backText: { fontSize: 16, color: DF.mint },

  content: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: DF.mint,
    textTransform: 'uppercase',
  },
  title: { fontSize: 34, fontWeight: '800', color: DF.text, letterSpacing: -0.5 },

  card: {
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.borderDim,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: DF.mint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    backgroundColor: 'rgba(0, 255, 214, 0.14)',
    borderWidth: 1,
    borderColor: DF.border,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
    shadowColor: DF.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: DF.mint },

  linkText: { fontSize: 14, color: DF.textDim, textAlign: 'center', marginTop: Spacing.one },
});
