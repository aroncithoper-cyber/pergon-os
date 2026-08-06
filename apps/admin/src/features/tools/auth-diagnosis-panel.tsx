"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@pergon/ui/components/alert";
import { Button } from "@pergon/ui/components/button";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";
import { Separator } from "@pergon/ui/components/separator";

import { apiFetch } from "@/lib/api-client";

type DebugUserLookup = {
  userFound: boolean;
  id: string | null;
  email: string;
  status: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  membershipFound: boolean;
  membershipStatus: string | null;
  roleFound: boolean;
  roles: string[];
  locale: string | null;
  lastLoginAt: string | null;
  passwordAlgorithm: "scrypt" | "bcrypt" | "desconocido" | null;
};

type ProbeLoginStepKey =
  "userFound" | "passwordOk" | "membershipFound" | "rolesFound" | "sessionCreated";

type ProbeLoginResult = {
  ok: boolean;
  failedAt: ProbeLoginStepKey | null;
  detail: string | null;
  steps: Record<ProbeLoginStepKey, boolean>;
  organizationId: string | null;
  roles: string[];
  sessionId: string | null;
};

type ResetResult = {
  ok: boolean;
  message: string;
  passwordAlgorithm: string | null;
  verifyPassword: boolean;
};

const STEP_LABELS: Record<ProbeLoginStepKey, string> = {
  userFound: "Usuario encontrado",
  passwordOk: "Contraseña correcta",
  membershipFound: "Membership encontrada",
  rolesFound: "Roles encontrados",
  sessionCreated: "Sesión creada",
};

const STEP_ORDER: ProbeLoginStepKey[] = [
  "userFound",
  "passwordOk",
  "membershipFound",
  "rolesFound",
  "sessionCreated",
];

function yesNo(value: boolean): string {
  return value ? "Sí" : "No";
}

export function AuthDiagnosisPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [lookup, setLookup] = useState<DebugUserLookup | null>(null);
  const [probe, setProbe] = useState<ProbeLoginResult | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (process.env.NODE_ENV !== "development") {
    return (
      <Alert>
        <AlertTitle>No disponible</AlertTitle>
        <AlertDescription>El diagnóstico Auth solo existe en development.</AlertDescription>
      </Alert>
    );
  }

  function runLookup() {
    setError(null);
    setProbe(null);
    setResetMessage(null);
    startTransition(async () => {
      try {
        const data = await apiFetch<DebugUserLookup>(
          `/api/v1/auth/debug-user?email=${encodeURIComponent(email.trim())}`,
        );
        setLookup(data);
      } catch (err) {
        setLookup(null);
        setError(err instanceof Error ? err.message : "Error al buscar usuario.");
      }
    });
  }

  function runReset() {
    setError(null);
    setResetMessage(null);
    startTransition(async () => {
      try {
        const data = await apiFetch<ResetResult>("/api/v1/auth/debug-user/reset-password", {
          method: "POST",
          json: { email: email.trim(), password: newPassword },
        });
        setResetMessage(data.message);
        setPassword(newPassword);
        const refreshed = await apiFetch<DebugUserLookup>(
          `/api/v1/auth/debug-user?email=${encodeURIComponent(email.trim())}`,
        );
        setLookup(refreshed);
      } catch (err) {
        setResetMessage(null);
        setError(err instanceof Error ? err.message : "Error al restablecer contraseña.");
      }
    });
  }

  function runProbe() {
    setError(null);
    setProbe(null);
    startTransition(async () => {
      try {
        const data = await apiFetch<ProbeLoginResult>("/api/v1/auth/debug-user/probe-login", {
          method: "POST",
          json: {
            email: email.trim(),
            password,
            organizationSlug: organizationSlug.trim() || undefined,
          },
        });
        setProbe(data);
      } catch (err) {
        setProbe(null);
        setError(err instanceof Error ? err.message : "Error al probar autenticación.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-1">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
          Sistema · Herramientas
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Diagnóstico Auth</h1>
        <p className="text-muted-foreground text-sm">
          Panel temporal de development. No muestra password_hash. Usa hashPassword / verifyPassword
          / login existentes.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="cursor-pointer px-0"
          onClick={() => router.push("/tools")}
        >
          ← Herramientas
        </Button>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="debug-email">Correo</Label>
          <Input
            id="debug-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ejemplo.com"
          />
        </div>
        <Button
          type="button"
          className="cursor-pointer"
          disabled={pending || !email.trim()}
          onClick={runLookup}
        >
          Buscar usuario
        </Button>
      </section>

      {lookup ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Resultado</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Usuario encontrado</dt>
              <dd>{yesNo(lookup.userFound)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estado</dt>
              <dd>{lookup.status ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Organización</dt>
              <dd>
                {lookup.organizationName
                  ? `${lookup.organizationName} (${lookup.organizationSlug ?? "—"})`
                  : (lookup.organizationId ?? "—")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Membership</dt>
              <dd>{lookup.membershipFound ? `Sí (${lookup.membershipStatus ?? "—"})` : "No"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Roles</dt>
              <dd>{lookup.roleFound ? lookup.roles.join(", ") : "Ninguno"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Locale</dt>
              <dd>{lookup.locale ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Último login</dt>
              <dd>{lookup.lastLoginAt ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Algoritmo password</dt>
              <dd>{lookup.passwordAlgorithm ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Id</dt>
              <dd className="font-mono text-xs">{lookup.id ?? "—"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Restablecer contraseña</h2>
        <div className="space-y-2">
          <Label htmlFor="debug-new-password">Nueva contraseña</Label>
          <Input
            id="debug-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="cursor-pointer"
          disabled={pending || !email.trim() || newPassword.length < 8}
          onClick={runReset}
        >
          Restablecer contraseña
        </Button>
        {resetMessage ? (
          <p className="text-muted-foreground text-sm" role="status">
            {resetMessage}
          </p>
        ) : null}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Probar autenticación</h2>
        <div className="space-y-2">
          <Label htmlFor="debug-password">Contraseña</Label>
          <Input
            id="debug-password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debug-org">Slug organización (opcional)</Label>
          <Input
            id="debug-org"
            value={organizationSlug}
            onChange={(e) => setOrganizationSlug(e.target.value)}
            placeholder={lookup?.organizationSlug ?? ""}
          />
        </div>
        <Button
          type="button"
          className="cursor-pointer"
          disabled={pending || !email.trim() || password.length < 8}
          onClick={runProbe}
        >
          Probar autenticación
        </Button>

        {probe ? (
          <ul className="space-y-1.5 text-sm">
            {STEP_ORDER.map((key) => {
              const ok = probe.steps[key];
              const failed = probe.failedAt === key;
              const mark = ok ? "✓" : failed ? "✗" : "·";
              return (
                <li key={key} className={failed ? "text-destructive" : undefined}>
                  {mark} {STEP_LABELS[key]}
                  {failed && probe.detail ? (
                    <span className="text-muted-foreground block pl-4 text-xs">{probe.detail}</span>
                  ) : null}
                </li>
              );
            })}
            {probe.ok ? (
              <li className="text-muted-foreground pt-2" role="status">
                Login completo. sessionId={probe.sessionId}
              </li>
            ) : null}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
