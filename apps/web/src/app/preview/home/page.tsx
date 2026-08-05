import type { Metadata } from "next";

import { EmptyState } from "@pergon/ui/components/empty-state";

import { HomePage } from "@/features/home/home-page";
import { loadPreviewHome } from "@/features/home/lib/load-home";

export const metadata: Metadata = {
  title: "Preview Home",
  robots: { index: false, follow: false },
};

export default async function PreviewHomePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim();
  if (!token) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-8">
        <EmptyState title="Preview inválido" description="Falta el token de vista previa." />
      </main>
    );
  }

  try {
    const preview = await loadPreviewHome(token);
    return <HomePage payload={preview.payload} preview />;
  } catch {
    return (
      <main className="flex min-h-dvh items-center justify-center p-8">
        <EmptyState
          title="Preview expirado o inválido"
          description="Genera un nuevo token desde Admin → CMS → Home."
        />
      </main>
    );
  }
}
