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
 * CMS Home workspace — Layout composer + block editors.
 * Does not introduce freeform page building.
 */
export function CmsHomeWorkspace() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {t("cms.workspaceTitle")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">{t("cms.workspaceDesc")}</p>
      </div>

      <Tabs defaultValue="layout">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="layout">{t("cms.tabLayout")}</TabsTrigger>
          <TabsTrigger value="hero">{t("cms.tabHero")}</TabsTrigger>
          <TabsTrigger value="featured">{t("cms.tabFeatured")}</TabsTrigger>
          <TabsTrigger value="technology">{t("cms.tabTechnology")}</TabsTrigger>
          <TabsTrigger value="expert">{t("cms.tabExpert")}</TabsTrigger>
          <TabsTrigger value="cta">{t("cms.tabCta")}</TabsTrigger>
          <TabsTrigger value="footer">{t("cms.tabFooter")}</TabsTrigger>
        </TabsList>
        <TabsContent value="layout" className="mt-6">
          <CmsHomeLayoutEditor />
        </TabsContent>
        <TabsContent value="hero" className="mt-6">
          <CmsHeroEditor />
        </TabsContent>
        <TabsContent value="featured" className="mt-6">
          <CmsFeaturedProductsEditor />
        </TabsContent>
        <TabsContent value="technology" className="mt-6">
          <CmsTechnologyEditor />
        </TabsContent>
        <TabsContent value="expert" className="mt-6">
          <CmsExpertHomeEditor />
        </TabsContent>
        <TabsContent value="cta" className="mt-6">
          <CmsCtaFinalEditor />
        </TabsContent>
        <TabsContent value="footer" className="mt-6">
          <CmsFooterEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
