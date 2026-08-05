import {
  createExpertServices,
  createProviderRegistry,
  createSharedMemoryExpertUnitOfWork,
  ExpertError,
  type UpsertKnowledgeInput,
} from "@pergon/expert";

import { requireApiPermission } from "@/lib/auth";
import { toOpsErrorResponse } from "@/lib/ops";

function getExpertServices() {
  return createExpertServices(createSharedMemoryExpertUnitOfWork(), createProviderRegistry());
}

function toExpertErrorResponse(error: unknown) {
  if (error instanceof ExpertError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "RATE_LIMITED"
          ? 429
          : error.code === "VALIDATION_FAILED"
            ? 400
            : 400;
    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }
  return toOpsErrorResponse(error);
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "expert:use_admin");
    const body = (await request.json()) as Partial<UpsertKnowledgeInput> & Record<string, unknown>;

    const data = await getExpertServices().upsertKnowledgeDocument({
      organizationId: String(body.organizationId ?? ctx.organizationId),
      id: typeof body.id === "string" ? body.id : undefined,
      slug: String(body.slug ?? ""),
      title: String(body.title ?? ""),
      domain: body.domain as UpsertKnowledgeInput["domain"],
      body: String(body.body ?? ""),
      status: body.status,
      sourceType: body.sourceType,
      sourceRef: typeof body.sourceRef === "string" ? body.sourceRef : undefined,
      metadata: body.metadata,
      actorId: ctx.userId,
    });

    return Response.json({ data }, { status: body.id ? 200 : 201 });
  } catch (error) {
    if (error instanceof ExpertError) return toExpertErrorResponse(error);
    return toOpsErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    await requireApiPermission(request, "expert:use_admin");
    const data = getExpertServices().listProviders();
    return Response.json({ data: { providers: data } });
  } catch (error) {
    return toOpsErrorResponse(error);
  }
}
