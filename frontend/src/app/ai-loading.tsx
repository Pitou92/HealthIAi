import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AILoader } from '@/components/ai-loader';
import { SP, Spacing } from '@/constants/theme';
import { Routes } from '@/navigation/routes';
import { useAppStore } from '@/store/app';
import { useOnboardingStore } from '@/store/onboarding';
import type { UserProfile } from '@/types/user';

export default function AILoadingScreen() {
  const router = useRouter();
  const { data: onboardingData, reset: resetOnboarding } = useOnboardingStore();
  const { loading, error, success, submitAndFetch, clearError } = useAppStore();

  useEffect(() => {
    // Only trigger if we have data and not already loading/success/error
    if (onboardingData.age && !loading && !success && !error) {
      const profile: UserProfile = {
        age: onboardingData.age,
        height: onboardingData.height!,
        weight: onboardingData.weight!,
        sex: onboardingData.sex!,
        goal: onboardingData.goal!,
        activityFrequency: onboardingData.activityFrequency!,
        activityType: onboardingData.activityType!,
        activityLevel: onboardingData.activityLevel!,
      };

      submitAndFetch(profile).catch(() => {
        // Error is handled in the store
      });
    }
  }, [onboardingData, loading, success, error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        resetOnboarding();
        router.replace(Routes.Dashboard);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleBack = () => {
    clearError();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(Routes.Dashboard);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, animation: 'fade' }} />
      
      {!error ? (
        <AILoader visible={true} />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Oups ! Une erreur est survenue</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>Retourner en arrière</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  errorEmoji: { fontSize: 48, marginBottom: 10 },
  errorTitle: { fontSize: 24, fontWeight: '800', color: '#000', textAlign: 'center' },
  errorText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 20 },
  backBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
});
