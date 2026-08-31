import { firebaseAuthClient } from '../firebase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiRequestError extends Error {
  status?: number;
  requestId?: string;
  details?: unknown;

  constructor(message: string, options: { status?: number; requestId?: string; details?: unknown } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = options.status;
    this.requestId = options.requestId;
    this.details = options.details;
  }
}

export async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  let token = localStorage.getItem('claymarket_auth_token');
  if (firebaseAuthClient?.currentUser) {
    try {
      token = await firebaseAuthClient.currentUser.getIdToken();
      if (token) localStorage.setItem('claymarket_auth_token', token);
    } catch {
      // Fall back to the cached token; the backend will reject it if expired.
    }
  }
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new ApiRequestError(
      payload?.message || `Request failed (${response.status})`,
      {
        status: response.status,
        requestId: payload?.requestId || response.headers.get('X-Request-Id') || undefined,
        details: payload?.details,
      },
    );
  }
  return (payload?.data ?? payload) as T;
}

export const setAuthToken = (token: string) => localStorage.setItem('claymarket_auth_token', token);
export const clearAuthToken = () => localStorage.removeItem('claymarket_auth_token');
