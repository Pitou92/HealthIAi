import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '@/components/animated-background';
import { Routes } from '@/navigation/routes';
import { register } from '@/services/api';
import { saveToken } from '@/services/token';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <AnimatedBackground intensity="soft" />

      <TouchableOpacity 
        className="py-6" 
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(Routes.Welcome);
          }
        }}
      >
        <Text className="text-primary font-semibold text-base">← Retour</Text>
      </TouchableOpacity>

      <View className="flex-1 justify-center gap-8 -mt-20">
        <View className="gap-2">
          <Text variant="muted">Bienvenue !</Text>
          <Text variant="h1">Créer un compte</Text>
        </View>

        <Card className="gap-4">
          <Input 
            placeholder="Email" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={(v) => { setEmail(v); setError(null); }} 
          />
          <Input 
            placeholder="Mot de passe (min. 6 caractères)" 
            secureTextEntry 
            value={password} 
            onChangeText={(v) => { setPassword(v); setError(null); }} 
          />

          {error && <Text className="text-destructive text-sm text-center">{error}</Text>}

          <Button className="mt-2" disabled={loading} onPress={handleRegister}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-primary-foreground font-semibold text-base">Créer mon compte</Text>}
          </Button>

          <Button 
            variant="link" 
            label="Déjà un compte ? Se connecter" 
            onPress={() => router.push(Routes.Login)} 
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
