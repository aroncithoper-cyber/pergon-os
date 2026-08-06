"use client";

import { messageForHttpStatus, sanitizeOperatorMessage } from "@pergon/shared/i18n";

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

function notifySessionExpired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pergon:session-expired"));
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

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
      cache: "no-store",
    });
  } catch {
    throw Object.assign(new Error("Verifica tu conexi\u00f3n."), {
      code: "NETWORK_ERROR",
      status: 0,
    });
  }

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: ApiError;
  };

  if (!response.ok) {
    const code = payload.error?.code ?? "HTTP_ERROR";
    const message = sanitizeOperatorMessage(payload.error?.message, {
      code,
      status: response.status,
    });

    if (
      response.status === 401 ||
      code === "SESSION_NOT_FOUND" ||
      code === "UNAUTHORIZED" ||
      code === "INVALID_CREDENTIALS"
    ) {
      clearSession();
      notifySessionExpired();
    }

    throw Object.assign(new Error(message || messageForHttpStatus(response.status)), {
      code,
      status: response.status,
    });
  }

  return payload.data as T;
}
