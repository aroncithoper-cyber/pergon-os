"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pergon/ui/components/tabs";

import { CmsCtaFinalEditor } from "@/features/cms/cta-final-editor";
import { CmsExpertHomeEditor } from "@/features/cms/expert-home-editor";
import { CmsFeaturedProductsEditor } from "@/features/cms/featured-products-editor";
import { CmsFooterEditor } from "@/features/cms/footer-editor";
import { CmsHeroEditor } from "@/features/cms/hero-editor";
import { CmsHomeLayoutEditor } from "@/features/cms/home-layout-editor";
import { CmsTechnologyEditor } from "@/features/cms/technology-editor";
import { useI18n } from "@/i18n";

/**
 * CMS Home workspace — visual chrome only; same editors & APIs.
 */
export function CmsHomeWorkspace() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div className="glass-panel space-y-2 rounded-xl p-5 md:p-6">
        <p className="text-signal text-[10px] font-medium uppercase tracking-[0.24em]">CMS</p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
          {t("cms.workspaceTitle")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">{t("cms.workspaceDesc")}</p>
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="glass-panel flex h-auto flex-wrap gap-1 rounded-xl p-1.5">
          <TabsTrigger
            value="layout"
            className="data-[state=active]:bg-signal/20 data-[state=active]:text-foreground"
          >
            {t("cms.tabLayout")}
          </TabsTrigger>
          <TabsTrigger value="hero" className="data-[state=active]:bg-signal/20">
            {t("cms.tabHero")}
          </TabsTrigger>
          <TabsTrigger value="featured" className="data-[state=active]:bg-signal/20">
            {t("cms.tabFeatured")}
          </TabsTrigger>
          <TabsTrigger value="technology" className="data-[state=active]:bg-signal/20">
            {t("cms.tabTechnology")}
          </TabsTrigger>
          <TabsTrigger value="expert" className="data-[state=active]:bg-signal/20">
            {t("cms.tabExpert")}
          </TabsTrigger>
          <TabsTrigger value="cta" className="data-[state=active]:bg-signal/20">
            {t("cms.tabCta")}
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-signal/20">
            {t("cms.tabFooter")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="layout" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsHomeLayoutEditor />
        </TabsContent>
        <TabsContent value="hero" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsHeroEditor />
        </TabsContent>
        <TabsContent value="featured" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsFeaturedProductsEditor />
        </TabsContent>
        <TabsContent value="technology" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsTechnologyEditor />
        </TabsContent>
        <TabsContent value="expert" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsExpertHomeEditor />
        </TabsContent>
        <TabsContent value="cta" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsCtaFinalEditor />
        </TabsContent>
        <TabsContent value="footer" className="glass-panel mt-0 rounded-xl p-4 md:p-6">
          <CmsFooterEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
