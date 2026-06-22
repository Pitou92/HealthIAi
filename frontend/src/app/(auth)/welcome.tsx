import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoChar}>H</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.titleBlue}>Health</Text>
          <Text style={styles.titleDark}>IAi</Text>
        </View>

        <Text style={styles.subtitle}>
          {"Votre santé, guidée par\nl'intelligence artificielle"}
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
          <Text style={styles.ghostBtnText}>{"J'ai déjà un compte"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: Spacing.two,
  },
  logoChar: { fontSize: 52, fontWeight: '800', color: '#fff' },

  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  titleBlue: { fontSize: 46, fontWeight: '800', color: '#007AFF', letterSpacing: -1 },
  titleDark: { fontSize: 46, fontWeight: '800', color: '#000', letterSpacing: -1 },

  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
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
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  pillDot: { fontSize: 8, color: '#007AFF' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },

  bottomCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },

  primaryBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  ghostBtn: {
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  ghostBtnText: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
});
