import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  backdrop?: boolean;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ actions, backdrop = false, brand, className, nav, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "h-navbar border-border bg-background sticky top-0 z-40 border-b",
        backdrop && "bg-background/90 supports-[backdrop-filter]:bg-background/80 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <div className="flex h-full items-center gap-6 px-4 sm:px-6 lg:px-8">
        {brand && <div className="shrink-0">{brand}</div>}
        {nav && <div className="flex min-w-0 flex-1 items-center gap-1">{nav}</div>}
        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </nav>
  ),
);
Navbar.displayName = "Navbar";

export { Navbar };
