import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "border-input bg-background/70 text-foreground placeholder:text-muted-foreground duration-ui ease-pergon-out focus-visible:border-signal/60 focus-visible:ring-signal/40 focus-visible:shadow-pergon-signal flex min-h-24 w-full rounded-md border px-3 py-2 text-sm backdrop-blur-sm transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
