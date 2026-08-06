import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "border-input bg-background text-foreground placeholder:text-muted-foreground duration-ui ease-pergon-out focus-visible:border-signal/50 focus-visible:ring-signal/30 flex min-h-24 w-full rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
