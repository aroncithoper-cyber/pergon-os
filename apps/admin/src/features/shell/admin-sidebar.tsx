"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@pergon/ui/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@pergon/ui/components/sidebar";

import { useAuth } from "@/features/auth/auth-provider";
import { ADMIN_NAV } from "./nav";

export function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const { hasPermission, context } = useAuth();

  return (
    <Sidebar className="border-border bg-background">
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/dashboard"
          className="text-foreground truncate px-2 text-sm font-semibold tracking-tight"
        >
          {collapsed ? "PG" : "PerGon"}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-4">
        <nav className="space-y-8" aria-label="Navegación principal">
          {ADMIN_NAV.map((group) => {
            const items = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission),
            );
            if (items.length === 0) return null;
            return (
              <div key={group.title} className="space-y-1.5">
                {!collapsed ? (
                  <p className="type-label text-muted-foreground px-3">{group.title}</p>
                ) : null}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "duration-ui block rounded-md px-3 py-1.5 text-sm transition-colors",
                            active
                              ? "bg-accent text-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                          )}
                          title={item.label}
                        >
                          {collapsed ? item.label.slice(0, 1) : item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-border/40 border-t px-3 py-3">
        {!collapsed ? (
          <p className="type-caption text-muted-foreground truncate px-2">
            {context?.roleKeys?.[0] ?? "operador"} · {context?.organizationId.slice(0, 8)}
          </p>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
