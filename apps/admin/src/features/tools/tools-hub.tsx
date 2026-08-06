"use client";

import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@pergon/ui/components/alert";

export function ToolsHub() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <Alert>
        <AlertTitle>No disponible</AlertTitle>
        <AlertDescription>
          Las herramientas de diagnóstico solo existen en development.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Sistema</p>
        <h1 className="text-2xl font-semibold tracking-tight">Herramientas</h1>
        <p className="text-muted-foreground text-sm">
          Utilidades temporales de development. Eliminar tras el diagnóstico.
        </p>
      </header>
      <ul className="space-y-2 text-sm">
        <li>
          <Link
            href="/tools/auth-diagnosis"
            className="text-foreground cursor-pointer font-medium hover:underline"
          >
            Diagnóstico Auth
          </Link>
          <p className="text-muted-foreground">
            Buscar usuario, restablecer contraseña y probar login paso a paso.
          </p>
        </li>
      </ul>
    </div>
  );
}
