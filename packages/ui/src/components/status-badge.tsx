import { type ComponentProps } from "react";

import { Badge } from "./badge";

type KnownStatus =
  | "draft"
  | "active"
  | "inactive"
  | "pending"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "blocked"
  | "archived";

export interface StatusBadgeProps extends Omit<
  ComponentProps<typeof Badge>,
  "children" | "variant"
> {
  status: KnownStatus | string;
  label?: string;
}

const statusVariants: Record<KnownStatus, NonNullable<ComponentProps<typeof Badge>["variant"]>> = {
  draft: "secondary",
  active: "success",
  inactive: "secondary",
  pending: "warning",
  success: "success",
  warning: "warning",
  error: "destructive",
  info: "info",
  blocked: "destructive",
  archived: "outline",
};

function formatStatus(status: string) {
  return status.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ label, status, ...props }: StatusBadgeProps) {
  const variant = statusVariants[status as KnownStatus] ?? "outline";

  return (
    <Badge variant={variant} {...props}>
      {label ?? formatStatus(status)}
    </Badge>
  );
}

export { StatusBadge, type KnownStatus };
