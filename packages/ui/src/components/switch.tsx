"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@pergon/ui/lib/utils";

const Switch = forwardRef<
  ComponentRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "bg-input focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="bg-background pointer-events-none block size-4 rounded-full shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
