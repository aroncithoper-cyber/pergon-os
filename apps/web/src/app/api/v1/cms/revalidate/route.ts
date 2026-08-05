import { revalidatePath } from "next/cache";

import { logger } from "@pergon/shared/logger";

export async function POST(request: Request) {
  const secret = (process.env.CMS_REVALIDATE_SECRET ?? "").trim();
  const provided = request.headers.get("x-cms-revalidate-secret")?.trim() ?? "";

  if (!secret || provided !== secret) {
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Invalid secret" } },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { paths?: string[] };
  const paths = body.paths?.length ? body.paths : ["/", "/preview/home"];

  for (const path of paths) {
    revalidatePath(path);
  }

  logger.info("cms.revalidated", { paths });
  return Response.json({ data: { revalidated: paths, at: new Date().toISOString() } });
}
