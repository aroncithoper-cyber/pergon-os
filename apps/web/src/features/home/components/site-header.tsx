import Link from "next/link";

import { Button } from "@pergon/ui/components/button";
import { Navbar } from "@pergon/ui/components/navbar";

import { homeNav } from "../content";

export function SiteHeader() {
  return (
    <Navbar
      className="border-border/80"
      brand={
        <Link
          href="/"
          className="text-foreground text-brand focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm text-lg tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          PerGon
        </Link>
      }
      nav={
        <ul className="hidden items-center gap-1 md:flex">
          {homeNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      }
      actions={
        <Button asChild size="sm" variant="outline">
          <Link href="#tecnologia-qr">Verificar</Link>
        </Button>
      }
    />
  );
}
