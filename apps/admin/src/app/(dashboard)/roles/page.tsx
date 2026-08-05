"use client";

import { MODULE_PAGES } from "@/features/modules/definitions";
import { ModuleWorkbench } from "@/features/modules/module-workbench";

export default function RolesPage() {
  return <ModuleWorkbench module={MODULE_PAGES.roles} />;
}
