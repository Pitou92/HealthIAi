export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatCalories(kcal: number): string {
  return `${kcal} kcal`;
}

export function formatWeight(kg: number): string {
  return `${kg} kg`;
}

export function formatHeight(cm: number): string {
  return `${cm} cm`;
}
