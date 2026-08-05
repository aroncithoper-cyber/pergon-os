"use client";

import dynamic from "next/dynamic";

import { LoadingBlock } from "@pergon/ui/components/loading";

const ExpertPanel = dynamic(
  () => import("@/features/expert/components/expert-panel").then((m) => m.ExpertPanel),
  {
    loading: () => <LoadingBlock label="Cargando PerGon Expert…" className="min-h-[40vh]" />,
    ssr: false,
  },
);

export function ExpertPanelLazy() {
  return <ExpertPanel />;
}
