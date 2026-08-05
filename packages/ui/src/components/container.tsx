import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-7xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  asChild?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ asChild = false, className, size, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return <Comp ref={ref} className={cn(containerVariants({ size }), className)} {...props} />;
  },
);
Container.displayName = "Container";

export { Container, containerVariants };
