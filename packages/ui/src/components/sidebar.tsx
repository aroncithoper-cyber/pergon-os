"use client";

import { PanelLeft } from "lucide-react";
import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@pergon/ui/lib/utils";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be used within a SidebarProvider.");
  }

  return context;
}

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean;
  children: ReactNode;
}

function SidebarProvider({
  children,
  className,
  defaultCollapsed = false,
  ...props
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggle: () => setCollapsed((value) => !value) }}
    >
      <div className={cn("flex min-h-svh w-full", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

const Sidebar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar();

    return (
      <aside
        ref={ref}
        data-collapsed={collapsed}
        className={cn(
          "border-border bg-background/70 flex min-h-svh shrink-0 flex-col border-r backdrop-blur-xl transition-[width] duration-200 ease-out",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar",
          className,
        )}
        {...props}
      />
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-navbar border-border flex items-center border-b px-3", className)}
      {...props}
    />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("min-h-0 flex-1 overflow-y-auto p-3", className)} {...props} />
  ),
);
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-border border-t p-3", className)} {...props} />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, type = "button", ...props }, ref) => {
    const { collapsed, toggle } = useSidebar();

    return (
      <button
        ref={ref}
        type={type}
        aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        aria-pressed={collapsed}
        onClick={(event) => {
          toggle();
          onClick?.(event);
        }}
        className={cn(
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-offset-background active:bg-accent/80 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <PanelLeft className="size-4" aria-hidden="true" />
      </button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <main ref={ref} className={cn("bg-background min-w-0 flex-1", className)} {...props} />
  ),
);
SidebarInset.displayName = "SidebarInset";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
