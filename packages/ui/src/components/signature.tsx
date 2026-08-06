import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

const signaturePanelVariants = cva("sig-panel", {
  variants: {
    tone: {
      default: "sig-panel",
      raised: "sig-panel-raised",
      glass: "sig-glass",
      deep: "sig-glass-deep",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export interface SignaturePanelProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof signaturePanelVariants> {}

const SignaturePanel = forwardRef<HTMLDivElement, SignaturePanelProps>(
  ({ className, tone, ...props }, ref) => (
    <div ref={ref} className={cn(signaturePanelVariants({ tone }), className)} {...props} />
  ),
);
SignaturePanel.displayName = "SignaturePanel";

export interface SignatureDataBlockProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
}

const SignatureDataBlock = forwardRef<HTMLDivElement, SignatureDataBlockProps>(
  ({ className, label, value, ...props }, ref) => (
    <div ref={ref} className={cn("sig-data", className)} {...props}>
      <p className="sig-data-label">{label}</p>
      <p className="sig-data-value">{value}</p>
    </div>
  ),
);
SignatureDataBlock.displayName = "SignatureDataBlock";

const signatureIconVariants = cva("sig-icon", {
  variants: {
    tone: {
      default: "",
      signal: "sig-icon-signal",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export interface SignatureIconProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof signatureIconVariants> {}

const SignatureIcon = forwardRef<HTMLDivElement, SignatureIconProps>(
  ({ className, tone, ...props }, ref) => (
    <div ref={ref} className={cn(signatureIconVariants({ tone }), className)} {...props} />
  ),
);
SignatureIcon.displayName = "SignatureIcon";

export interface SignatureDividerProps extends HTMLAttributes<HTMLHRElement> {
  strong?: boolean;
}

const SignatureDivider = forwardRef<HTMLHRElement, SignatureDividerProps>(
  ({ className, strong = false, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn(strong ? "sig-divider-strong" : "sig-divider", className)}
      {...props}
    />
  ),
);
SignatureDivider.displayName = "SignatureDivider";

export {
  SignatureDataBlock,
  SignatureDivider,
  SignatureIcon,
  SignaturePanel,
  signatureIconVariants,
  signaturePanelVariants,
};
