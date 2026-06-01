// API_INTERNAL_URL is a server-only runtime env (no NEXT_PUBLIC_ prefix), so
// Next.js never exposes it to the browser bundle. Server-side it resolves to
// the internal Docker hostname (http://api:4000); browser falls back to the
// NEXT_PUBLIC value baked at build time.
const API_URL = process.env.API_INTERNAL_URL
  ?? process.env.NEXT_PUBLIC_API_URL
  ?? 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() { return this.status === 401; }
  get isNotFound()     { return this.status === 404; }
  get isConflict()     { return this.status === 409; }
  get isValidation()   { return this.status === 400; }
  get isServer()       { return this.status >= 500; }
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  const body = await res.json().catch(() => ({
    message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.',
  }));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.message ?? `HTTP ${res.status}`,
      body.errors,
    );
  }

  return body as ApiResponse<T>;
}

export const api = {
  get: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { token }),

  post: <T>(path: string, data: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(data), token }),

  patch: <T>(path: string, data: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(data), token }),

  put: <T>(path: string, data: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(data), token }),

  delete: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: 'DELETE', token }),
};

export type { ApiResponse };
