import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "border-input bg-background/70 text-foreground placeholder:text-muted-foreground duration-ui ease-pergon-out focus-visible:border-signal/60 focus-visible:ring-signal/40 focus-visible:shadow-pergon-signal flex h-11 w-full rounded-md border px-3 py-2 text-sm backdrop-blur-sm transition-[border-color,box-shadow,background-color] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
