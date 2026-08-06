import { AlertCircle } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    { className, title = "No se pudo completar la operación", description, action, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "border-destructive/25 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      <div className="border-destructive/30 bg-background/50 mb-5 flex size-12 items-center justify-center rounded-xl border">
        <AlertCircle className="text-destructive size-5" aria-hidden="true" />
      </div>
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
ErrorState.displayName = "ErrorState";

export { ErrorState };
