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
  PublishedProductExperience,
} from "../domain/models";

export type CatalogUnitOfWork = {
  categories: CategoryRepository;
  products: ProductRepository;
  variants: VariantRepository;
  presentations: PresentationRepository;
  assets: AssetRepository;
  benefits: BenefitRepository;
  applications: ApplicationRepository;
  materials: MaterialRepository;
  dilutions: DilutionRepository;
  faqs: FaqRepository;
  relations: RelationRepository;
  commit(): Promise<void>;
};

export interface CategoryRepository {
  findById(id: string): Promise<CatalogCategoryRecord | null>;
  findBySlug(organizationId: string, slug: string): Promise<CatalogCategoryRecord | null>;
  save(record: CatalogCategoryRecord): Promise<void>;
}

export interface ProductRepository {
  findById(id: string): Promise<CatalogProductRecord | null>;
  findBySlug(organizationId: string, slug: string): Promise<CatalogProductRecord | null>;
  findPublishedBySlug(slug: string): Promise<CatalogProductRecord | null>;
  listPublishedByIds(ids: string[]): Promise<CatalogProductRecord[]>;
  save(record: CatalogProductRecord): Promise<void>;
}

export interface VariantRepository {
  listByProductId(productId: string): Promise<CatalogVariantRecord[]>;
  save(record: CatalogVariantRecord): Promise<void>;
}

export interface PresentationRepository {
  listByProductId(productId: string): Promise<CatalogPresentationRecord[]>;
  save(record: CatalogPresentationRecord): Promise<void>;
}

export interface AssetRepository {
  listByProductId(productId: string): Promise<CatalogAssetRecord[]>;
  findById(id: string): Promise<CatalogAssetRecord | null>;
  save(record: CatalogAssetRecord): Promise<void>;
}

export interface BenefitRepository {
  listByProductId(productId: string): Promise<CatalogBenefitRecord[]>;
  save(record: CatalogBenefitRecord): Promise<void>;
}

export interface ApplicationRepository {
  listByProductId(productId: string): Promise<CatalogApplicationRecord[]>;
  save(record: CatalogApplicationRecord): Promise<void>;
}

export interface MaterialRepository {
  listByProductId(productId: string): Promise<CatalogMaterialRecord[]>;
  save(record: CatalogMaterialRecord): Promise<void>;
}

export interface DilutionRepository {
  listByProductId(productId: string): Promise<CatalogDilutionRecord[]>;
  save(record: CatalogDilutionRecord): Promise<void>;
}

export interface FaqRepository {
  listByProductId(productId: string): Promise<CatalogFaqRecord[]>;
  save(record: CatalogFaqRecord): Promise<void>;
}

export interface RelationRepository {
  listByProductId(productId: string): Promise<CatalogProductRelationRecord[]>;
  save(record: CatalogProductRelationRecord): Promise<void>;
}

export type GetPublishedProductBySlugInput = {
  slug: string;
};

export type GetPublishedProductBySlugResult = PublishedProductExperience | null;

export type UpsertCatalogProductInput = {
  organizationId: string;
  id?: string;
  categoryId?: string;
  opsProductId?: string;
  slug: string;
  name: string;
  tagline?: string;
  summary?: string;
  status?: CatalogProductRecord["status"];
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSupport?: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  seoTitle?: string;
  seoDescription?: string;
  beforeAfter?: Record<string, unknown>;
  performance?: Record<string, unknown>;
  dilutionCalculator?: Record<string, unknown>;
  cta?: Record<string, unknown>;
  model3d?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  actorId?: string;
};
