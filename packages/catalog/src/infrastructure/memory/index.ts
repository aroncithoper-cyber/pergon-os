import { randomUUID } from "node:crypto";

import type {
  CatalogApplicationRecord,
  CatalogAssetRecord,
  CatalogBenefitRecord,
  CatalogCategoryRecord,
  CatalogDilutionRecord,
  CatalogFaqRecord,
  CatalogMaterialRecord,
  CatalogPresentationRecord,
  CatalogProductRecord,
  CatalogProductRelationRecord,
  CatalogVariantRecord,
} from "../../domain/models";
import type {
  ApplicationRepository,
  AssetRepository,
  BenefitRepository,
  CatalogUnitOfWork,
  CategoryRepository,
  DilutionRepository,
  FaqRepository,
  MaterialRepository,
  PresentationRepository,
  ProductRepository,
  RelationRepository,
  VariantRepository,
} from "../../application/ports";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class CatalogMemoryStore {
  categories = new Map<string, CatalogCategoryRecord>();
  products = new Map<string, CatalogProductRecord>();
  variants = new Map<string, CatalogVariantRecord>();
  presentations = new Map<string, CatalogPresentationRecord>();
  assets = new Map<string, CatalogAssetRecord>();
  benefits = new Map<string, CatalogBenefitRecord>();
  applications = new Map<string, CatalogApplicationRecord>();
  materials = new Map<string, CatalogMaterialRecord>();
  dilutions = new Map<string, CatalogDilutionRecord>();
  faqs = new Map<string, CatalogFaqRecord>();
  relations = new Map<string, CatalogProductRelationRecord>();
}

export function newCatalogId(): string {
  return randomUUID();
}

export function createMemoryCatalogUnitOfWork(store = new CatalogMemoryStore()): CatalogUnitOfWork {
  const categories: CategoryRepository = {
    async findById(id) {
      const row = store.categories.get(id);
      return row && !row.deletedAt ? clone(row) : null;
    },
    async findBySlug(organizationId, slug) {
      for (const row of store.categories.values()) {
        if (row.organizationId === organizationId && row.slug === slug && !row.deletedAt) {
          return clone(row);
        }
      }
      return null;
    },
    async save(record) {
      store.categories.set(record.id, clone(record));
    },
  };

  const products: ProductRepository = {
    async findById(id) {
      const row = store.products.get(id);
      return row && !row.deletedAt ? clone(row) : null;
    },
    async findBySlug(organizationId, slug) {
      for (const row of store.products.values()) {
        if (row.organizationId === organizationId && row.slug === slug && !row.deletedAt) {
          return clone(row);
        }
      }
      return null;
    },
    async findPublishedBySlug(slug) {
      const normalized = slug.trim().toLowerCase();
      for (const row of store.products.values()) {
        if (row.slug.toLowerCase() === normalized && row.status === "published" && !row.deletedAt) {
          return clone(row);
        }
      }
      return null;
    },
    async listPublishedByIds(ids) {
      return ids
        .map((id) => store.products.get(id))
        .filter((row): row is CatalogProductRecord =>
          Boolean(row && row.status === "published" && !row.deletedAt),
        )
        .map(clone);
    },
    async save(record) {
      store.products.set(record.id, clone(record));
    },
  };

  const variants: VariantRepository = {
    async listByProductId(productId) {
      return [...store.variants.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.variants.set(record.id, clone(record));
    },
  };

  const presentations: PresentationRepository = {
    async listByProductId(productId) {
      return [...store.presentations.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.presentations.set(record.id, clone(record));
    },
  };

  const assets: AssetRepository = {
    async listByProductId(productId) {
      return [...store.assets.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async findById(id) {
      const row = store.assets.get(id);
      return row && !row.deletedAt ? clone(row) : null;
    },
    async save(record) {
      store.assets.set(record.id, clone(record));
    },
  };

  const benefits: BenefitRepository = {
    async listByProductId(productId) {
      return [...store.benefits.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.benefits.set(record.id, clone(record));
    },
  };

  const applications: ApplicationRepository = {
    async listByProductId(productId) {
      return [...store.applications.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.applications.set(record.id, clone(record));
    },
  };

  const materials: MaterialRepository = {
    async listByProductId(productId) {
      return [...store.materials.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.materials.set(record.id, clone(record));
    },
  };

  const dilutions: DilutionRepository = {
    async listByProductId(productId) {
      return [...store.dilutions.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.dilutions.set(record.id, clone(record));
    },
  };

  const faqs: FaqRepository = {
    async listByProductId(productId) {
      return [...store.faqs.values()]
        .filter((r) => r.productId === productId && !r.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.faqs.set(record.id, clone(record));
    },
  };

  const relations: RelationRepository = {
    async listByProductId(productId) {
      return [...store.relations.values()]
        .filter((r) => r.productId === productId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(clone);
    },
    async save(record) {
      store.relations.set(record.id, clone(record));
    },
  };

  return {
    categories,
    products,
    variants,
    presentations,
    assets,
    benefits,
    applications,
    materials,
    dilutions,
    faqs,
    relations,
    async commit() {},
  };
}

export function createSharedMemoryCatalogUnitOfWork(): CatalogUnitOfWork {
  const globalStore = (globalThis as { __pergonCatalogStore?: CatalogMemoryStore })
    .__pergonCatalogStore;
  if (!globalStore) {
    const store = new CatalogMemoryStore();
    (globalThis as { __pergonCatalogStore?: CatalogMemoryStore }).__pergonCatalogStore = store;
    return createMemoryCatalogUnitOfWork(store);
  }
  return createMemoryCatalogUnitOfWork(globalStore);
}
