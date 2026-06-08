import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Routes } from '@/navigation/routes';
import { login } from '@/services/api';
import { saveToken } from '@/services/token';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
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
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: Spacing.four },
  back: { paddingVertical: Spacing.three },
  backText: { fontSize: 16, color: '#208AEF' },
  content: { flex: 1, justifyContent: 'center', gap: Spacing.four },
  title: { fontSize: 32, fontWeight: '800', color: '#000' },
  form: { gap: Spacing.two },
  input: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    color: '#000',
  },
  error: { fontSize: 14, color: '#FF3B30', textAlign: 'center' },
  primaryBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  linkText: { fontSize: 15, color: '#208AEF', textAlign: 'center', marginTop: Spacing.two },
});
