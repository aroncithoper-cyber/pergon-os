"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  apiFetch,
  clearSession,
  getAccessToken,
  getStoredContext,
  persistSession,
  type AdminAuthContext,
} from "@/lib/api-client";

type AuthState = {
  ready: boolean;
  authenticated: boolean;
  context: AdminAuthContext | null;
  login: (input: { email: string; password: string; organizationSlug?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [context, setContext] = useState<AdminAuthContext | null>(null);

  const refreshSession = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setContext(null);
      return;
    }
    try {
      const data = await apiFetch<{
        context: AdminAuthContext;
      }>("/api/v1/auth/session");
      persistSession({
        accessToken: token,
        context: data.context,
      });
      setContext(data.context);
    } catch {
      clearSession();
      setContext(null);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredContext();
    if (stored && getAccessToken()) {
      setContext(stored);
      void refreshSession().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [refreshSession]);

  useEffect(() => {
    const onExpired = () => {
      clearSession();
      setContext(null);
    };
    window.addEventListener("pergon:session-expired", onExpired);
    return () => window.removeEventListener("pergon:session-expired", onExpired);
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string; organizationSlug?: string }) => {
      const data = await apiFetch<{
        status: string;
        tokens: { accessToken: string; refreshToken: string };
        context: AdminAuthContext;
      }>("/api/v1/auth/login", {
        method: "POST",
        json: {
          email: input.email,
          password: input.password,
          organizationSlug: input.organizationSlug,
        },
      });

      persistSession({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        context: data.context,
      });
      setContext(data.context);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST", json: {} });
    } catch {
      // local clear still required
    }
    clearSession();
    setContext(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      authenticated: Boolean(context),
      context,
      login,
      logout,
      refreshSession,
      hasPermission: (permission: string) => Boolean(context?.permissions.includes(permission)),
    }),
    [context, login, logout, ready, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
