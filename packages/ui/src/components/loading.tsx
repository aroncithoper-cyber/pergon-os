import { Loader2 } from "lucide-react";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

type LoadingSpinnerProps = HTMLAttributes<SVGSVGElement>;

const LoadingSpinner = forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, ...props }, ref) => (
    <Loader2
      ref={ref}
      role="status"
      aria-label="Cargando"
      className={cn("text-muted-foreground size-4 animate-spin", className)}
      {...props}
    />
  ),
);
LoadingSpinner.displayName = "LoadingSpinner";

interface LoadingBlockProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const LoadingBlock = forwardRef<HTMLDivElement, LoadingBlockProps>(
  ({ className, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-muted-foreground flex min-h-32 flex-col items-center justify-center gap-3 text-sm",
        className,
      )}
      {...props}
    >
      <LoadingSpinner className="size-5" />
      {label ? <p>{label}</p> : null}
    </div>
  ),
);
LoadingBlock.displayName = "LoadingBlock";

export { LoadingBlock, LoadingSpinner };
