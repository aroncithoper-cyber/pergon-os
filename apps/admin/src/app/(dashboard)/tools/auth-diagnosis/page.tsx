import { notFound } from "next/navigation";

import { AuthDiagnosisPanel } from "@/features/tools/auth-diagnosis-panel";

export default function AuthDiagnosisPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AuthDiagnosisPanel />;
}
