import {
  ConflictError,
  NotFoundError,
  ValidationFailedError,
  newId,
  nowIso,
} from "../../domain/base";
import type {
  BatchRecord,
  InventoryLevelRecord,
  ProductionOrderRecord,
  StockMoveRecord,
} from "../../domain/models";
import { listQuerySchema, runListQuery, toCsv } from "../../engines/filters";
import {
  adjustInventorySchema,
  completeProductionOrderSchema,
  createProductionOrderSchema,
  createWarehouseSchema,
  transferInventorySchema,
} from "../../validation/schemas";
import { createOpsHelpers } from "../helpers";
import type { OpsUnitOfWork } from "../ports";

export async function createWarehouse(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = createWarehouseSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const now = nowIso();
  const warehouse = {
    id: newId(),
    organizationId: input.organizationId,
    code: input.code,
    name: input.name,
    status: "active" as const,
    createdAt: now,
    updatedAt: now,
  };
  await uow.warehouses.save(warehouse);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "warehouses:create",
    module: "inventory",
    entityType: "warehouse",
    entityId: warehouse.id,
    after: warehouse,
    requestId: input.requestId,
  });
  await uow.commit();
  return warehouse;
}

export async function listInventory(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.inventory.listByOrg(parsed.data.organizationId);
  const page = runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "warehouseId",
    "productId",
    "batchId",
  ]);
  if (parsed.data.exportFormat === "csv") return { ...page, csv: toCsv(page.items) };
  return page;
}

async function applyDelta(
  uow: OpsUnitOfWork,
  organizationId: string,
  warehouseId: string,
  productId: string,
  batchId: string | undefined,
  delta: number,
): Promise<InventoryLevelRecord> {
  const existing = await uow.inventory.findLevel(organizationId, warehouseId, productId, batchId);
  const now = nowIso();
  const level: InventoryLevelRecord = existing
    ? {
        ...existing,
        quantity: existing.quantity + delta,
        updatedAt: now,
      }
    : {
        id: newId(),
        organizationId,
        warehouseId,
        productId,
        batchId,
        quantity: delta,
        reserved: 0,
        updatedAt: now,
      };
  if (level.quantity < 0) throw new ConflictError("Insufficient inventory");
  await uow.inventory.save(level);
  return level;
}

export async function adjustInventory(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = adjustInventorySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const existingMove = await uow.stockMoves.findByIdempotencyKey(input.idempotencyKey);
  if (existingMove) return { move: existingMove, idempotent: true as const };

  const level = await applyDelta(
    uow,
    input.organizationId,
    input.warehouseId,
    input.productId,
    input.batchId,
    input.quantityDelta,
  );

  const move: StockMoveRecord = {
    id: newId(),
    organizationId: input.organizationId,
    type: "adjust",
    warehouseId: input.warehouseId,
    productId: input.productId,
    batchId: input.batchId,
    quantity: input.quantityDelta,
    reason: input.reason,
    idempotencyKey: input.idempotencyKey,
    actor: input.actor,
    createdAt: nowIso(),
  };
  await uow.stockMoves.append(move);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "inventory:adjust",
    module: "inventory",
    entityType: "stock_move",
    entityId: move.id,
    after: { move, level },
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "inventory",
    "inventory.adjusted",
    "stock_move",
    move.id,
    { quantityDelta: input.quantityDelta },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return { move, level, idempotent: false as const };
}

