import { CasesSection, EcosystemSection } from "./components/ecosystem-sections";
import { FeaturedProductsSection } from "./components/featured-products-section";
import { FinalCtaSection } from "./components/final-cta-section";
import { HomeHero } from "./components/home-hero";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { SystemChaptersSection } from "./components/system-chapters-section";
import { WhyPergonSection } from "./components/why-pergon-section";

export function HomePage() {
  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <HomeHero />
        <FeaturedProductsSection />
        <WhyPergonSection />
        <SystemChaptersSection />
        <EcosystemSection />
        <CasesSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
