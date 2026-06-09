import { create } from 'zustand';

import type { Recommendations } from '@/mocks/recommendations';
import { fetchRecommendations, submitOnboardingData } from '@/services/api';
import type { UserProfile } from '@/types/user';

interface AppStore {
  loading: boolean;
  error: string | null;
  success: boolean;
  recommendations: Recommendations | null;
  // Full onboarding pipeline: submit profile → fetch AI recommendations
  submitAndFetch: (profile: UserProfile) => Promise<void>;
  // Standalone fetch for direct dashboard access (no onboarding profile)
  loadRecommendations: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  loading: false,
  error: null,
  success: false,
  recommendations: null,

  submitAndFetch: async (profile: UserProfile) => {
    set({ loading: true, error: null, success: false });
    try {
      await submitOnboardingData(profile);
      const data = await fetchRecommendations(profile);
      set({ recommendations: data, success: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Une erreur est survenue.' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  loadRecommendations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchRecommendations();
      set({ recommendations: data, success: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Une erreur est survenue.' });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ loading: false, error: null, success: false, recommendations: null }),
}));
