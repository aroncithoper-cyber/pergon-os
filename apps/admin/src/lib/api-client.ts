"use client";

const ACCESS_TOKEN_KEY = "pergon.admin.accessToken";
const REFRESH_TOKEN_KEY = "pergon.admin.refreshToken";
const CONTEXT_KEY = "pergon.admin.context";

export type AdminAuthContext = {
  userId: string;
  organizationId: string;
  sessionId: string;
  roleKeys: string[];
  permissions: string[];
  mfaVerified: boolean;
};

export type ApiError = {
  code: string;
  message: string;
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredContext(): AdminAuthContext | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminAuthContext;
  } catch {
    return null;
  }
}

export function persistSession(input: {
  accessToken: string;
  refreshToken?: string;
  context: AdminAuthContext;
}) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, input.accessToken);
  if (input.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, input.refreshToken);
  }
  window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(input.context));
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CONTEXT_KEY);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: ApiError;
  };

  if (!response.ok) {
    throw Object.assign(new Error(payload.error?.message ?? "Request failed"), {
      code: payload.error?.code ?? "HTTP_ERROR",
      status: response.status,
    });
  }

  return payload.data as T;
}
