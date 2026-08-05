"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingBlock } from "@pergon/ui/components/loading";
import { SidebarInset, SidebarProvider } from "@pergon/ui/components/sidebar";

import { useAuth } from "@/features/auth/auth-provider";
import { AdminCommandPalette, useCommandPalette } from "./command-palette";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated && pathname !== "/login" && pathname !== "/setup") {
      router.replace("/login");
    }
  }, [authenticated, pathname, ready, router]);

  if (!ready || !authenticated) {
    return <LoadingBlock label="Cargando Admin…" className="min-h-svh" />;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <AdminTopbar onOpenCommand={() => setOpen(true)} />
        <div className="flex-1 overflow-auto p-3 md:p-4">{children}</div>
      </SidebarInset>
      <AdminCommandPalette open={open} onOpenChange={setOpen} />
    </SidebarProvider>
  );
}
