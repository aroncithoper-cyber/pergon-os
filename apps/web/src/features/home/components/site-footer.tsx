import Link from "next/link";

import { Container } from "@pergon/ui/components/container";
import { Separator } from "@pergon/ui/components/separator";

import { footerContent } from "../content";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-panel text-panel-foreground border-t">
      <Container size="lg" className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm space-y-4">
            <p className="text-foreground text-2xl font-semibold tracking-tight">
              {footerContent.brand}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">{footerContent.tagline}</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerContent.columns.map((column) => (
              <div key={column.title} className="space-y-4">
                <p className="text-foreground text-sm font-medium tracking-tight">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      {link.href === "#" ? (
                        <span className="text-muted-foreground text-sm">{link.label}</span>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        <div className="text-muted-foreground flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {footerContent.brand}. Todos los derechos reservados.
          </p>
          <p>Home V1 — estructura narrativa · contenido editorial pendiente.</p>
        </div>
      </Container>
    </footer>
  );
}
