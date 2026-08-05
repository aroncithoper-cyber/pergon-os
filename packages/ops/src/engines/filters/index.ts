import { z } from "zod";

/** Shared list/query engine for all Admin modules. */
export const sortDirectionSchema = z.enum(["asc", "desc"]);

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(200).default(25),
});

export const sortSchema = z.object({
  field: z.string().min(1),
  direction: sortDirectionSchema.default("asc"),
});

export const filterOperatorSchema = z.enum([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "contains",
  "starts_with",
  "is_null",
  "between",
]);

export const filterClauseSchema = z.object({
  field: z.string().min(1),
  op: filterOperatorSchema,
  value: z.unknown().optional(),
});

export const listQuerySchema = z.object({
  organizationId: z.string().uuid(),
  search: z.string().max(200).optional(),
  filters: z.array(filterClauseSchema).default([]),
  sort: z.array(sortSchema).default([]),
  pagination: paginationSchema.default({ page: 1, pageSize: 25 }),
  includeDeleted: z.boolean().optional().default(false),
  exportFormat: z.enum(["json", "csv"]).optional(),
  savedViewId: z.string().uuid().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type FilterClause = z.infer<typeof filterClauseSchema>;
export type SortClause = z.infer<typeof sortSchema>;

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function applySearch<T extends Record<string, unknown>>(
  items: T[],
  search: string | undefined,
  fields: string[],
): T[] {
  if (!search?.trim()) return items;
  const q = search.trim().toLowerCase();
  return items.filter((item) =>
    fields.some((field) =>
      String(item[field] ?? "")
        .toLowerCase()
        .includes(q),
    ),
  );
}

export function matchFilter(value: unknown, clause: FilterClause): boolean {
  const { op, value: expected } = clause;
  switch (op) {
    case "eq":
      return value === expected;
    case "neq":
      return value !== expected;
    case "gt":
      return Number(value) > Number(expected);
    case "gte":
      return Number(value) >= Number(expected);
    case "lt":
      return Number(value) < Number(expected);
    case "lte":
      return Number(value) <= Number(expected);
    case "in":
      return Array.isArray(expected) && expected.includes(value);
    case "contains":
      return String(value ?? "")
        .toLowerCase()
        .includes(String(expected ?? "").toLowerCase());
    case "starts_with":
      return String(value ?? "")
        .toLowerCase()
        .startsWith(String(expected ?? "").toLowerCase());
    case "is_null":
      return value == null;
    case "between": {
      if (!Array.isArray(expected) || expected.length < 2) return false;
      const n = Number(value);
      return n >= Number(expected[0]) && n <= Number(expected[1]);
    }
    default:
      return false;
  }
}

export function applyFilters<T extends Record<string, unknown>>(
  items: T[],
  filters: FilterClause[],
): T[] {
  if (!filters.length) return items;
  return items.filter((item) => filters.every((clause) => matchFilter(item[clause.field], clause)));
}

export function applySort<T extends Record<string, unknown>>(items: T[], sort: SortClause[]): T[] {
  if (!sort.length) return items;
  const copy = [...items];
  copy.sort((a, b) => {
    for (const s of sort) {
      const av = a[s.field];
      const bv = b[s.field];
      if (av === bv) continue;
      if (av == null) return s.direction === "asc" ? -1 : 1;
      if (bv == null) return s.direction === "asc" ? 1 : -1;
      const cmp = av < bv ? -1 : 1;
      return s.direction === "asc" ? cmp : -cmp;
    }
    return 0;
  });
  return copy;
}

export function applyPagination<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function runListQuery<T extends Record<string, unknown>>(
  items: T[],
  query: ListQuery,
  searchFields: string[],
): PageResult<T> {
  let result = items;
  if (!query.includeDeleted) {
    result = result.filter((i) => !("deletedAt" in i && i.deletedAt));
  }
  result = applySearch(result, query.search, searchFields);
  result = applyFilters(result, query.filters);
  result = applySort(result, query.sort);
  return applyPagination(result, query.pagination.page, query.pagination.pageSize);
}

export function toCsv(items: Record<string, unknown>[]): string {
  if (!items.length) return "";
  const headers = Object.keys(items[0]!);
  const lines = [
    headers.join(","),
    ...items.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export function createSavedViewInputSchema() {
  return z.object({
    organizationId: z.string().uuid(),
    userId: z.string().uuid(),
    module: z.string().min(1),
    name: z.string().min(1).max(120),
    query: z.record(z.unknown()),
    isDefault: z.boolean().optional().default(false),
  });
}
