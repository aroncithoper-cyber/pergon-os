import { FileText } from "lucide-react";

import { EmptyState } from "@pergon/ui/components/empty-state";
import { Container } from "@pergon/ui/components/container";
import { Section } from "@pergon/ui/components/section";
import { Separator } from "@pergon/ui/components/separator";

import { casesContent, ecosystemContent } from "../content";
import { SectionReveal } from "./section-reveal";

export function EcosystemSection() {
  const { distributors, comparator, calculators } = ecosystemContent;

  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          id={ecosystemContent.id}
          className="scroll-mt-20"
          density="cinematic"
          title="Ecosistema"
          description="Capas que extienden el sistema más allá de la narrativa principal. Estructura lista; datos reales después."
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

export function CasesSection() {
  return (
    <Container size="lg" asChild>
      <Section
        id={casesContent.id}
        className="scroll-mt-20"
        title={casesContent.title}
        description={casesContent.description}
      >
        <SectionReveal>
          <div className="border-border border">
            <EmptyState
              icon={<FileText aria-hidden="true" />}
              title={casesContent.emptyTitle}
              description={casesContent.emptyDescription}
            />
          </div>
        </SectionReveal>
      </Section>
    </Container>
  );
}
