import type { UserProfile } from '@/types/user';
import { mockRecommendations } from '@/mocks/recommendations';

const BASE_URL = 'http://localhost:8000';
const USE_MOCK = true;

export async function postOnboarding(data: UserProfile): Promise<void> {
  if (USE_MOCK) return;
  const res = await fetch(`${BASE_URL}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Onboarding failed');
}

export async function getRecommendations(): Promise<typeof mockRecommendations> {
  if (USE_MOCK) return mockRecommendations;
  const res = await fetch(`${BASE_URL}/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) return { token: 'mock-token-123' };
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(email: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) return { token: 'mock-token-123' };
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
}
