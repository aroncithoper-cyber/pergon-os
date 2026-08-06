"use client";

import { StatusBadge } from "@pergon/ui/components/status-badge";

import type { ModuleDefinition } from "./module-workbench";

type Row = Record<string, unknown>;

function text(value: unknown) {
  return value == null || value === "" ? "—" : String(value);
}

const idKey = {
  id: "id",
  header: "ID",
  cell: (row: Row) => <span className="font-mono text-xs">{text(row.id).slice(0, 8)}</span>,
};

export const productsModule: ModuleDefinition<Row> = {
  key: "products",
  title: "Productos",
  description: "Catálogo operativo (ops). Lista y upsert vía API.",
  permission: "products:read",
  listPath: "/api/v1/products",
  upsertPath: "/api/v1/products",
  searchFieldsHint: "SKU, nombre, estado…",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "sku", header: "SKU", cell: (r) => text(r.sku) },
    { id: "name", header: "Nombre", cell: (r) => text(r.name) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "draft")} />,
    },
  ],
  upsertFields: [
    { key: "sku", label: "SKU", required: true },
    { key: "name", label: "Nombre", required: true },
    { key: "status", label: "Estado" },
    { key: "description", label: "Descripción", type: "textarea" },
  ],
};

export const customersModule: ModuleDefinition<Row> = {
  key: "customers",
  title: "Clientes",
  description: "Clientes comerciales.",
  permission: "customers:read",
  listPath: "/api/v1/customers",
  upsertPath: "/api/v1/customers",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "name", header: "Nombre", cell: (r) => text(r.name) },
    { id: "email", header: "Correo electrónico", cell: (r) => text(r.email) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "active")} />,
    },
  ],
  upsertFields: [
    { key: "name", label: "Nombre", required: true },
    { key: "email", label: "Correo electrónico" },
    { key: "status", label: "Estado" },
  ],
};

export const distributorsModule: ModuleDefinition<Row> = {
  key: "distributors",
  title: "Distribuidores",
  description: "Red de distribución.",
  permission: "distributors:read",
  listPath: "/api/v1/distributors",
  upsertPath: "/api/v1/distributors",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "name", header: "Nombre", cell: (r) => text(r.name) },
    { id: "code", header: "Código", cell: (r) => text(r.code) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "active")} />,
    },
  ],
  upsertFields: [
    { key: "name", label: "Nombre", required: true },
    { key: "code", label: "Código" },
    { key: "status", label: "Estado" },
  ],
};

export const inventoryModule: ModuleDefinition<Row> = {
  key: "inventory",
  title: "Inventario",
  description: "Niveles de stock por almacén.",
  permission: "inventory:read",
  listPath: "/api/v1/inventory",
  getRowKey: (row) => String(row.id ?? `${row.warehouseId}-${row.productId}`),
  columns: [
    idKey,
    { id: "warehouseId", header: "Almacén", cell: (r) => text(r.warehouseId).slice(0, 8) },
    { id: "productId", header: "Producto", cell: (r) => text(r.productId).slice(0, 8) },
    { id: "quantity", header: "Cantidad", cell: (r) => text(r.quantity) },
  ],
};

export const productionModule: ModuleDefinition<Row> = {
  key: "production",
  title: "Producción",
  description: "Órdenes de producción.",
  permission: "production:read",
  listPath: "/api/v1/production/orders",
  listBody: { action: "list" },
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "code", header: "Código", cell: (r) => text(r.code ?? r.id) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "draft")} />,
    },
    { id: "quantity", header: "Cantidad", cell: (r) => text(r.quantity) },
  ],
};

export const automationsModule: ModuleDefinition<Row> = {
  key: "automations",
  title: "Automatizaciones",
  description: "Reglas y flujos automatizados.",
  permission: "automations:read",
  listPath: "/api/v1/automations",
  upsertPath: "/api/v1/automations",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "name", header: "Nombre", cell: (r) => text(r.name) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "draft")} />,
    },
    { id: "trigger", header: "Disparador", cell: (r) => text(r.triggerType ?? r.trigger) },
  ],
  upsertFields: [
    { key: "name", label: "Nombre", required: true },
    { key: "status", label: "Estado" },
  ],
};

export const auditModule: ModuleDefinition<Row> = {
  key: "audit",
  title: "Auditoría",
  description: "Trail de acciones del sistema.",
  permission: "audit:read",
  listPath: "/api/v1/audit",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "action", header: "Acción", cell: (r) => text(r.action) },
    { id: "entityType", header: "Entidad", cell: (r) => text(r.entityType) },
    { id: "createdAt", header: "Fecha", cell: (r) => text(r.createdAt) },
  ],
};

export const notificationsModule: ModuleDefinition<Row> = {
  key: "notifications",
  title: "Notificaciones",
  description: "Outbox y avisos.",
  permission: "notifications:read",
  listPath: "/api/v1/notifications",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "channel", header: "Canal", cell: (r) => text(r.channel) },
    { id: "title", header: "Título", cell: (r) => text(r.title) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "pending")} />,
    },
  ],
};

export const alertsModule: ModuleDefinition<Row> = {
  key: "alerts",
  title: "Alertas",
  description: "Alertas operativas abiertas.",
  permission: "alerts:read",
  listPath: "/api/v1/alerts",
  listMethod: "GET",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "type", header: "Tipo", cell: (r) => text(r.type ?? r.severity) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "open")} />,
    },
    { id: "createdAt", header: "Fecha", cell: (r) => text(r.createdAt) },
  ],
};

