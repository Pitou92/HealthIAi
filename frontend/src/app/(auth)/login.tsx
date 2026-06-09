import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { OW, Spacing } from '@/constants/theme';
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
      <AnimatedBackground intensity="soft" />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Bon retour 👋</Text>
        <Text style={styles.title}>Connexion</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={OW.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor={OW.textMuted}
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
              ? <ActivityIndicator color="#fff" />
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
  container: { flex: 1, backgroundColor: OW.bg, paddingHorizontal: Spacing.four },

  back: { paddingVertical: Spacing.three },
  backText: { fontSize: 16, color: OW.orange, fontWeight: '600' },

  content: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  eyebrow: { fontSize: 14, color: OW.textDim },
  title: { fontSize: 34, fontWeight: '800', color: OW.text, letterSpacing: -0.5, marginTop: -Spacing.two },

  card: {
    backgroundColor: OW.bgCard,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: OW.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: OW.border,
  },

  input: {
    backgroundColor: OW.bgInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    color: OW.text,
    borderWidth: 1,
    borderColor: OW.borderDim,
  },

  error: { fontSize: 13, color: '#E53E3E', textAlign: 'center' },

  primaryBtn: {
    backgroundColor: OW.orange,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
    shadowColor: OW.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  linkText: { fontSize: 14, color: OW.orange, textAlign: 'center', marginTop: Spacing.one },
});
