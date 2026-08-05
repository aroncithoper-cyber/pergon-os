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
      className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}
      {...props}
    >
      <AlertCircle className="text-destructive mb-4 size-8" aria-hidden="true" />
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {description ? (
        <div className="text-muted-foreground mt-2 max-w-md text-sm leading-6">{description}</div>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  ),
);
ErrorState.displayName = "ErrorState";

export { ErrorState };
