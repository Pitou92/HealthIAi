import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recommendations } from '@/types/recommendations';
import { mockRecommendations } from '@/mocks/recommendations';
import { API_BASE_URL, MOCK_RECO_DELAY_MS, MOCK_SUBMIT_DELAY_MS, USE_MOCK } from '@/config/api';
import { getToken } from '@/services/token';
import type { UserProfile } from '@/types/user';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  NUTRITION_LOGS: 'healthai_nutrition_logs',
  WATER_CONSUMED: 'healthai_water_consumed',
};

async function saveToStorage(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

async function loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

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
    hydration_target_ml: number;
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
const DAY_FR: Record<string, string> = {
  Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi',
  Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche',
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
    day: DAY_FR[d.day] ?? d.day,
    type: d.focus,
    duration: d.duration_min,
    intensity: d.duration_min >= 60 ? 'Élevée' : d.duration_min >= 45 ? 'Modérée' : 'Légère',
    exercises: d.exercises.map(e => `${e.name} ${e.sets}×${e.reps}`),
  }));

  const hydrationTarget = bp.nutrition.hydration_target_ml || Math.round((profile.weight * 35) / 100) * 100;

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
      day: DAY_FR[d.day] ?? d.day,
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

// ─── Tracking types ──────────────────────────────────────────────────────────

export interface DailyProgress {
  user_id: number;
  date: string;
  calories_consumed: number;
  calories_target: number;
  protein_consumed: number;
  protein_target: number;
  carbs_consumed: number;
  carbs_target: number;
  fat_consumed: number;
  fat_target: number;
  water_consumed_ml: number;
  water_target_ml: number;
  current_weight_kg: number | null;
  workout_completed: boolean;
  workout_name: string | null;
}

export interface NutritionLog {
  user_id: number;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  timestamp: string;
  items: string[];
}

// ─── Mock State ──────────────────────────────────────────────────────────────

let mockNutritionLogs: NutritionLog[] = [];
let mockWaterConsumed = 0;
let mockStateInitialized = false;

async function initMockState() {
  if (mockStateInitialized) return;
  mockNutritionLogs = await loadFromStorage<NutritionLog[]>(STORAGE_KEYS.NUTRITION_LOGS, [
    { user_id: 1, name: "Petit Déjeuner", calories: 350, protein_g: 15, carbs_g: 45, fat_g: 8, timestamp: new Date().toISOString(), items: ["Flocons d'avoine", "Banane"] }
  ]);
  mockWaterConsumed = await loadFromStorage<number>(STORAGE_KEYS.WATER_CONSUMED, 1200);
  mockStateInitialized = true;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function submitOnboardingData(data: UserProfile): Promise<number> {
  if (USE_MOCK) {
    await delay(MOCK_SUBMIT_DELAY_MS);
    await initMockState();
    return 1;
  }
  const auth = await bearer();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(toBackendProfile(data)),
    });
    if (!res.ok) return 1;
    const result = await res.json();
    return result.user_id ?? 1;
  } catch {
    return 1;
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function fetchRecommendations(profile?: UserProfile, userId = 1): Promise<Recommendations> {
  if (!profile) {
    if (USE_MOCK) { 
      await delay(MOCK_RECO_DELAY_MS); 
      await initMockState();
      return mockRecommendations; 
    }
    // If no profile and not mock, we should try to fetch the current plan
    return fetchCurrentPlan(userId);
  }
  if (USE_MOCK) {
    await delay(MOCK_RECO_DELAY_MS);
    await initMockState();
    return mockRecommendations;
  }
  const auth = await bearer();
  const res = await fetch(`${API_BASE_URL}/ai/generate-plan?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(toBackendProfile(profile)),
  });
  if (!res.ok) throw new Error(`Recommandations indisponibles (${res.status})`);
  const bp: BackendPlan = await res.json();
  return fromBackendPlan(bp, profile);
}

export async function fetchCurrentPlan(userId: number): Promise<Recommendations> {
  const auth = await bearer();
  const res = await fetch(`${API_BASE_URL}/ai/current-plan?user_id=${userId}`, {
    method: 'GET',
    headers: { ...auth },
  });
  
  if (!res.ok) {
    if (res.status === 404) throw new Error('NO_PLAN');
    throw new Error(`Erreur lors de la récupération du plan (${res.status})`);
  }
  
  const bp: BackendPlan = await res.json();
  // Since we don't have the full profile here, we provide a partial one or use defaults in fromBackendPlan
  return fromBackendPlan(bp, { weight: 70 } as any); 
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await delay(400);
    await initMockState();
    return { token: 'mock-token-123' };
  }
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Identifiants incorrects');
  const data = await res.json();
  return { token: data.access_token };
}

export async function register(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await delay(400);
    await initMockState();
    return { token: 'mock-token-123' };
  }
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Erreur lors de l’inscription");
  }
  const data = await res.json();
  return { token: data.access_token };
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

export async function fetchTodayProgress(userId: number): Promise<DailyProgress> {
  if (USE_MOCK) {
    await delay(300);
    await initMockState();
    const totalCals = mockNutritionLogs.reduce((acc, l) => acc + l.calories, 0);
    const totalProt = mockNutritionLogs.reduce((acc, l) => acc + l.protein_g, 0);
    const totalCarbs = mockNutritionLogs.reduce((acc, l) => acc + l.carbs_g, 0);
    const totalFat = mockNutritionLogs.reduce((acc, l) => acc + l.fat_g, 0);

    return {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      calories_consumed: totalCals,
      calories_target: 2200,
      protein_consumed: totalProt,
      protein_target: 160,
      carbs_consumed: totalCarbs,
      carbs_target: 250,
      fat_consumed: totalFat,
      fat_target: 70,
      water_consumed_ml: mockWaterConsumed,
      water_target_ml: 2500,
      current_weight_kg: 78.5,
      workout_completed: false,
      workout_name: null,
    };
  }
  const auth = await bearer();
  const res = await fetch(`${API_BASE_URL}/progress/today?user_id=${userId}`, {
    method: 'GET',
    headers: { ...auth },
  });
  if (!res.ok) throw new Error('Impossible de charger la progression');
  return res.json();
}

export async function logHydration(userId: number, amountMl: number): Promise<void> {
  if (USE_MOCK) { 
    await delay(200); 
    await initMockState();
    mockWaterConsumed += amountMl;
    await saveToStorage(STORAGE_KEYS.WATER_CONSUMED, mockWaterConsumed);
    return; 
  }
  const auth = await bearer();
  await fetch(`${API_BASE_URL}/progress/log/hydration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ user_id: userId, amount_ml: amountMl }),
  });
}

