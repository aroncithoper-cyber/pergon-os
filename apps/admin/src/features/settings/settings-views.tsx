"use client";

import { useEffect, useState } from "react";

import { Button } from "@pergon/ui/components/button";
import { ErrorState } from "@pergon/ui/components/error-state";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { Textarea } from "@pergon/ui/components/textarea";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-provider";

export function SettingsView() {
  const { context, hasPermission } = useAuth();
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [raw, setRaw] = useState("{}");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context || !hasPermission("settings:read")) {
      setLoading(false);
      return;
    }
    void apiFetch<Record<string, unknown>>("/api/v1/settings")
      .then((data) => {
        setSettings(data ?? {});
        setRaw(JSON.stringify(data ?? {}, null, 2));
      })
      .catch(() => {
        setSettings({});
        setRaw("{}");
      })
      .finally(() => setLoading(false));
  }, [context, hasPermission]);

  if (!hasPermission("settings:read")) {
    return <ErrorState title="Sin permiso" description="settings:read requerido." />;
  }
  if (loading) return <LoadingBlock label="Cargando configuración…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground text-sm">GET/PUT `/api/v1/settings`.</p>
      </header>
      <div className="space-y-2">
        <Label htmlFor="settings-json">Payload JSON</Label>
        <Textarea
          id="settings-json"
          className="min-h-64 font-mono text-xs"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          disabled={!hasPermission("settings:write")}
        />
      </div>
      {hasPermission("settings:write") ? (
        <Button
          onClick={() => {
            try {
              const parsed = JSON.parse(raw) as Record<string, unknown>;
              void apiFetch("/api/v1/settings", {
                method: "PUT",
                json: { ...parsed, organizationId: context?.organizationId },
              }).then(() => {
                setSettings(parsed);
                setMessage("Guardado");
              });
            } catch {
              setMessage("JSON inválido");
            }
          }}
        >
          Guardar
        </Button>
      ) : null}
      {message ? <p className="text-muted-foreground text-xs">{message}</p> : null}
      <pre className="bg-panel overflow-auto p-3 text-xs">{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}

export function ProfileView() {
  const { context } = useAuth();
  const [session, setSession] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void apiFetch<Record<string, unknown>>("/api/v1/auth/session")
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground text-sm">
          Datos de sesión desde `/api/v1/auth/session`.
        </p>
      </header>
      <div className="space-y-2">
        <Label>User ID</Label>
        <Input value={context?.userId ?? ""} readOnly />
      </div>
      <div className="space-y-2">
        <Label>Organization ID</Label>
        <Input value={context?.organizationId ?? ""} readOnly />
      </div>
      <div className="space-y-2">
        <Label>Roles</Label>
        <Input value={(context?.roleKeys ?? []).join(", ")} readOnly />
      </div>
      <pre className="bg-panel overflow-auto p-3 text-xs">{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
