import type {
  CmsCtaSection,
  CmsExpertSection,
  CmsFeaturedProductItem,
  CmsFeaturedProductsSection,
  CmsFooterSection,
  CmsHomePayload,
  CmsHomeSection,
  CmsTechnologyMedia,
  CmsTechnologySection,
} from "./models";
import { CMS_HOME_V1_BLOCK_TYPES, type CmsHomeV1BlockType } from "./states";
import { createDefaultHomePayload } from "./default-home";

function isV1Type(type: string): type is CmsHomeV1BlockType {
  return (CMS_HOME_V1_BLOCK_TYPES as readonly string[]).includes(type);
}

function emptyMedia(): CmsTechnologyMedia {
  return {
    mode: "none",
    loop: false,
    enableVideo: false,
    enableImage: false,
  };
}

function seedTechnology(locale: string): CmsTechnologySection {
  const seed = createDefaultHomePayload(locale).sections.find(
    (s): s is CmsTechnologySection => s.type === "technology",
  );
  if (!seed) {
    throw new Error("Default technology block missing from seed");
  }
  return seed;
}

function seedFeatured(locale: string): CmsFeaturedProductsSection {
  const seed = createDefaultHomePayload(locale).sections.find(
    (s): s is CmsFeaturedProductsSection => s.type === "featured_products",
  );
  if (!seed) {
    throw new Error("Default featured_products block missing from seed");
  }
  return seed;
}

function seedExpert(locale: string): CmsExpertSection {
  const seed = createDefaultHomePayload(locale).sections.find(
    (s): s is CmsExpertSection => s.type === "expert",
  );
  if (!seed) {
    throw new Error("Default expert block missing from seed");
  }
  return seed;
}

function seedCta(locale: string): CmsCtaSection {
  const seed = createDefaultHomePayload(locale).sections.find(
    (s): s is CmsCtaSection => s.type === "cta",
  );
  if (!seed) {
    throw new Error("Default cta block missing from seed");
  }
  return seed;
}

function seedFooter(locale: string): CmsFooterSection {
  const seed = createDefaultHomePayload(locale).sections.find(
    (s): s is CmsFooterSection => s.type === "footer",
  );
  if (!seed) {
    throw new Error("Default footer block missing from seed");
  }
  return seed;
}

type TechnologyLike = {
  id: string;
  enabled: boolean;
  sortOrder: number;
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  media?: CmsTechnologySection["media"];
  primaryCta?: CmsTechnologySection["primaryCta"];
  secondaryCta?: CmsTechnologySection["secondaryCta"];
  chapters?: Array<{ id: string; title: string; body: string; href?: string }>;
};

/** Upgrade legacy/partial technology payloads to the editorial V1 shape. */
export function hydrateTechnologySection(
  section: TechnologyLike,
  locale: string,
): CmsTechnologySection {
  const seed = seedTechnology(locale);

  const chapters =
    section.chapters && section.chapters.length > 0
      ? section.chapters.map((c) => ({ id: c.id, title: c.title, body: c.body }))
      : seed.chapters;

  return {
    id: section.id,
    type: "technology",
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    title: section.title?.trim() || seed.title,
    subtitle: section.subtitle?.trim() || seed.subtitle,
    description: section.description?.trim() || seed.description,
    media: section.media ?? seed.media,
    primaryCta: section.primaryCta ?? seed.primaryCta,
    secondaryCta: section.secondaryCta ?? seed.secondaryCta,
    chapters,
  };
}

type FeaturedLike = {
  id: string;
  enabled: boolean;
  sortOrder: number;
  title?: string;
  subtitle?: string;
  description?: string;
  items?: CmsFeaturedProductItem[];
  slots?: Array<{ key: string; label: string; note: string }>;
};

