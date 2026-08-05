import { FileText } from "lucide-react";

import type { CmsCasesSection, CmsEcosystemSection } from "@pergon/cms";
import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";
import { Separator } from "@pergon/ui/components/separator";

import { SectionReveal } from "./section-reveal";

export function EcosystemSection({ content }: { content: CmsEcosystemSection }) {
  const { distributors, comparator, calculators } = content;

  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          id={content.id}
          className="scroll-mt-20"
          density="cinematic"
          title="Ecosistema"
          description="Capas que extienden el sistema más allá de la narrativa principal."
        >
          <SectionReveal>
            <div>
              <article id="distribuidores" className="scroll-mt-20 space-y-3 py-8">
                <h3 className="text-foreground text-xl font-semibold tracking-tight">
                  {distributors.title}
                </h3>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                  {distributors.body}
                </p>
              </article>
              <Separator />
              <article id="comparador" className="scroll-mt-20 space-y-3 py-8">
                <h3 className="text-foreground text-xl font-semibold tracking-tight">
                  {comparator.title}
                </h3>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                  {comparator.body}
                </p>
              </article>
              <Separator />
              <article id="calculadoras" className="scroll-mt-20 space-y-3 py-8">
                <h3 className="text-foreground text-xl font-semibold tracking-tight">
                  {calculators.title}
                </h3>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                  {calculators.body}
                </p>
              </article>
            </div>
          </SectionReveal>
        </Section>
      </Container>
    </div>
  );
}

export function CasesSection({ content }: { content: CmsCasesSection }) {
  return (
    <Container size="lg" asChild>
      <Section
        id={content.id}
        className="scroll-mt-20"
        title={content.title}
        description={content.description}
      >
        <SectionReveal>
          <div className="border-border border">
            <EmptyState
              icon={<FileText aria-hidden="true" />}
              title={content.emptyTitle}
              description={content.emptyDescription}
            />
          </div>
        </SectionReveal>
      </Section>
    </Container>
  );
}
