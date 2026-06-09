import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DF, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient orbs */}
      <View style={[styles.orb, styles.orbMint]} />
      <View style={[styles.orb, styles.orbViolet]} />
      <View style={[styles.orb, styles.orbGreen]} />

      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoChar}>H</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleWhite}>Health</Text>
          <Text style={styles.titleMint}>IAi</Text>
        </View>

        <Text style={styles.subtitle}>
          Votre santé, guidée par{'\n'}l'intelligence artificielle
        </Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>Nutrition · Sport · IA personnalisée</Text>
        </View>
      </View>

      <View style={styles.actions}>
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
    backgroundColor: DF.bg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    overflow: 'hidden',
  },

  // Ambient blobs
  orb: { position: 'absolute', borderRadius: 999 },
  orbMint: {
    width: 260, height: 260,
    top: -80, left: -80,
    backgroundColor: DF.orb1,
  },
  orbViolet: {
    width: 180, height: 180,
    top: 80, right: -50,
    backgroundColor: DF.orb2,
  },
  orbGreen: {
    width: 140, height: 140,
    bottom: 160, left: 20,
    backgroundColor: DF.orb3,
  },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },

  logoWrap: { marginBottom: Spacing.two },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DF.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  logoChar: {
    fontSize: 44,
    fontWeight: '800',
    color: DF.mint,
  },

  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  titleWhite: {
    fontSize: 44,
    fontWeight: '800',
    color: DF.text,
    letterSpacing: -1,
  },
  titleMint: {
    fontSize: 44,
    fontWeight: '800',
    color: DF.mint,
    letterSpacing: -1,
    opacity: 0.7,
  },

  subtitle: {
    fontSize: 16,
    color: DF.textDim,
    textAlign: 'center',
    lineHeight: 26,
  },

  pill: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.borderDim,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: DF.textMuted,
    letterSpacing: 0.5,
  },

  actions: { gap: Spacing.two },

  primaryBtn: {
    backgroundColor: 'rgba(0, 255, 214, 0.14)',
    borderWidth: 1,
    borderColor: DF.border,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: DF.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: DF.mint },

  ghostBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DF.borderDim,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  ghostBtnText: { fontSize: 17, fontWeight: '600', color: DF.textDim },
});
