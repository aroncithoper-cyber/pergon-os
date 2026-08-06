import Link from "next/link";

import { Button } from "@pergon/ui/components/button";

const actions = [
  { href: "/expert", label: "Consultar a PerGon Expert", ready: true },
  { href: "#instrucciones", label: "Ver instrucciones", ready: false },
  { href: "#ficha-tecnica", label: "Ver ficha técnica", ready: false },
  { href: "#soporte", label: "Contactar soporte", ready: false },
  { href: "#reportar", label: "Reportar un problema", ready: false },
] as const;

export function VerifyActions() {
  return (
    <section aria-labelledby="verify-actions-heading" className="space-y-6">
      <h2 id="verify-actions-heading" className="type-h3 text-foreground">
        Acciones
      </h2>
      <ul className="divide-border divide-y border-y">
        {actions.map((action) => (
          <li key={action.label} className="flex items-center justify-between gap-4 py-4">
            <span className="type-body text-foreground">{action.label}</span>
            {action.ready ? (
              <Button asChild size="sm" variant="outline">
                <Link href={action.href}>Abrir</Link>
              </Button>
            ) : (
              <span className="type-caption text-muted-foreground">Pronto</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
