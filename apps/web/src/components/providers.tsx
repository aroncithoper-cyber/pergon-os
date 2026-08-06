"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

import { ThemeProvider } from "@pergon/ui/providers/theme-provider";

import { SmoothScroll } from "@/components/smooth-scroll";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </ThemeProvider>
  );
}
