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
      className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}
      {...props}
    >
      {icon ? <div className="text-muted-foreground mb-4 [&>svg]:size-8">{icon}</div> : null}
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {description ? (
        <div className="text-muted-foreground mt-2 max-w-md text-sm leading-6">{description}</div>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