export function hydrateFeaturedProductsSection(
  section: FeaturedLike,
  locale: string,
): CmsFeaturedProductsSection {
  const seed = seedFeatured(locale);
  let items = section.items?.length ? section.items : undefined;
  if (!items && section.slots?.length) {
    items = section.slots.map((slot, index) => ({
      id: slot.key,
      enabled: true,
      sortOrder: index,
      name: slot.label,
      description: slot.note,
      benefit: slot.note,
      href: "#productos",
      ctaLabel: "Ver detalle",
      media: emptyMedia(),
    }));
  }
  const resolved = (items ?? seed.items)
    .map((item, index) => ({
      ...item,
      media: item.media ?? emptyMedia(),
      sortOrder: item.sortOrder ?? index,
      enabled: item.enabled ?? true,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: section.id,
    type: "featured_products",
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    title: section.title?.trim() || seed.title,
    subtitle: section.subtitle?.trim() || seed.subtitle,
    description: section.description?.trim() || seed.description,
    items: resolved,
  };
}

type ExpertLike = {
  id: string;
  enabled: boolean;
  sortOrder: number;
  title?: string;
  subtitle?: string;
  description?: string;
  body?: string;
  media?: CmsTechnologyMedia;
  primaryCta?: CmsExpertSection["primaryCta"];
  secondaryCta?: CmsExpertSection["secondaryCta"];
};

export function hydrateExpertSection(section: ExpertLike, locale: string): CmsExpertSection {
  const seed = seedExpert(locale);
  return {
    id: section.id,
    type: "expert",
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    title: section.title?.trim() || seed.title,
    subtitle: section.subtitle?.trim() || seed.subtitle,
    description: section.description?.trim() || section.body?.trim() || seed.description,
    media: section.media ?? seed.media,
    primaryCta: section.primaryCta ?? seed.primaryCta,
    secondaryCta: section.secondaryCta ?? seed.secondaryCta,
  };
}

type CtaLike = {
  id: string;
  enabled: boolean;
  sortOrder: number;
  type?: string;
  title?: string;
  body?: string;
  media?: CmsTechnologyMedia;
  primaryCta?: CmsCtaSection["primaryCta"];
  secondaryCta?: CmsCtaSection["secondaryCta"];
};

export function hydrateCtaSection(section: CtaLike, locale: string): CmsCtaSection {
  const seed = seedCta(locale);
  return {
    id: section.id,
    type: "cta",
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    title: section.title?.trim() || seed.title,
    body: section.body?.trim() || seed.body,
    media: section.media ?? seed.media,
    primaryCta: section.primaryCta ?? seed.primaryCta,
    secondaryCta: section.secondaryCta ?? seed.secondaryCta,
  };
}

type FooterLike = {
  id: string;
  enabled: boolean;
  sortOrder: number;
  brand?: string;
  logoUrl?: string;
  description?: string;
  tagline?: string;
  contact?: CmsFooterSection["contact"];
  social?: CmsFooterSection["social"];
  columns?: CmsFooterSection["columns"];
  privacyLabel?: string;
  privacyHref?: string;
  termsLabel?: string;
  termsHref?: string;
  copyright?: string;
  notices?: string;
  blocks?: Partial<CmsFooterSection["blocks"]>;
};

export function hydrateFooterSection(section: FooterLike, locale: string): CmsFooterSection {
  const seed = seedFooter(locale);
  return {
    id: section.id,
    type: "footer",
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    brand: section.brand?.trim() || seed.brand,
    logoUrl: section.logoUrl?.trim() || seed.logoUrl,
    description: section.description?.trim() || section.tagline?.trim() || seed.description,
    contact: {
      emails: section.contact?.emails ?? seed.contact.emails,
      phones: section.contact?.phones ?? seed.contact.phones,
      address: section.contact?.address ?? seed.contact.address,
    },
    social: section.social ?? seed.social,
    columns: section.columns?.length ? section.columns : seed.columns,
    privacyLabel: section.privacyLabel?.trim() || seed.privacyLabel,
    privacyHref: section.privacyHref?.trim() || seed.privacyHref,
    termsLabel: section.termsLabel?.trim() || seed.termsLabel,
    termsHref: section.termsHref?.trim() || seed.termsHref,
    copyright: section.copyright?.trim() || seed.copyright,
    notices: section.notices?.trim() || seed.notices,
    blocks: {
      brand: section.blocks?.brand ?? seed.blocks.brand,
      contact: section.blocks?.contact ?? seed.blocks.contact,
      social: section.blocks?.social ?? seed.blocks.social,
      links: section.blocks?.links ?? seed.blocks.links,
      legal: section.blocks?.legal ?? seed.blocks.legal,
    },
  };
}

function mapLegacySection(section: CmsHomeSection, locale: string): CmsHomeSection {
  if (section.type === "system") {
    return hydrateTechnologySection(section, locale);
  }
  if (section.type === "technology") {
    return hydrateTechnologySection(section, locale);
  }
  if (section.type === "featured_products") {
    return hydrateFeaturedProductsSection(section, locale);
  }
  if (section.type === "expert") {
    return hydrateExpertSection(section, locale);
  }
  if (section.type === "cta") {
    return hydrateCtaSection(section, locale);
  }
  if (section.type === "final_cta") {
    return hydrateCtaSection(section, locale);
  }
  if (section.type === "footer") {
    return hydrateFooterSection(section, locale);
  }
  return section;
}

function defaultExpert(locale: string): CmsExpertSection {
  return seedExpert(locale);
}

function footerFromPayload(
  payload: CmsHomePayload,
  sortOrder: number,
  enabled: boolean,
): CmsFooterSection {
  return hydrateFooterSection(
    {
      id: "footer",
      enabled,
      sortOrder,
      brand: payload.footer.brand,
      logoUrl: payload.footer.logoUrl,
      description: payload.footer.description,
      tagline: payload.footer.tagline,
      contact: payload.footer.contact,
      social: payload.footer.social,
      columns: payload.footer.columns,
      privacyLabel: payload.footer.privacyLabel,
      privacyHref: payload.footer.privacyHref,
      termsLabel: payload.footer.termsLabel,
      termsHref: payload.footer.termsHref,
      copyright: payload.footer.copyright,
      notices: payload.footer.notices,
      blocks: payload.footer.blocks,
    },
    payload.locale,
  );
}

/**
 * Normalizes Home payloads to V1 composer blocks.
 * Maps legacy `system`→`technology`, `final_cta`→`cta`, ensures footer block, syncs top-level footer.
 * No DB migration — JSON payload only.
 */
export function normalizeHomePayload(input: CmsHomePayload): CmsHomePayload {
  const seed = createDefaultHomePayload(input.locale);
  const mapped = input.sections.map((s) => mapLegacySection(s, input.locale));

  let sections = [...mapped];
  const hasExpert = sections.some((s) => s.type === "expert");
  if (!hasExpert) {
    const tech = sections.find((s): s is CmsTechnologySection => s.type === "technology");
    if (tech) {
      const expertChapter = tech.chapters.find((c) => c.id === "pergon-expert");
      const remaining = tech.chapters.filter((c) => c.id !== "pergon-expert");
      sections = sections.map((s) =>
        s.type === "technology"
          ? hydrateTechnologySection(
              { ...s, chapters: remaining.length ? remaining : s.chapters },
              input.locale,
            )
          : s,
      );
      const base = defaultExpert(input.locale);
      sections.push({
        ...base,
        title: expertChapter?.title ?? base.title,
        description: expertChapter?.body ?? base.description,
        enabled: tech.enabled,
        sortOrder: tech.sortOrder + 0.5,
      });
    } else {
      sections.push(defaultExpert(input.locale));
    }
  }

  const hasFooterBlock = sections.some((s) => s.type === "footer");
  if (!hasFooterBlock) {
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.sortOrder), -1);
    sections.push(footerFromPayload(input, maxOrder + 1, true));
  }

  // Ensure footer sections are fully hydrated (including those just inserted)
  sections = sections.map((s) => (s.type === "footer" ? hydrateFooterSection(s, input.locale) : s));

  for (const type of CMS_HOME_V1_BLOCK_TYPES) {
    if (!sections.some((s) => s.type === type)) {
      const fromSeed = seed.sections.find((s) => s.type === type);
      if (fromSeed) {
        const maxOrder = sections.reduce((m, s) => Math.max(m, s.sortOrder), -1);
        sections.push({ ...fromSeed, sortOrder: maxOrder + 1, enabled: fromSeed.enabled });
      }
    }
  }

  const v1 = sections.filter((s) => isV1Type(s.type));
  const legacy = sections.filter((s) => !isV1Type(s.type));
  v1.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  legacy.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));

  const ordered: CmsHomeSection[] = [
    ...v1.map((s, i) => ({ ...s, sortOrder: i })),
    ...legacy.map((s, i) => ({ ...s, sortOrder: v1.length + i })),
  ];

  const footerSection = ordered.find((s): s is CmsFooterSection => s.type === "footer");
  const synced = footerSection
    ? footerSection
    : hydrateFooterSection(
        {
          id: "footer",
          enabled: true,
          sortOrder: 0,
          ...input.footer,
        },
        input.locale,
      );

  const footer = {
    brand: synced.brand,
    logoUrl: synced.logoUrl,
    description: synced.description,
    contact: synced.contact,
    social: synced.social,
    columns: synced.columns,
    privacyLabel: synced.privacyLabel,
    privacyHref: synced.privacyHref,
    termsLabel: synced.termsLabel,
    termsHref: synced.termsHref,
    copyright: synced.copyright,
    notices: synced.notices,
    blocks: synced.blocks,
  };

  return {
    ...input,
    sections: ordered,
    footer,
  };
}