export async function transferInventory(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = transferInventorySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const existingMove = await uow.stockMoves.findByIdempotencyKey(input.idempotencyKey);
  if (existingMove) return { move: existingMove, idempotent: true as const };

  await applyDelta(
    uow,
    input.organizationId,
    input.fromWarehouseId,
    input.productId,
    input.batchId,
    -input.quantity,
  );
  await applyDelta(
    uow,
    input.organizationId,
    input.toWarehouseId,
    input.productId,
    input.batchId,
    input.quantity,
  );

  const move: StockMoveRecord = {
    id: newId(),
    organizationId: input.organizationId,
    type: "transfer",
    warehouseId: input.fromWarehouseId,
    toWarehouseId: input.toWarehouseId,
    productId: input.productId,
    batchId: input.batchId,
    quantity: input.quantity,
    reason: input.reason,
    idempotencyKey: input.idempotencyKey,
    actor: input.actor,
    createdAt: nowIso(),
  };
  await uow.stockMoves.append(move);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "inventory:transfer",
    module: "inventory",
    entityType: "stock_move",
    entityId: move.id,
    after: move,
    requestId: input.requestId,
  });
  await uow.commit();
  return { move, idempotent: false as const };
}

export async function createProductionOrder(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = createProductionOrderSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const clash = await uow.productionOrders.findByCode(input.organizationId, input.code);
  if (clash) throw new ConflictError(`Production order code exists: ${input.code}`);
  const now = nowIso();
  const order: ProductionOrderRecord = {
    id: newId(),
    organizationId: input.organizationId,
    code: input.code,
    productId: input.productId,
    warehouseId: input.warehouseId,
    plannedQty: input.plannedQty,
    producedQty: 0,
    status: "planned",
    metadata: input.metadata,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
  await uow.productionOrders.save(order);
  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "production:create",
    module: "production",
    entityType: "production_order",
    entityId: order.id,
    after: order,
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "production",
    "production_order.created",
    "production_order",
    order.id,
    { code: order.code },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return order;
}

export async function completeProductionOrder(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = completeProductionOrderSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const order = await uow.productionOrders.findById(input.productionOrderId);
  if (!order || order.organizationId !== input.organizationId) {
    throw new NotFoundError("production_order", input.productionOrderId);
  }
  if (order.status === "completed" || order.status === "cancelled") {
    throw new ConflictError(`Order cannot be completed from status ${order.status}`);
  }

  const now = nowIso();
  const batchClash = await uow.batches.findByCode(input.organizationId, input.batchCode);
  if (batchClash) throw new ConflictError(`Batch code exists: ${input.batchCode}`);

  const batch: BatchRecord = {
    id: newId(),
    organizationId: input.organizationId,
    productId: order.productId,
    code: input.batchCode,
    status: "open",
    manufacturedAt: now,
    expiresAt: input.expiresAt,
    productionOrderId: order.id,
    createdAt: now,
    updatedAt: now,
  };
  await uow.batches.save(batch);

  await applyDelta(
    uow,
    input.organizationId,
    order.warehouseId,
    order.productId,
    batch.id,
    input.producedQty,
  );

  const updated: ProductionOrderRecord = {
    ...order,
    producedQty: input.producedQty,
    status: "completed",
    batchId: batch.id,
    version: order.version + 1,
    updatedAt: now,
  };
  await uow.productionOrders.save(updated);

  const move: StockMoveRecord = {
    id: newId(),
    organizationId: input.organizationId,
    type: "produce",
    warehouseId: order.warehouseId,
    productId: order.productId,
    batchId: batch.id,
    quantity: input.producedQty,
    reason: "production_complete",
    idempotencyKey: `produce:${order.id}`,
    actor: input.actor,
    createdAt: now,
  };
  await uow.stockMoves.append(move);

  const helpers = createOpsHelpers(uow);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: "production:complete",
    module: "production",
    entityType: "production_order",
    entityId: order.id,
    after: { order: updated, batch },
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "production",
    "production_order.completed",
    "production_order",
    order.id,
    { batchId: batch.id, producedQty: input.producedQty },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return { order: updated, batch };
}

export async function listProductionOrders(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.productionOrders.listByOrg(parsed.data.organizationId);
  return runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "code",
    "status",
    "productId",
  ]);
}

export async function listBatches(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.batches.listByOrg(parsed.data.organizationId);
  return runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "code",
    "status",
    "productId",
  ]);
}
