import Link from "next/link";
import { BookOpen, FileText, MessageCircle, LifeBuoy, ShoppingCart, Flag } from "lucide-react";

import { Button } from "@pergon/ui/components/button";

const actions = [
  {
    href: "#instrucciones",
    label: "Ver instrucciones",
    icon: BookOpen,
    ready: false,
  },
  {
    href: "#ficha-tecnica",
    label: "Ver ficha técnica",
    icon: FileText,
    ready: false,
  },
  {
    href: "/expert",
    label: "Preguntar a PerGon Expert",
    icon: MessageCircle,
    ready: true,
  },
  {
    href: "#soporte",
    label: "Contactar soporte",
    icon: LifeBuoy,
    ready: false,
  },
  {
    href: "#comprar",
    label: "Comprar nuevamente",
    icon: ShoppingCart,
    ready: false,
  },
  {
    href: "#reportar",
    label: "Reportar un problema",
    icon: Flag,
    ready: false,
  },
] as const;

export function VerifyActions() {
  return (
    <section aria-labelledby="verify-actions-heading" className="space-y-4">
      <h2
        id="verify-actions-heading"
        className="text-foreground text-xl font-semibold tracking-tight"
      >
        Acciones
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.label}>
              <Button
                asChild={action.ready}
                variant="outline"
                className="h-auto w-full justify-start gap-3 px-4 py-3"
                disabled={!action.ready}
                aria-disabled={!action.ready}
              >
                {action.ready ? (
                  <Link href={action.href}>
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="text-left">
                      <span className="block text-sm font-medium">{action.label}</span>
                    </span>
                  </Link>
                ) : (
                  <span className="flex w-full items-start gap-3 text-left">
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-medium">{action.label}</span>
                      <span className="text-muted-foreground block text-xs">Disponible pronto</span>
                    </span>
                  </span>
                )}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
