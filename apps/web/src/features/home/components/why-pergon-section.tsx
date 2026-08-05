import { Container } from "@pergon/ui/components/container";
import { Section } from "@pergon/ui/components/section";

import { whyContent } from "../content";
import { SectionReveal } from "./section-reveal";

export function WhyPergonSection() {
  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          id={whyContent.id}
          className="scroll-mt-20"
          density="cinematic"
          title={whyContent.title}
          description={whyContent.description}
        >
          <SectionReveal>
            <ol className="grid gap-12 md:grid-cols-3 md:gap-14">
              {whyContent.pillars.map((pillar, index) => (
                <li key={pillar.title} className="space-y-5">
                  <p className="text-muted-foreground font-mono text-xs tabular-nums tracking-wider">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-foreground text-xl font-semibold tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.body}</p>
                </li>
              ))}
            </ol>
          </SectionReveal>
        </Section>
      </Container>
    </div>
  );
}
