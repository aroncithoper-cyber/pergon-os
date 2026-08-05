"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pergon/ui/components/tabs";

import { CmsCtaFinalEditor } from "@/features/cms/cta-final-editor";
import { CmsExpertHomeEditor } from "@/features/cms/expert-home-editor";
import { CmsFeaturedProductsEditor } from "@/features/cms/featured-products-editor";
import { CmsFooterEditor } from "@/features/cms/footer-editor";
import { CmsHeroEditor } from "@/features/cms/hero-editor";
import { CmsHomeLayoutEditor } from "@/features/cms/home-layout-editor";
import { CmsTechnologyEditor } from "@/features/cms/technology-editor";

/**
 * CMS Home workspace — Layout composer + block editors.
 * Does not introduce freeform page building.
 */
export function CmsHomeWorkspace() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">CMS · Home</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Composer de bloques oficiales PerGon. Layout para orden; editores por bloque.
        </p>
      </div>

      <Tabs defaultValue="layout">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="featured">Productos Destacados</TabsTrigger>
          <TabsTrigger value="technology">Tecnología</TabsTrigger>
          <TabsTrigger value="expert">PerGon Expert</TabsTrigger>
          <TabsTrigger value="cta">CTA Final</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
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
