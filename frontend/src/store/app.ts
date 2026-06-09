import { create } from 'zustand';

import { getRecommendations } from '@/services/api';
import type { Recommendations } from '@/mocks/recommendations';

interface AppStore {
  loading: boolean;
  error: string | null;
  success: boolean;
  recommendations: Recommendations | null;
  fetchRecommendations: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  loading: false,
  error: null,
  success: false,
  recommendations: null,

  fetchRecommendations: async () => {
    set({ loading: true, error: null, success: false });
    try {
      const data = await getRecommendations();
      set({ recommendations: data, success: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur inconnue' });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ loading: false, error: null, success: false, recommendations: null }),
}));
