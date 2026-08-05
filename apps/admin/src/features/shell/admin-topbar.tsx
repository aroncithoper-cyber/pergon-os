"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { Button } from "@pergon/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pergon/ui/components/dropdown-menu";
import { Navbar } from "@pergon/ui/components/navbar";
import { SidebarTrigger } from "@pergon/ui/components/sidebar";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-provider";

type NotificationItem = {
  id: string;
  title?: string;
  body?: string;
  channel?: string;
  status?: string;
  createdAt?: string;
};

export function AdminTopbar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const { logout, context, hasPermission } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!context || !hasPermission("notifications:read")) return;
    void apiFetch<{ items?: NotificationItem[] } | NotificationItem[]>("/api/v1/notifications", {
      method: "POST",
      json: {
        organizationId: context.organizationId,
        pagination: { page: 1, pageSize: 8 },
      },
    })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.items ?? []);
        setNotifications(items);
      })
      .catch(() => setNotifications([]));
  }, [context, hasPermission]);

  return (
    <Navbar
      className="border-border/80"
      brand={<SidebarTrigger />}
      nav={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-muted-foreground hidden h-8 w-full max-w-sm justify-start gap-2 md:inline-flex"
          onClick={onOpenCommand}
        >
          <Search className="size-3.5" aria-hidden="true" />
          Buscar…
          <kbd className="bg-muted ml-auto rounded px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
        </Button>
      }
      actions={
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon" variant="ghost" aria-label="Notificaciones">
                <Bell className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="text-muted-foreground px-2 py-6 text-center text-xs">
                  Sin notificaciones
                </div>
              ) : (
                notifications.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-medium">
                      {item.title ?? item.channel ?? "Aviso"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {item.body ?? item.status ?? item.createdAt}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications">Ver todas</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="ghost">
                Perfil
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sesión activa</p>
                  <p className="text-muted-foreground text-xs">{context?.userId}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Configuración</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void logout().then(() => router.replace("/login"));
                }}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    />
  );
}
