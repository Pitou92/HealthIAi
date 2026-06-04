import type { UserProfile } from '@/types/user';

// Placeholder — Zustand sera installé au Sprint 7
// Pour l'instant, l'état global passe par React Context

export interface AppState {
  isAuthenticated: boolean;
  onboardingDone: boolean;
  userProfile: Partial<UserProfile>;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AppState = {
  isAuthenticated: false,
  onboardingDone: false,
  userProfile: {},
  isLoading: false,
  error: null,
};
