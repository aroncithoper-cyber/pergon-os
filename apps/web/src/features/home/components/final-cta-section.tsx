import Link from "next/link";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { Section } from "@pergon/ui/components/section";

import { finalCtaContent } from "../content";
import { SectionReveal } from "./section-reveal";

export function FinalCtaSection() {
  return (
    <div className="border-border border-t">
      <Container size="md" asChild>
        <Section id={finalCtaContent.id} className="scroll-mt-20" density="cinematic">
          <SectionReveal>
            <div className="mx-auto max-w-2xl space-y-10 text-center">
              <div className="space-y-5">
                <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                  {finalCtaContent.title}
                </h2>
                <p className="text-muted-foreground text-lede mx-auto max-w-lg">
                  {finalCtaContent.body}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href={finalCtaContent.primaryCta.href}>
                    {finalCtaContent.primaryCta.label}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={finalCtaContent.secondaryCta.href}>
                    {finalCtaContent.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </div>
          </SectionReveal>
        </Section>
      </Container>
    </div>
  );
}
