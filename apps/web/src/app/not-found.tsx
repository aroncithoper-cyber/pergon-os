import Link from "next/link";

import { Button } from "@pergon/ui/components/button";

export default function NotFound() {
  return (
    <main
      id="main"
      className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <div className="space-y-3">
        <p className="type-label text-muted-foreground">404</p>
        <h1 className="type-h2 text-foreground">Página no encontrada</h1>
        <p className="type-body text-muted-foreground max-w-md text-pretty">
          El recurso no existe o ya no está disponible. Puede volver al inicio de PerGon OS.
        </p>
      </div>
      <Button asChild variant="signal">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </main>
  );
}
