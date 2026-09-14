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

async function authRequest(path: string, payload: Record<string, string>): Promise<AuthResponse | { message: string }> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Authentication request failed');
  return result;
}

export async function requestEmailOtp(email: string): Promise<{ message: string }> {
  return authRequest('/auth/email-otp/request', { email }) as Promise<{ message: string }>;
}

export async function verifyEmailOtp(email: string, code: string): Promise<AuthResponse> {
  return authRequest('/auth/email-otp/verify', { email, code }) as Promise<AuthResponse>;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return authRequest('/auth/password-reset/request', { email }) as Promise<{ message: string }>;
}

export async function confirmPasswordReset(email: string, code: string, password: string): Promise<AuthResponse> {
  return authRequest('/auth/password-reset/confirm', { email, code, password }) as Promise<AuthResponse>;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return authRequest('/auth/google', { idToken }) as Promise<AuthResponse>;
}
