import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  delta?: number;
  deltaTone?: "positive" | "negative" | "neutral";
  hint?: ReactNode;
}

function StatCard({ className, delta, deltaTone, hint, label, value, ...props }: StatCardProps) {
  const resolvedTone = deltaTone ?? (delta && delta < 0 ? "negative" : "positive");

  return (
    <div
      className={cn("border-border bg-card text-card-foreground rounded-lg border p-4", className)}
      {...props}
    >
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {delta !== undefined && (
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              resolvedTone === "positive" && "text-success",
              resolvedTone === "negative" && "text-destructive",
              resolvedTone === "neutral" && "text-muted-foreground",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      {hint && <p className="text-muted-foreground mt-2 text-xs">{hint}</p>}
    </div>
  );
}

export { StatCard };
