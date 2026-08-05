import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

export interface QrViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  src?: string;
  alt: string;
  children?: ReactNode;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
}

function QrViewer({ alt, children, className, label, size = "md", src, ...props }: QrViewerProps) {
  if (!src && !children) {
    throw new Error("QrViewer requires either an image source or children.");
  }

  return (
    <figure className={cn("inline-flex flex-col gap-2", className)} {...props}>
      <div
        className={cn(
          "border-border bg-background flex aspect-square items-center justify-center overflow-hidden rounded-lg border p-2",
          size === "sm" && "w-24",
          size === "md" && "w-40",
          size === "lg" && "w-56",
        )}
      >
        {src ? <img src={src} alt={alt} className="h-full w-full object-contain" /> : children}
      </div>
      {label && (
        <figcaption className="text-muted-foreground text-center text-xs">{label}</figcaption>
      )}
    </figure>
  );
}

export { QrViewer };
