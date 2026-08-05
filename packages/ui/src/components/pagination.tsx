import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { forwardRef, type ComponentProps, type HTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";
import { buttonVariants } from "./button";

const Pagination = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="Paginación"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);

const PaginationContent = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={className} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = ComponentProps<"a"> & {
  isActive?: boolean;
};

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps & { size?: "default" | "sm" | "lg" | "icon" }) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
      isActive && "pointer-events-none",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Página anterior"
    size="default"
    className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="size-4" />
    <span>Anterior</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Página siguiente"
    size="default"
    className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
    {...props}
  >
    <span>Siguiente</span>
    <ChevronRight className="size-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex size-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="size-4" />
    <span className="sr-only">Más páginas</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
