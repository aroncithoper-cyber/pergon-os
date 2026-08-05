import type { CmsHomePayload } from "@pergon/cms";
import { APP_NAME } from "@pergon/shared";

import { getCmsServices } from "@/lib/cms";

export async function loadPublishedHome(locale = "es"): Promise<CmsHomePayload | null> {
  return getCmsServices().getPublishedHome({ locale });
}

export async function loadPreviewHome(token: string) {
  return getCmsServices().getPreviewHome(token);
}

export function homeSeoFromPayload(payload: CmsHomePayload | null) {
  const title = payload?.seo?.title ?? `${APP_NAME} — Identidad digital y trazabilidad`;
  const description =
    payload?.seo?.description ??
    "PerGon OS es la plataforma de identidad digital, verificación QR, Pasaporte Digital y operación.";
  return { title, description, ogImageUrl: payload?.seo?.ogImageUrl };
}