export function listEnabledHomeBlocks(payload: CmsHomePayload): CmsHomeSection[] {
  const normalized = normalizeHomePayload(payload);
  return [...normalized.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listHomeLayoutBlocks(payload: CmsHomePayload) {
  const normalized = normalizeHomePayload(payload);
  return CMS_HOME_V1_BLOCK_TYPES.map((type) => {
    const section = normalized.sections.find((s) => s.type === type);
    if (!section) {
      throw new Error(`Missing V1 block: ${type}`);
    }
    return section;
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function reorderHomeBlock(
  payload: CmsHomePayload,
  blockId: string,
  direction: "up" | "down",
): CmsHomePayload {
  const normalized = normalizeHomePayload(payload);
  const v1 = listHomeLayoutBlocks(normalized);
  const index = v1.findIndex((s) => s.id === blockId);
  if (index < 0) return normalized;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= v1.length) return normalized;

  const a = v1[index]!;
  const b = v1[swapWith]!;
  const orderA = a.sortOrder;
  const orderB = b.sortOrder;

  const sections = normalized.sections.map((s) => {
    if (s.id === a.id) return { ...s, sortOrder: orderB };
    if (s.id === b.id) return { ...s, sortOrder: orderA };
    return s;
  });

  return normalizeHomePayload({ ...normalized, sections });
}

export function setHomeBlockEnabled(
  payload: CmsHomePayload,
  blockId: string,
  enabled: boolean,
): CmsHomePayload {
  const normalized = normalizeHomePayload(payload);
  const sections = normalized.sections.map((s) => (s.id === blockId ? { ...s, enabled } : s));
  return normalizeHomePayload({ ...normalized, sections });
}
