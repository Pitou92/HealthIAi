import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/animated-background';
import { OW, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />

      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoChar}>H</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleOrange}>Health</Text>
          <Text style={styles.titleDark}>IAi</Text>
        </View>

        <Text style={styles.subtitle}>
          Votre santé, guidée par{'\n'}l'intelligence artificielle
        </Text>

        <View style={styles.pill}>
          <Text style={styles.pillDot}>●</Text>
          <Text style={styles.pillText}>Nutrition · Sport · IA personnalisée</Text>
        </View>
      </View>

      <View style={styles.bottomCard}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push(Routes.Register)}>
          <Text style={styles.primaryBtnText}>Commencer gratuitement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => router.push(Routes.Login)}>
          <Text style={styles.ghostBtnText}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OW.bg,
  },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: OW.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: OW.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: Spacing.two,
  },
  logoChar: { fontSize: 52, fontWeight: '800', color: '#fff' },

  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  titleOrange: { fontSize: 46, fontWeight: '800', color: OW.orange, letterSpacing: -1 },
  titleDark: { fontSize: 46, fontWeight: '800', color: OW.text, letterSpacing: -1 },

  subtitle: {
    fontSize: 16,
    color: OW.textDim,
    textAlign: 'center',
    lineHeight: 26,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderWidth: 1,
    borderColor: OW.border,
  },
  pillDot: { fontSize: 8, color: OW.orange },
  pillText: { fontSize: 12, fontWeight: '600', color: OW.textDim },

  bottomCard: {
    backgroundColor: OW.bgCard,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
  },

  primaryBtn: {
    backgroundColor: OW.orange,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: OW.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  ghostBtn: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: OW.border,
  },
  ghostBtnText: { fontSize: 17, fontWeight: '600', color: OW.orange },
});
