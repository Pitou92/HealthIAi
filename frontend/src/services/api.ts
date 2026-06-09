import type { Recommendations } from '@/mocks/recommendations';
import { mockRecommendations } from '@/mocks/recommendations';
import { API_BASE_URL, MOCK_RECO_DELAY_MS, MOCK_SUBMIT_DELAY_MS, USE_MOCK } from '@/config/api';
import { getToken } from '@/services/token';
import type { UserProfile } from '@/types/user';

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function bearer(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export async function submitOnboardingData(data: UserProfile): Promise<void> {
  if (USE_MOCK) {
    await delay(MOCK_SUBMIT_DELAY_MS);
    return;
  }
  const res = await fetch(`${API_BASE_URL}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await bearer()) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Onboarding échoué (${res.status})`);
}

// ─── Recommendations ─────────────────────────────────────────────────────────

// Pass profile to use the AI pipeline (POST), omit for a cached GET
export async function fetchRecommendations(profile?: UserProfile): Promise<Recommendations> {
  if (USE_MOCK) {
    await delay(MOCK_RECO_DELAY_MS);
    return mockRecommendations;
  }
  const auth = await bearer();
  const res = profile
    ? await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify(profile),
      })
    : await fetch(`${API_BASE_URL}/recommendations`, { headers: auth });
  if (!res.ok) throw new Error(`Recommandations indisponibles (${res.status})`);
  return res.json() as Promise<Recommendations>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await delay(400);
    return { token: 'mock-token-123' };
  }
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Email ou mot de passe incorrect.');
  return res.json();
}

export async function register(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await delay(400);
    return { token: 'mock-token-123' };
  }
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Création de compte échouée.');
  return res.json();
}
