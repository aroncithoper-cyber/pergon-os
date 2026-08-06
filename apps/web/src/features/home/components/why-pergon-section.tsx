import type { CmsWhySection } from "@pergon/cms";
import { Container } from "@pergon/ui/components/container";

import { SectionReveal } from "./section-reveal";

export function WhyPergonSection({ content }: { content: CmsWhySection }) {
  if (!content.enabled) return null;

  return (
    <section id={content.id} className="border-border/60 bg-panel/40 scroll-mt-20 border-t">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="mb-12 max-w-2xl space-y-6 md:mb-16 md:space-y-8">
            <p className="type-label text-signal">Por qué PerGon</p>
            <h2 className="type-display-l text-foreground text-balance">{content.title}</h2>
            {content.description ? (
              <p className="type-lead text-muted-foreground max-w-xl">{content.description}</p>
            ) : null}
          </div>
        </SectionReveal>
        <SectionReveal delay={0.04}>
          <ol className="grid gap-12 md:grid-cols-3 md:gap-10 lg:gap-14">
            {content.pillars.map((pillar, index) => (
              <li
                key={pillar.title}
                className="border-border/50 space-y-5 border-t pt-6 md:border-t-0 md:pt-0"
              >
                <p className="type-label text-cyan tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="type-h3 text-foreground">{pillar.title}</h3>
                <p className="type-body text-muted-foreground max-w-sm">{pillar.body}</p>
              </li>
            ))}
          </ol>
        </SectionReveal>
      </Container>
    </section>
  );
}
