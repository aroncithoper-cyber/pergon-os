"use client";

import { MODULE_PAGES } from "@/features/modules/definitions";
import { ModuleWorkbench } from "@/features/modules/module-workbench";

export default function PassportsPage() {
  return <ModuleWorkbench module={MODULE_PAGES.passports} />;
}
