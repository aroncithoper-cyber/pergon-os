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
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="text-foreground truncate px-1 text-sm font-semibold tracking-tight"
        >
          {collapsed ? "PG" : "PerGon"}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <nav className="space-y-6" aria-label="Navegación principal">
          {ADMIN_NAV.map((group) => {
            const items = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission),
            );
            if (items.length === 0) return null;
            return (
              <div key={group.title} className="space-y-1">
                {!collapsed ? (
                  <p className="text-muted-foreground px-2 text-[11px] font-medium uppercase tracking-wide">
                    {group.title}
                  </p>
                ) : null}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-sm transition-colors",
                            active
                              ? "bg-accent text-accent-foreground font-medium"
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
      <SidebarFooter>
        {!collapsed ? (
          <p className="text-muted-foreground truncate px-1 text-[11px]">
            {context?.roleKeys?.[0] ?? "operador"} · {context?.organizationId.slice(0, 8)}
          </p>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
