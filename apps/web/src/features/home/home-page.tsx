import type {
  CmsCasesSection,
  CmsCtaSection,
  CmsEcosystemSection,
  CmsExpertSection,
  CmsFeaturedProductsSection,
  CmsFinalCtaSection,
  CmsFooterSection,
  CmsHeroSection,
  CmsHomePayload,
  CmsHomeSection,
  CmsNavItem,
  CmsSystemSection,
  CmsTechnologySection,
  CmsWhySection,
} from "@pergon/cms";
import { listEnabledHomeBlocks } from "@pergon/cms";

import { CasesSection, EcosystemSection } from "./components/ecosystem-sections";
import { ExpertSection } from "./components/expert-section";
import { FeaturedProductsSection } from "./components/featured-products-section";
import { FinalCtaSection } from "./components/final-cta-section";
import { HomeHero } from "./components/home-hero";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { SystemChaptersSection } from "./components/system-chapters-section";
import { TechnologySection } from "./components/technology-section";
import { WhyPergonSection } from "./components/why-pergon-section";

function renderBlock(section: CmsHomeSection) {
  switch (section.type) {
    case "hero":
      return <HomeHero key={section.id} content={section as CmsHeroSection} />;
    case "featured_products":
      return (
        <FeaturedProductsSection key={section.id} content={section as CmsFeaturedProductsSection} />
      );
    case "technology":
      return <TechnologySection key={section.id} content={section as CmsTechnologySection} />;
    case "system":
      return <SystemChaptersSection key={section.id} content={section as CmsSystemSection} />;
    case "expert":
      return <ExpertSection key={section.id} content={section as CmsExpertSection} />;
    case "cta":
    case "final_cta":
      return (
        <FinalCtaSection key={section.id} content={section as CmsCtaSection | CmsFinalCtaSection} />
      );
    case "footer":
      return <SiteFooter key={section.id} content={section as CmsFooterSection} />;
    case "why":
      return <WhyPergonSection key={section.id} content={section as CmsWhySection} />;
    case "ecosystem":
      return <EcosystemSection key={section.id} content={section as CmsEcosystemSection} />;
    case "cases":
      return <CasesSection key={section.id} content={section as CmsCasesSection} />;
    default:
      return null;
  }
}

/**
 * Home Composer — renders official blocks in published CMS order.
 * Disabled blocks are omitted. Each block keeps its own component/design.
 */
export function HomePage(props: { payload: CmsHomePayload; preview?: boolean }) {
  const { payload, preview } = props;
  const nav = payload.nav;
  const blocks = listEnabledHomeBlocks(payload);

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      {preview ? (
        <div className="bg-foreground text-background px-4 py-2 text-center text-xs font-medium tracking-wide">
          PREVIEW — contenido no público
        </div>
      ) : null}
      <SiteHeader nav={nav} />
      <div id="main" className="flex flex-1 flex-col">
        {blocks.map((section) => renderBlock(section))}
      </div>
    </div>
  );
}

export type { CmsNavItem };
