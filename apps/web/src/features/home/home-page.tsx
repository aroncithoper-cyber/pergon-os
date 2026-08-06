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

import { AtmosphereLayer } from "@/components/atmosphere-layer";

import { CasesSection, EcosystemSection } from "./components/ecosystem-sections";
import { ExpertSection } from "./components/expert-section";
import { FeaturedProductsSection } from "./components/featured-products-section";
import { FinalCtaSection } from "./components/final-cta-section";
import { HomeHero } from "./components/home-hero";
import { beatForSectionType } from "./lib/narrative-beats";
import { NarrativeChapter } from "./components/narrative-chapter";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { SystemChaptersSection } from "./components/system-chapters-section";
import { TechnologySection } from "./components/technology-section";
import { TrustIndicators } from "./components/trust-indicators";
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
 * Home — documentary narrative shell.
 * CMS owns content; chapters/tones are presentation-only.
 */
export function HomePage(props: { payload: CmsHomePayload; preview?: boolean }) {
  const { payload, preview } = props;
  const nav = payload.nav;
  const blocks = listEnabledHomeBlocks(payload);

  let chapterOrdinal = 0;

  return (
    <div className="sig-universe text-foreground relative flex min-h-dvh flex-col overflow-x-clip">
      <AtmosphereLayer className="fixed inset-0 z-0" />
      {preview ? (
        <div className="bg-signal text-signal-foreground relative z-50 px-4 py-2 text-center text-xs font-medium tracking-wide">
          PREVIEW — contenido no público
        </div>
      ) : null}
      <div className="relative z-10 flex min-h-dvh flex-col">
        <SiteHeader nav={nav} />
        <div id="main" className="flex flex-1 flex-col">
          {blocks.map((section) => {
            const inner = renderBlock(section);
            if (!inner) return null;

            if (section.type === "footer") {
              return (
                <div key={section.id}>
                  <TrustIndicators />
                  {inner}
                </div>
              );
            }

            if (section.type === "hero") {
              chapterOrdinal += 1;
              const beat = beatForSectionType("hero", chapterOrdinal);
              return (
                <NarrativeChapter
                  key={section.id}
                  beat={beat!}
                  showQuestion={false}
                  className="min-h-0"
                >
                  {inner}
                </NarrativeChapter>
              );
            }

            const beat = beatForSectionType(section.type, ++chapterOrdinal);
            if (!beat) return <div key={section.id}>{inner}</div>;

            return (
              <NarrativeChapter key={section.id} beat={beat}>
                {inner}
              </NarrativeChapter>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export type { CmsNavItem };
