import { create } from 'zustand';

import type { ActivityLevel, ActivityType, Goal, Sex } from '@/types/user';

export interface OnboardingData {
  age: number | null;
  height: number | null;
  weight: number | null;
  sex: Sex | null;
  goal: Goal | null;
  activityFrequency: number | null;
  activityType: ActivityType | null;
  activityLevel: ActivityLevel | null;
}

interface OnboardingStore {
  data: OnboardingData;
  setStep1: (fields: Pick<OnboardingData, 'age' | 'height' | 'weight' | 'sex'>) => void;
  setStep2: (fields: Pick<OnboardingData, 'goal'>) => void;
  setStep3: (fields: Pick<OnboardingData, 'activityFrequency' | 'activityType' | 'activityLevel'>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  age: null,
  height: null,
  weight: null,
  sex: null,
  goal: null,
  activityFrequency: null,
  activityType: null,
  activityLevel: null,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: initialData,
  setStep1: (fields) => set((s) => ({ data: { ...s.data, ...fields } })),
  setStep2: (fields) => set((s) => ({ data: { ...s.data, ...fields } })),
  setStep3: (fields) => set((s) => ({ data: { ...s.data, ...fields } })),
  reset: () => set({ data: initialData }),
}));
