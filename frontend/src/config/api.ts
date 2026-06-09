// Set EXPO_PUBLIC_USE_MOCK=false in .env to hit the real backend
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:8000';

export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

// submitOnboardingData: 600ms, fetchRecommendations: 2200ms → total ~2.8s
export const MOCK_SUBMIT_DELAY_MS = 600;
export const MOCK_RECO_DELAY_MS = 2200;
