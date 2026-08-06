"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import type { CmsNavItem } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pergon/ui/components/dialog";
import { Navbar } from "@pergon/ui/components/navbar";

export function SiteHeader({ nav }: { nav: CmsNavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Navbar
      aria-label="Navegación principal"
      className="border-border/50 bg-background/90 [&>div]:mx-auto [&>div]:max-w-[var(--container-max-wide)]"
      brand={
        <Link
          href="/"
          className="text-foreground text-brand focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm text-[15px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          PerGon
        </Link>
      }
      nav={
        <ul className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm px-3 py-1.5 text-[13px] tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="signal" className="hidden sm:inline-flex">
            <Link href="#tecnologia-qr">Verificar</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="md:hidden"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="size-4" aria-hidden />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background left-0 top-0 max-h-dvh w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-x-0 border-t-0 p-0 sm:left-1/2 sm:top-1/2 sm:max-h-[85dvh] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border">
              <DialogHeader className="border-border border-b px-6 py-5 text-left">
                <DialogTitle className="text-brand text-base">Menú</DialogTitle>
              </DialogHeader>
              <nav aria-label="Menú móvil" className="flex flex-col gap-0.5 px-3 py-5">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-foreground focus-visible:ring-ring rounded-md px-3 py-3 text-[15px] tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="#tecnologia-qr"
                  onClick={() => setOpen(false)}
                  className="text-signal focus-visible:ring-ring mt-2 rounded-md px-3 py-3 text-[15px] font-medium focus-visible:outline-none focus-visible:ring-2"
                >
                  Verificar
                </Link>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      }
    />
  );
}
