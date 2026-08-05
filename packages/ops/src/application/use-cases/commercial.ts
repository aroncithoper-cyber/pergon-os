import {
  ConflictError,
  NotFoundError,
  ValidationFailedError,
  newId,
  nowIso,
} from "../../domain/base";
import type { CustomerRecord, DistributorRecord } from "../../domain/models";
import { listQuerySchema, runListQuery, toCsv } from "../../engines/filters";
import { upsertCustomerSchema, upsertDistributorSchema } from "../../validation/schemas";
import { createOpsHelpers } from "../helpers";
import type { OpsUnitOfWork } from "../ports";

export async function listCustomers(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.customers.listByOrg(parsed.data.organizationId);
  const page = runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "code",
    "name",
    "email",
    "status",
  ]);
  if (parsed.data.exportFormat === "csv") return { ...page, csv: toCsv(page.items) };
  return page;
}

export async function upsertCustomer(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = upsertCustomerSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const helpers = createOpsHelpers(uow);
  const now = nowIso();

  let customer: CustomerRecord;
  if (input.id) {
    const existing = await uow.customers.findById(input.id);
    if (!existing || existing.organizationId !== input.organizationId) {
      throw new NotFoundError("customer", input.id);
    }
    customer = {
      ...existing,
      code: input.code,
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: input.status,
      segment: input.segment,
      distributorId: input.distributorId,
      metadata: input.metadata,
      version: existing.version + 1,
      updatedAt: now,
    };
    await uow.customers.save(customer);
    await helpers.audit.record({
      organizationId: input.organizationId,
      actor: input.actor,
      action: "customers:update",
      module: "customers",
      entityType: "customer",
      entityId: customer.id,
      after: customer,
      requestId: input.requestId,
    });
  } else {
    const clash = await uow.customers.findByCode(input.organizationId, input.code);
    if (clash) throw new ConflictError(`Customer code exists: ${input.code}`);
    customer = {
      id: newId(),
      organizationId: input.organizationId,
      code: input.code,
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: input.status,
      segment: input.segment,
      distributorId: input.distributorId,
      metadata: input.metadata,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await uow.customers.save(customer);
    await helpers.audit.record({
      organizationId: input.organizationId,
      actor: input.actor,
      action: "customers:create",
      module: "customers",
      entityType: "customer",
      entityId: customer.id,
      after: customer,
      requestId: input.requestId,
    });
  }
  await helpers.emit(
    input.organizationId,
    "customers",
    input.id ? "customer.updated" : "customer.created",
    "customer",
    customer.id,
    { code: customer.code },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return customer;
}

export async function listDistributors(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const items = await uow.distributors.listByOrg(parsed.data.organizationId);
  const page = runListQuery(items as unknown as Record<string, unknown>[], parsed.data, [
    "code",
    "name",
    "territory",
    "status",
  ]);
  if (parsed.data.exportFormat === "csv") return { ...page, csv: toCsv(page.items) };
  return page;
}

export async function upsertDistributor(uow: OpsUnitOfWork, raw: unknown) {
  const parsed = upsertDistributorSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;
  const helpers = createOpsHelpers(uow);
  const now = nowIso();

  let distributor: DistributorRecord;
  if (input.id) {
    const existing = await uow.distributors.findById(input.id);
    if (!existing || existing.organizationId !== input.organizationId) {
      throw new NotFoundError("distributor", input.id);
    }
    distributor = {
      ...existing,
      code: input.code,
      name: input.name,
      email: input.email,
      territory: input.territory,
      status: input.status,
      metadata: input.metadata,
      version: existing.version + 1,
      updatedAt: now,
    };
  } else {
    const clash = await uow.distributors.findByCode(input.organizationId, input.code);
    if (clash) throw new ConflictError(`Distributor code exists: ${input.code}`);
    distributor = {
      id: newId(),
      organizationId: input.organizationId,
      code: input.code,
      name: input.name,
      email: input.email,
      territory: input.territory,
      status: input.status,
      metadata: input.metadata,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
  }
  await uow.distributors.save(distributor);
  await helpers.audit.record({
    organizationId: input.organizationId,
    actor: input.actor,
    action: input.id ? "distributors:update" : "distributors:create",
    module: "distributors",
    entityType: "distributor",
    entityId: distributor.id,
    after: distributor,
    requestId: input.requestId,
  });
  await helpers.emit(
    input.organizationId,
    "distributors",
    input.id ? "distributor.updated" : "distributor.created",
    "distributor",
    distributor.id,
    { code: distributor.code },
    input.actor,
    input.requestId,
  );
  await uow.commit();
  return distributor;
}