export const reportsModule: ModuleDefinition<Row> = {
  key: "reports",
  title: "Reportes",
  description: "Jobs de reportes.",
  permission: "reports:read",
  listPath: "/api/v1/reports/jobs",
  listMethod: "GET",
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "type", header: "Tipo", cell: (r) => text(r.type ?? r.reportKey) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "queued")} />,
    },
    { id: "createdAt", header: "Fecha", cell: (r) => text(r.createdAt) },
  ],
};

export const aiModule: ModuleDefinition<Row> = {
  key: "ai",
  title: "IA / Expert Admin",
  description: "Sesiones de IA operativa.",
  permission: "expert:use_admin",
  listPath: "/api/v1/ai/sessions",
  listBody: { action: "list" },
  getRowKey: (row) => String(row.id),
  columns: [
    idKey,
    { id: "purpose", header: "Propósito", cell: (r) => text(r.purpose) },
    {
      id: "status",
      header: "Estado",
      cell: (r) => <StatusBadge status={String(r.status ?? "open")} />,
    },
    { id: "updatedAt", header: "Actualizado", cell: (r) => text(r.updatedAt) },
  ],
};

export const passportsModule: ModuleDefinition<Row> = {
  key: "passport",
  title: "Pasaportes",
  description: "Identidad digital. Historial por ID vía API identity.",
  permission: "passports:read",
  listPath: "/api/v1/passports",
  mode: "actions",
  getRowKey: (row) => String(row.id),
  columns: [],
  historyPath: (row) => (row.id ? `/api/v1/passports/${row.id}/history` : null),
  actions: [
    {
      label: "Crear pasaporte",
      description: "POST /api/v1/passports — requiere productId UUID en prompt.",
      async run({ organizationId, apiFetch }) {
        const productId = window.prompt("productId (UUID)");
        if (!productId) return;
        await apiFetch("/api/v1/passports", {
          method: "POST",
          json: { organizationId, productId, assignQr: true },
        });
      },
    },
    {
      label: "Ver historial",
      description: "GET /api/v1/passports/[id]/history",
      async run({ apiFetch }) {
        const id = window.prompt("passportId (UUID interno)");
        if (!id) return;
        const data = await apiFetch(`/api/v1/passports/${id}/history`);
        window.alert(JSON.stringify(data, null, 2).slice(0, 4000));
      },
    },
  ],
};

export const qrModule: ModuleDefinition<Row> = {
  key: "qr",
  title: "QR",
  description: "Operación QR ligada a pasaportes (rotar vía identity API).",
  permission: "qr:read",
  listPath: "/api/v1/passports",
  mode: "actions",
  getRowKey: (row) => String(row.id),
  columns: [],
  actions: [
    {
      label: "Rotar QR",
      description: "POST /api/v1/passports/[id]/rotate-qr",
      async run({ apiFetch }) {
        const id = window.prompt("passportId");
        const reason = window.prompt("Motivo") ?? "admin_rotate";
        if (!id) return;
        await apiFetch(`/api/v1/passports/${id}/rotate-qr`, {
          method: "POST",
          json: { reason },
        });
      },
    },
  ],
};

export const usersModule: ModuleDefinition<Row> = {
  key: "users",
  title: "Usuarios",
  description: "Invitaciones y operación de usuarios.",
  permission: "users:read",
  listPath: "/api/v1/users/invite",
  mode: "actions",
  getRowKey: (row) => String(row.id),
  columns: [],
  actions: [
    {
      label: "Invitar usuario",
      description: "POST /api/v1/users/invite",
      async run({ organizationId, apiFetch }) {
        const email = window.prompt("Correo electrónico");
        if (!email) return;
        await apiFetch("/api/v1/users/invite", {
          method: "POST",
          json: { organizationId, email },
        });
      },
    },
  ],
};

export const rolesModule: ModuleDefinition<Row> = {
  key: "roles",
  title: "Roles",
  description: "Asignación de roles.",
  permission: "roles:read",
  listPath: "/api/v1/users/roles",
  mode: "actions",
  getRowKey: (row) => String(row.id),
  columns: [],
  actions: [
    {
      label: "Asignar rol",
      description: "POST /api/v1/users/roles",
      async run({ organizationId, apiFetch }) {
        const userId = window.prompt("userId");
        const roleKey = window.prompt("roleKey") ?? "operator";
        if (!userId) return;
        await apiFetch("/api/v1/users/roles", {
          method: "POST",
          json: { organizationId, userId, roleKey },
        });
      },
    },
  ],
};

export const academyModule: ModuleDefinition<Row> = {
  key: "academy",
  title: "Academia",
  description: "Módulo reservado. Sin API de listado aún — shell listo.",
  permission: "dashboard:read",
  listPath: "/api/v1/modules",
  mode: "actions",
  getRowKey: (row) => String(row.id),
  columns: [],
  actions: [
    {
      label: "Ver registro de módulos",
      description: "GET /api/v1/modules",
      async run({ apiFetch }) {
        const data = await apiFetch("/api/v1/modules");
        window.alert(JSON.stringify(data, null, 2).slice(0, 4000));
      },
    },
  ],
};

export const MODULE_PAGES = {
  products: productsModule,
  customers: customersModule,
  distributors: distributorsModule,
  inventory: inventoryModule,
  production: productionModule,
  automations: automationsModule,
  audit: auditModule,
  notifications: notificationsModule,
  alerts: alertsModule,
  reports: reportsModule,
  ai: aiModule,
  passports: passportsModule,
  qr: qrModule,
  users: usersModule,
  roles: rolesModule,
  academy: academyModule,
} as const;
