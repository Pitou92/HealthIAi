export const mockRecommendations = {
  calories: { target: 2200, consumed: 1450 },
  macros: { proteins: 165, carbs: 220, fats: 73 },
  activityScore: 72,
  weeklyPlan: [
    { day: 'Lundi', type: 'Cardio', duration: 45 },
    { day: 'Mercredi', type: 'Musculation', duration: 60 },
    { day: 'Vendredi', type: 'Yoga', duration: 30 },
  ],
};

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
