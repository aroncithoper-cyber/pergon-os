"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@pergon/ui/components/alert";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { Input } from "@pergon/ui/components/input";
import { Label } from "@pergon/ui/components/label";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-provider";

export function SetupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    ownerEmail: "",
    ownerFullName: "",
    ownerPassword: "",
    setupSecret: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await apiFetch("/api/v1/organizations", {
          method: "POST",
          json: form,
        });
        await login({
          email: form.ownerEmail,
          password: form.ownerPassword,
          organizationSlug: form.slug,
        });
        router.replace("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo crear la organización");
      }
    });
  }

  return (
    <Container size="sm" className="flex min-h-svh flex-col justify-center py-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">Setup</h1>
          <p className="text-muted-foreground text-sm">
            Bootstrap vía `POST /api/v1/organizations` (API Auth existente).
          </p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          {(
            [
              ["name", "Nombre organización"],
              ["slug", "Slug"],
              ["ownerFullName", "Nombre del owner"],
              ["ownerEmail", "Email owner"],
              ["ownerPassword", "Contraseña owner"],
              ["setupSecret", "Setup secret"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={
                  key === "ownerPassword" || key === "setupSecret"
                    ? "password"
                    : key === "ownerEmail"
                      ? "email"
                      : "text"
                }
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required
                autoComplete={key === "setupSecret" ? "off" : undefined}
              />
            </div>
          ))}
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creando…" : "Crear y entrar"}
          </Button>
        </form>
        <p className="text-muted-foreground text-xs">
          <Link href="/login" className="underline-offset-4 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </Container>
  );
}
