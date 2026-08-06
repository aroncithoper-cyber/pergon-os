"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingBlock } from "@pergon/ui/components/loading";
import { SidebarInset, SidebarProvider } from "@pergon/ui/components/sidebar";
import { cn } from "@pergon/ui/lib/utils";

import { useAuth } from "@/features/auth/auth-provider";
import { AdminCommandPalette, useCommandPalette } from "./command-palette";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

/** Linear-like opaque OS chrome — no cinematic glass. */
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
      <div className="bg-background relative flex min-h-svh w-full">
        <AdminSidebar />
        <SidebarInset className="bg-background relative z-10 flex min-h-svh flex-col">
          <AdminTopbar onOpenCommand={() => setOpen(true)} />
          <div className={cn("flex-1 overflow-auto p-5 md:p-6 lg:p-8")}>{children}</div>
        </SidebarInset>
        <AdminCommandPalette open={open} onOpenChange={setOpen} />
      </div>
    </SidebarProvider>
  );
}