export async function logWeight(userId: number, weightKg: number): Promise<void> {
  if (USE_MOCK) { await delay(200); return; }
  const auth = await bearer();
  await fetch(`${API_BASE_URL}/progress/log/weight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ user_id: userId, weight_kg: weightKg }),
  });
}

export async function analyzeMeal(userId: number, imageUri: string): Promise<any> {
  if (USE_MOCK) {
    await delay(1500);
    await initMockState();
    return {
      total_calories: 450,
      total_protein: 30,
      total_carbs: 45,
      total_fat: 15,
      analysis_summary: "Un repas équilibré composé de poulet et de riz.",
      detected_foods: [
        { name: "Poulet grillé", estimated_quantity: "150g", calories: 250, protein_g: 25, carbs_g: 0, fat_g: 5 },
        { name: "Riz basmati", estimated_quantity: "150g", calories: 200, protein_g: 5, carbs_g: 45, fat_g: 10 }
      ]
    };
  }
  const auth = await bearer();
  const formData = new FormData();

  if (typeof window !== 'undefined') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('file', blob, 'meal.jpg');
  } else {
    // @ts-ignore
    formData.append('file', {
      uri: imageUri,
      name: 'meal.jpg',
      type: 'image/jpeg',
    });
  }

  const res = await fetch(`${API_BASE_URL}/ai/analyze-meal?user_id=${userId}`, {
    method: 'POST',
    headers: { ...auth },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erreur lors de l'analyse du repas");
  }
  return res.json();
}

export async function saveNutritionLog(log: Omit<NutritionLog, 'timestamp'>): Promise<void> {
  if (USE_MOCK) { 
    await delay(200); 
    await initMockState();
    mockNutritionLogs.unshift({
      ...log,
      timestamp: new Date().toISOString()
    });
    await saveToStorage(STORAGE_KEYS.NUTRITION_LOGS, mockNutritionLogs);
    return; 
  }
  const auth = await bearer();
  await fetch(`${API_BASE_URL}/progress/log/nutrition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(log),
  });
}

export async function fetchNutritionLogs(userId: number): Promise<NutritionLog[]> {
  if (USE_MOCK) {
    await initMockState();
    return mockNutritionLogs;
  }
  const auth = await bearer();
  const res = await fetch(`${API_BASE_URL}/progress/nutrition/logs?user_id=${userId}`, {
    method: 'GET',
    headers: { ...auth },
  });
  if (!res.ok) return [];
  return res.json();
}
