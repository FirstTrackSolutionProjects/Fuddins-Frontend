import { API_ORIGIN } from './config';
import type { User } from './types';

export interface AuthResponse {
  token: string;
  user: User;
}

export async function registerUser(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_ORIGIN}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_ORIGIN}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}
