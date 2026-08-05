import { Container } from "@pergon/ui/components/container";
import { Section } from "@pergon/ui/components/section";

import { productsContent } from "../content";
import { SectionReveal } from "./section-reveal";

export function FeaturedProductsSection() {
  return (
    <Container size="lg" asChild>
      <Section
        id={productsContent.id}
        className="scroll-mt-20"
        density="cinematic"
        title={productsContent.title}
        description={productsContent.description}
      >
        <SectionReveal>
          <ul className="divide-border border-border divide-y border-y">
            {productsContent.slots.map((slot) => (
              <li
                key={slot.key}
                className="grid gap-3 py-10 sm:grid-cols-[5rem_1fr] sm:items-baseline sm:gap-10"
              >
                <span className="text-muted-foreground font-mono text-xs tracking-wider">
                  {slot.label}
                </span>
                <div className="space-y-2">
                  <p className="text-foreground text-lg font-medium tracking-tight">
                    Unidad con pasaporte
                  </p>
                  <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                    {slot.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionReveal>
      </Section>
    </Container>
  );
}
