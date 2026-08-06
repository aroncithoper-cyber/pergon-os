import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "border-border bg-background text-foreground placeholder:text-muted-foreground/70 duration-ui ease-pergon-out focus-visible:border-signal/45 focus-visible:ring-signal/25 flex h-9 w-full rounded-md border px-3 text-sm tracking-[-0.01em] transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
