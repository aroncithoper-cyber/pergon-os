import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border-border/60 bg-panel/30 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="border-border/80 bg-background/60 text-muted-foreground mb-5 flex size-12 items-center justify-center rounded-xl border [&>svg]:size-5">
          {icon}
        </div>
      ) : null}
      <h2 className="type-h3 text-foreground tracking-tight">{title}</h2>
      {description ? (
        <div className="type-body text-muted-foreground mt-3 max-w-md leading-relaxed">
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
