"use client";

import { MODULE_PAGES } from "@/features/modules/definitions";
import { ModuleWorkbench } from "@/features/modules/module-workbench";

export default function DistributorsPage() {
  return <ModuleWorkbench module={MODULE_PAGES.distributors} />;
}
