import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

const sectionVariants = cva("", {
  variants: {
    density: {
      comfortable: "py-12 md:py-16",
      compact: "py-8 md:py-10",
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
});

export interface SectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">, VariantProps<typeof sectionVariants> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ actions, children, className, density, description, title, ...props }, ref) => (
    <section ref={ref} className={cn(sectionVariants({ density }), className)} {...props}>
      {(title || description || actions) && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            {title && (
              <h2 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <div className="text-muted-foreground max-w-2xl text-sm">{description}</div>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  ),
);
Section.displayName = "Section";

export { Section, sectionVariants };
