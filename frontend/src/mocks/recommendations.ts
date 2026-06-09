import { mockNutrition } from './nutrition';
import { mockSport } from './sport';

export const mockRecommendations = {
  calories: { target: 2200, consumed: 1450 },
  macros: { proteins: 165, carbs: 220, fats: 73 },
  activityScore: 72,
  hydration: { targetMl: 2000, consumedMl: 1200 },
  sleep: { targetHours: 8, actualHours: 6.5 },
  weeklyPlan: mockSport.weeklyPlan.map(({ day, type, duration }) => ({ day, type, duration })),
  nutrition: mockNutrition,
  sport: mockSport,
};

export type Recommendations = typeof mockRecommendations;

export const mockUserProfile = {
  age: 28,
  height: 175,
  weight: 75,
  sex: 'male' as const,
  goal: 'fitness' as const,
  activityFrequency: 3,
  activityType: 'mixed' as const,
  activityLevel: 'moderate' as const,
};
