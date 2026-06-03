export type Sex = 'male' | 'female' | 'other';
export type Goal = 'weight_loss' | 'muscle_gain' | 'fitness';
export type ActivityType = 'cardio' | 'strength' | 'mixed' | 'yoga' | 'none';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense';

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  sex: Sex;
  goal: Goal;
  activityFrequency: number;
  activityType: ActivityType;
  activityLevel: ActivityLevel;
}

export interface AuthUser {
  id: string;
  email: string;
  token: string;
}
