import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Recommendations } from '@/types/recommendations';
import { 
  fetchRecommendations, 
  submitOnboardingData, 
  fetchTodayProgress, 
  logHydration, 
  logWeight, 
  analyzeMeal, 
  saveNutritionLog,
  fetchNutritionLogs,
  fetchStreak,
  fetchNutritionHistory,
  fetchWeightHistory,
  fetchProfile,
  updateProfile,
  adjustPlan,
  getFavoriteMeals,
  type DailyProgress,
  type NutritionLog,
  type StreakInfo,
  type NutritionHistoryEntry,
  type WeightHistoryEntry,
  type SavedMeal
} from '@/services/api';
import type { UserProfile } from '@/types/user';

interface AppStore {
  loading: boolean;
  error: string | null;
  success: boolean;
  recommendations: Recommendations | null;
  dailyProgress: DailyProgress | null;
  nutritionLogs: NutritionLog[];
  streak: StreakInfo | null;
  nutritionHistory: NutritionHistoryEntry[];
  weightHistory: WeightHistoryEntry[];
  userProfile: any | null;
  favoriteMeals: SavedMeal[];
  userId: number | null;
  // Actions
  submitAndFetch: (profile: UserProfile) => Promise<void>;
  loadRecommendations: () => Promise<void>;
  fetchProgress: (userId: number) => Promise<void>;
  addWater: (amount: number) => Promise<void>;
  updateWeight: (weight: number) => Promise<void>;
  scanMeal: (imageUri: string) => Promise<any>;
  confirmMeal: (analysis: any) => Promise<void>;
  updateUserProfileAndAdjustPlan: (profile: UserProfile) => Promise<void>;
  fetchHistoryAndProfile: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      loading: false,
      error: null,
      success: false,
      recommendations: null,
      dailyProgress: null,
      nutritionLogs: [],
      streak: null,
      nutritionHistory: [],
      weightHistory: [],
      userProfile: null,
      favoriteMeals: [],
      userId: null,

      submitAndFetch: async (profile: UserProfile) => {
        set({ loading: true, error: null, success: false });
        try {
          const userId = await submitOnboardingData(profile);
          const data = await fetchRecommendations(profile, userId);
          const progress = await fetchTodayProgress(userId);
          const logs = await fetchNutritionLogs(userId);
          set({ userId, recommendations: data, dailyProgress: progress, nutritionLogs: logs, success: true });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Une erreur est survenue.' });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      loadRecommendations: async () => {
        const { userId } = get();
        const actualUserId = userId || 1; 
        set({ loading: true, error: null });
        try {
          const data = await fetchRecommendations(undefined, actualUserId);
          const progress = await fetchTodayProgress(actualUserId);
          const logs = await fetchNutritionLogs(actualUserId);
          const streak = await fetchStreak(actualUserId);
          const profile = await fetchProfile(actualUserId).catch(() => null);
          set({ userId: actualUserId, recommendations: data, dailyProgress: progress, nutritionLogs: logs, streak, userProfile: profile, success: true });
          // Fetch the rest asynchronously
          get().fetchHistoryAndProfile();
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Une erreur est survenue.';
          // If the error is NO_PLAN or NO_PROFILE, it means we need to do onboarding
          if (msg === 'NO_PLAN' || msg === 'NO_PROFILE') {
            set({ error: 'NO_PROFILE', recommendations: null });
          } else {
            set({ error: msg });
          }
        } finally {
          set({ loading: false });
        }
      },

      fetchProgress: async (userId: number) => {
        try {
          const progress = await fetchTodayProgress(userId);
          const logs = await fetchNutritionLogs(userId);
          set({ dailyProgress: progress, nutritionLogs: logs });
        } catch (e) {
          console.error('Failed to fetch progress:', e);
        }
      },

      fetchHistoryAndProfile: async () => {
        const { userId } = get();
        if (!userId) return;
        try {
          const nutritionHistory = await fetchNutritionHistory(userId);
          const weightHistory = await fetchWeightHistory(userId);
          const favoriteMeals = await getFavoriteMeals(userId);
          set({ nutritionHistory, weightHistory, favoriteMeals });
        } catch (e) {
          console.error('Failed to fetch history:', e);
        }
      },

      addWater: async (amount: number) => {
        const { userId, dailyProgress } = get();
        if (!userId || !dailyProgress) return;
        set({ dailyProgress: { ...dailyProgress, water_consumed_ml: dailyProgress.water_consumed_ml + amount } });
        try {
          await logHydration(userId, amount);
        } catch (e) {
          set({ dailyProgress });
        }
      },

      updateWeight: async (weight: number) => {
        const { userId, dailyProgress } = get();
        if (!userId || !dailyProgress) return;
        set({ dailyProgress: { ...dailyProgress, current_weight_kg: weight } });
        try {
          await logWeight(userId, weight);
        } catch (e) {
          set({ dailyProgress });
        }
      },

      scanMeal: async (imageUri: string) => {
        const { userId } = get();
        if (!userId) throw new Error("User not found");
        return await analyzeMeal(userId, imageUri);
      },

      confirmMeal: async (analysis: any) => {
        const { userId } = get();
        if (!userId) return;
        
        set({ loading: true });
        try {
          const mealLog = {
            user_id: userId,
            name: "Repas analysé",
            calories: Math.round(analysis.total_calories),
            protein_g: analysis.total_protein,
            carbs_g: analysis.total_carbs,
            fat_g: analysis.total_fat,
            items: analysis.detected_foods.map((f: any) => f.name)
          };
          
          await saveNutritionLog(mealLog);
          
          // Refresh all data
          const progress = await fetchTodayProgress(userId);
          const logs = await fetchNutritionLogs(userId);
          set({ dailyProgress: progress, nutritionLogs: logs });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Erreur lors de l'enregistrement" });
        } finally {
          set({ loading: false });
        }
      },

      updateUserProfileAndAdjustPlan: async (profile: UserProfile) => {
        const { userId } = get();
        if (!userId) return;
        set({ loading: true, error: null });
        try {
          await updateProfile(userId, profile);
          const data = await adjustPlan(userId, profile);
          set({ recommendations: data, userProfile: profile });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Erreur lors de la mise à jour" });
        } finally {
          set({ loading: false });
        }
      },

      clearError: () => set({ error: null }),
      reset: () => set({ loading: false, error: null, success: false, recommendations: null, dailyProgress: null, nutritionLogs: [], streak: null, nutritionHistory: [], weightHistory: [], userProfile: null, favoriteMeals: [], userId: null }),
    }),
    {
      name: 'healthai-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        userId: state.userId, 
        recommendations: state.recommendations,
        dailyProgress: state.dailyProgress,
        nutritionLogs: state.nutritionLogs,
        streak: state.streak,
        userProfile: state.userProfile
      }),
    }
  )
);

