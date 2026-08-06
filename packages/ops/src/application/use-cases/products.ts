import { formatZodError } from "@pergon/shared/i18n";
import {
  ConflictError,
  NotFoundError,
  ValidationFailedError,
  newId,
  nowIso,
} from "../../domain/base";
import type { ProductRecord } from "../../domain/models";
import { listQuerySchema, runListQuery, toCsv } from "../../engines/filters";
import { upsertProductSchema } from "../../validation/schemas";
import { createOpsHelpers } from "../helpers";
import type { OpsUnitOfWork } from "../ports";

export async function listProducts(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const items = await uow.products.listByOrg(parsed.data.organizationId);
  const page = runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "sku",
    "name",
    "status",
  ]);
  if (parsed.data.exportFormat === "csv") {
    return { ...page, csv: toCsv(page.items) };
  }
  return page;
}

export async function upsertProduct(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = upsertProductSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const input = parsed.data;
  const helpers = createOpsHelpers(uow);
  const now = nowIso();

  let product: ProductRecord;
  if (input.id) {
    const existing = await uow.products.findById(input.id);
    if (!existing || existing.organizationId !== input.organizationId) {
      throw new NotFoundError("product", input.id);
    }
    const before = { ...existing };
    product = {
      ...existing,
      sku: input.sku,
      name: input.name,
      status: input.status,
      description: input.description,
      metadata: input.metadata,
      version: existing.version + 1,
      updatedAt: now,
    };
    await uow.products.save(product);
    await helpers.audit.record({
      organizationId: input.organizationId,
      actor: input.actor,
      action: "products:update",
      module: "products",
      entityType: "product",
      entityId: product.id,
      before,
      after: product,
      requestId: input.requestId,
    });
    await helpers.emit(
      input.organizationId,
      "products",
      "product.updated",
      "product",
      product.id,
      { sku: product.sku },
      input.actor,
      input.requestId,
    );
  } else {
    const clash = await uow.products.findBySku(input.organizationId, input.sku);
    if (clash) throw new ConflictError(`SKU already exists: ${input.sku}`);
    product = {
      id: newId(),
      organizationId: input.organizationId,
      sku: input.sku,
      name: input.name,
      status: input.status,
      description: input.description,
      metadata: input.metadata,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await uow.products.save(product);
    await helpers.audit.record({
      organizationId: input.organizationId,
      actor: input.actor,
      action: "products:create",
      module: "products",
      entityType: "product",
      entityId: product.id,
      after: product,
      requestId: input.requestId,
    });
    await helpers.emit(
      input.organizationId,
      "products",
      "product.created",
      "product",
      product.id,
      { sku: product.sku },
      input.actor,
      input.requestId,
    );
  }

  await uow.commit();
  return product;
}

export async function getProduct(uow: OpsUnitOfWork, id: string) {
  const product = await uow.products.findById(id);
  if (!product) throw new NotFoundError("product", id);
  return product;
}
