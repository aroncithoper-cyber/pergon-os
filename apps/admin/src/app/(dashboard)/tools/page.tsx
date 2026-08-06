import { notFound } from "next/navigation";

import { ToolsHub } from "@/features/tools/tools-hub";

export default function ToolsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ToolsHub />;
}
