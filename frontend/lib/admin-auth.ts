import { apiBaseUrl } from './api';
import { parseApiError } from './api-error';

const ADMIN_TOKEN_KEY = 'pakvoyage.adminToken';

export interface AdminLoginResponse {
  token: string;
  expires_at: string;
  admin: {
    username: string;
  };
}

export function getAdminToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY) ?? '';
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  const response = await fetch(`${apiBaseUrl}/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as AdminLoginResponse;
}

export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();

  const headers = new Headers(init?.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}

export async function getAdminProfile(): Promise<{ username: string }> {
  const response = await adminFetch(`${apiBaseUrl}/admin/auth/me`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as { username: string };
}
