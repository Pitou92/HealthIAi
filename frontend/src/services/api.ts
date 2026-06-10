import type { Recommendations } from '@/mocks/recommendations';
import { mockRecommendations } from '@/mocks/recommendations';
import { API_BASE_URL, MOCK_RECO_DELAY_MS, MOCK_SUBMIT_DELAY_MS, USE_MOCK } from '@/config/api';
import { getToken } from '@/services/token';
import type { UserProfile } from '@/types/user';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function bearer(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Backend type mirror (matches backend/models/domain.py) ───────────────────

interface BackendPlan {
  type: string;
  user_context: {
    goal: string;
    fitness_level: string;
    activity_level: string;
    constraints: Record<string, unknown>;
  };
  plan: {
    duration_weeks: number;
    weekly_schedule: Array<{
      day: string;
      focus: string;
      duration_min: number;
      exercises: Array<{ name: string; sets: number; reps: string; rest_sec: number }>;
    }>;
  };
  nutrition: {
    daily_calories: number;
    macros: { protein_g: number; carbs_g: number; fat_g: number };
    meals: Array<{ name: string; foods: string[] }>;
  };
  recommendation_logic: { goal_alignment: string; constraints_applied: string[] };
  metadata: { model: string; prompt_version: string; generated_at: string };
}

// ─── Request mapper: frontend UserProfile → backend UserProfile ───────────────

function toBackendProfile(p: UserProfile) {
  const goalMap: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    fitness: 'General Fitness',
  };
  const sexMap: Record<string, string> = {
    male: 'Male', female: 'Female', other: 'Other',
  };
  const fitnessMap: Record<string, string> = {
    sedentary: 'Beginner', light: 'Intermediate', moderate: 'Advanced', intense: 'Expert',
  };
  const activityMap: Record<string, string> = {
    sedentary: 'Sedentary',
    light: 'Lightly Active',
    moderate: 'Moderately Active',
    intense: 'Very Active',
  };
  const durationMap: Record<string, number> = {
    sedentary: 30, light: 45, moderate: 60, intense: 75,
  };
  const equipmentMap: Record<string, string[]> = {
    cardio: ['Treadmill', 'Stationary bike'],
    strength: ['Dumbbells', 'Barbell', 'Weight machines'],
    mixed: ['Dumbbells', 'Treadmill'],
    yoga: ['Yoga mat'],
    none: [],
  };

  return {
    goal: goalMap[p.goal] ?? 'General Fitness',
    age: p.age,
    sex: sexMap[p.sex] ?? 'Other',
    height_cm: p.height,
    weight_kg: Math.round(p.weight),
    fitness_level: fitnessMap[p.activityLevel] ?? 'Intermediate',
    workouts_per_week: p.activityFrequency,
    session_duration_min: durationMap[p.activityLevel] ?? 45,
    equipment: equipmentMap[p.activityType] ?? [],
    diet: 'Balanced',
    injuries: [],
    daily_activity: activityMap[p.activityLevel] ?? 'Moderately Active',
  };
}

// ─── Response mapper: BackendPlan → frontend Recommendations ──────────────────

const MEAL_TIMES = ['07:30', '12:30', '16:00', '19:30', '21:00'];
const FITNESS_TO_SCORE: Record<string, number> = {
  Beginner: 35, Intermediate: 58, Advanced: 75, Expert: 90,
};

function fromBackendPlan(bp: BackendPlan, profile: UserProfile): Recommendations {
  const totalCal = bp.nutrition.daily_calories;
  const mealCount = bp.nutrition.meals.length || 4;
  const perMeal = 1 / mealCount;

  const nutritionMeals = bp.nutrition.meals.map((m, i) => ({
    id: String(i + 1),
    name: m.name,
    time: MEAL_TIMES[i] ?? `${7 + i * 3}:00`,
    calories: Math.round(totalCal * perMeal),
    proteins: Math.round(bp.nutrition.macros.protein_g * perMeal),
    carbs: Math.round(bp.nutrition.macros.carbs_g * perMeal),
    fats: Math.round(bp.nutrition.macros.fat_g * perMeal),
    items: m.foods,
  }));

  const sportWeeklyPlan = bp.plan.weekly_schedule.map(d => ({
    day: d.day,
    type: d.focus,
    duration: d.duration_min,
    intensity: d.duration_min >= 60 ? 'Élevée' : d.duration_min >= 45 ? 'Modérée' : 'Légère',
    exercises: d.exercises.map(e => `${e.name} ${e.sets}×${e.reps}`),
  }));

  // Hydration target: 35 ml per kg body weight, rounded to nearest 100 ml
  const hydrationTarget = Math.round((profile.weight * 35) / 100) * 100;

  return {
    calories: { target: totalCal, consumed: 0 },
    macros: {
      proteins: bp.nutrition.macros.protein_g,
      carbs: bp.nutrition.macros.carbs_g,
      fats: bp.nutrition.macros.fat_g,
    },
    activityScore: FITNESS_TO_SCORE[bp.user_context.fitness_level] ?? 65,
    hydration: { targetMl: hydrationTarget, consumedMl: 0 },
    sleep: { targetHours: 8, actualHours: 0 },
    weeklyPlan: bp.plan.weekly_schedule.map(d => ({
      day: d.day,
      type: d.focus,
      duration: d.duration_min,
    })),
    nutrition: {
      meals: nutritionMeals,
      tips: bp.recommendation_logic.constraints_applied.slice(0, 4),
    },
    sport: {
      weeklyPlan: sportWeeklyPlan,
      tips: [],
    },
  };
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function submitOnboardingData(data: UserProfile): Promise<void> {
  if (USE_MOCK) {
    await delay(MOCK_SUBMIT_DELAY_MS);
    return;
  }
  // Real API: onboarding is bundled with the AI plan generation (no separate endpoint)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function fetchRecommendations(profile?: UserProfile): Promise<Recommendations> {
  // Falls back to mock if no profile (e.g. dashboard opened directly after app restart)
  if (USE_MOCK || !profile) {
    await delay(MOCK_RECO_DELAY_MS);
    return mockRecommendations;
  }
  const auth = await bearer();
  const res = await fetch(`${API_BASE_URL}/ai/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(toBackendProfile(profile)),
  });
  if (!res.ok) throw new Error(`Recommandations indisponibles (${res.status})`);
  const bp: BackendPlan = await res.json();
  return fromBackendPlan(bp, profile);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// Auth endpoints not yet implemented in backend — always mock
export async function login(_email: string, _password: string): Promise<{ token: string }> {
  await delay(400);
  return { token: 'mock-token-123' };
}

export async function register(_email: string, _password: string): Promise<{ token: string }> {
  await delay(400);
  return { token: 'mock-token-123' };
}
