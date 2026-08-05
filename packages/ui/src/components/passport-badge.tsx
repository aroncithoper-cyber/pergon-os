import { type HTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

import { StatusBadge } from "./status-badge";

export interface PassportBadgeProps extends HTMLAttributes<HTMLDivElement> {
  publicId: string;
  state?: string;
  size?: "sm" | "md";
}

function truncatePublicId(publicId: string) {
  if (publicId.length <= 12) {
    return publicId;
  }

  return `${publicId.slice(0, 6)}…${publicId.slice(-4)}`;
}

function PassportBadge({ className, publicId, size = "md", state, ...props }: PassportBadgeProps) {
  return (
    <div
      className={cn(
        "border-border bg-background text-foreground inline-flex items-center gap-2 rounded-md border font-mono",
        size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-sm",
        className,
      )}
      {...props}
    >
      <span title={publicId}>{truncatePublicId(publicId)}</span>
      {state && (
        <StatusBadge status={state} className={cn(size === "sm" && "px-1.5 text-[10px]")} />
      )}
    </div>
  );
}

export { PassportBadge };
