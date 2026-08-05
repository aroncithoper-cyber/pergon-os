export const CATALOG_STATUSES = ["draft", "published", "archived"] as const;
export type CatalogStatus = (typeof CATALOG_STATUSES)[number];

export const ASSET_KINDS = [
  "gallery",
  "hero",
  "before",
  "after",
  "video",
  "document",
  "datasheet",
  "safety_sheet",
  "file",
  "model_3d",
] as const;
export type AssetKind = (typeof ASSET_KINDS)[number];

export const MATERIAL_COMPATIBILITIES = ["compatible", "incompatible"] as const;
export type MaterialCompatibility = (typeof MATERIAL_COMPATIBILITIES)[number];

export const RELATION_TYPES = ["related", "accessory", "alternative"] as const;
export type RelationType = (typeof RELATION_TYPES)[number];
