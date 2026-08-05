import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  value: ReactNode;
  sparkline?: ReactNode;
  footer?: ReactNode;
}

function MetricCard({ className, footer, sparkline, title, value, ...props }: MetricCardProps) {
  return (
    <div
      className={cn("border-border bg-card text-card-foreground rounded-lg border p-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {sparkline && <div className="h-10 w-24 shrink-0">{sparkline}</div>}
      </div>
      {footer && (
        <div className="border-border text-muted-foreground mt-3 border-t pt-3 text-xs">
          {footer}
        </div>
      )}
    </div>
  );
}

export { MetricCard };
