import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "border-border bg-background text-foreground placeholder:text-muted-foreground/70 duration-ui ease-pergon-out focus-visible:border-signal/45 focus-visible:ring-signal/25 flex min-h-28 w-full rounded-md border px-3 py-3 text-sm leading-relaxed tracking-[-0.01em] transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
