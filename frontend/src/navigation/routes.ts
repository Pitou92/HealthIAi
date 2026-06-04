export const Routes = {
  Welcome: '/(auth)/welcome',
  Login: '/(auth)/login',
  Register: '/(auth)/register',
  OnboardingStep1: '/(onboarding)/step1',
  OnboardingStep2: '/(onboarding)/step2',
  OnboardingStep3: '/(onboarding)/step3',
  Dashboard: '/(tabs)/',
  Explore: '/(tabs)/explore',
} as const;

export type AppRoute = (typeof Routes)[keyof typeof Routes];
