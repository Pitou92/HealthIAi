import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  const envUrl = (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:8000';
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    try {
      const parsedUrl = new URL(envUrl);
      const backendPort = parsedUrl.port || '8000';
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}:${backendPort}`;
    } catch {
      return `http://${window.location.hostname}:8000`;
    }
  }
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export const USE_MOCK = false; // Mock mode is disabled

// submitOnboardingData: 600ms, fetchRecommendations: 2200ms → total ~2.8s
export const MOCK_SUBMIT_DELAY_MS = 600;
export const MOCK_RECO_DELAY_MS = 2200;
