"use client";

import { MODULE_PAGES } from "@/features/modules/definitions";
import { ModuleWorkbench } from "@/features/modules/module-workbench";

export default function AiPage() {
  return <ModuleWorkbench module={MODULE_PAGES.ai} />;
}
