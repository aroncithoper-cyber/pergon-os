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
    <figure className={cn("inline-flex flex-col gap-3", className)} {...props}>
      <div
        className={cn(
          "sig-qr",
          size === "sm" && "w-24",
          size === "md" && "w-40",
          size === "lg" && "w-56",
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="relative z-[1] h-full w-full object-contain" />
        ) : (
          <div className="relative z-[1] flex size-full items-center justify-center">
            {children}
          </div>
        )}
      </div>
      {label ? (
        <figcaption className="type-caption text-muted-foreground text-center">{label}</figcaption>
      ) : null}
    </figure>
  );
}

export { QrViewer };
