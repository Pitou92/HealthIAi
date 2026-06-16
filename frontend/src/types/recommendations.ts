export interface Recommendations {
  calories: {
    target: number;
    consumed: number;
  };
  macros: {
    proteins: number;
    carbs: number;
    fats: number;
  };
  activityScore: number;
  hydration: {
    targetMl: number;
    consumedMl: number;
  };
  sleep: {
    targetHours: number;
    actualHours: number;
  };
  weeklyPlan: Array<{
    day: string;
    type: string;
    duration: number;
  }>;
  nutrition: {
    meals: Array<{
      id: string;
      name: string;
      time: string;
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
      items: string[];
    }>;
    tips: string[];
  };
  sport: {
    weeklyPlan: Array<{
      day: string;
      type: string;
      duration: number;
      intensity: string;
      exercises: string[];
    }>;
    tips: string[];
  };
}
