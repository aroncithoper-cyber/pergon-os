"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@pergon/ui/components/alert";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";

import { useAuth } from "@/features/auth/auth-provider";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await login({
          email,
          password,
          organizationSlug: organizationSlug || undefined,
        });
        router.replace("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
      }
    });
  }

  return (
    <Container size="sm" className="flex min-h-svh flex-col justify-center py-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">PerGon OS</p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Herramienta operativa. Densidad alta, sin teatro visual.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org">Slug organización (opcional)</Label>
            <Input
              id="org"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
              placeholder="mi-org"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Acceso denegado</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-muted-foreground text-xs">
          ¿Primera vez?{" "}
          <Link href="/setup" className="text-foreground underline-offset-4 hover:underline">
            Crear organización
          </Link>
        </p>
      </div>
    </Container>
  );
}
