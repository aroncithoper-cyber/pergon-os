import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

const buttonVariants = cva(
  [
    "sig-btn-face relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "transition-[background-color,color,border-color,box-shadow,opacity,filter] duration-ui ease-pergon-out",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary/88",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/92 active:bg-destructive/88",
        outline:
          "border border-border bg-transparent text-foreground hover:border-foreground/30 hover:bg-accent/40 active:bg-accent/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85 active:bg-secondary/75",
        ghost: "text-foreground hover:bg-accent/70 active:bg-accent",
        link: "text-foreground underline-offset-4 hover:underline",
        signal: "bg-signal text-signal-foreground hover:brightness-[1.06] active:brightness-[0.96]",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-11 px-7 text-[15px]",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
