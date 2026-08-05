import Link from "next/link";

import { PassportBadge } from "@pergon/ui/components/passport-badge";
import { QrViewer } from "@pergon/ui/components/qr-viewer";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { Section } from "@pergon/ui/components/section";
import { Separator } from "@pergon/ui/components/separator";

import { systemContent } from "../content";
import { SectionReveal } from "./section-reveal";

function MiniQr() {
  return (
    <svg viewBox="0 0 80 80" className="text-foreground size-full" aria-hidden="true">
      <rect x="6" y="6" width="18" height="18" fill="currentColor" />
      <rect x="10" y="10" width="10" height="10" fill="hsl(var(--background))" />
      <rect x="56" y="6" width="18" height="18" fill="currentColor" />
      <rect x="60" y="10" width="10" height="10" fill="hsl(var(--background))" />
      <rect x="6" y="56" width="18" height="18" fill="currentColor" />
      <rect x="10" y="60" width="10" height="10" fill="hsl(var(--background))" />
      <rect x="34" y="34" width="12" height="12" fill="currentColor" />
      <rect x="34" y="12" width="6" height="6" fill="currentColor" />
      <rect x="52" y="34" width="6" height="6" fill="currentColor" />
      <rect x="34" y="52" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

export function SystemChaptersSection() {
  return (
    <div id={systemContent.id} className="scroll-mt-20">
      {systemContent.chapters.map((chapter, index) => {
        const odd = index % 2 === 1;
        const href = "href" in chapter ? chapter.href : undefined;

        return (
          <div key={chapter.id} className={index % 2 === 0 ? "bg-background" : "bg-panel"}>
            <Container size="lg" asChild>
              <Section id={chapter.id} className="scroll-mt-20" density="cinematic">
                <SectionReveal>
                  <div
                    className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${odd ? "lg:[&>*:first-child]:order-2" : ""}`}
                  >
                    <div className="space-y-6">
                      <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
                        Sistema · {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                        {chapter.title}
                      </h2>
                      <p className="text-muted-foreground text-lede max-w-xl">{chapter.body}</p>
                      {href ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={href}>Abrir Expert</Link>
                        </Button>
                      ) : null}
                    </div>

                    <div className="border-border bg-background flex min-h-[18rem] items-center justify-center border p-10">
                      {chapter.id === "tecnologia-qr" && (
                        <QrViewer
                          alt="Representación estructural QR"
                          size="md"
                          label="Verificación"
                        >
                          <MiniQr />
                        </QrViewer>
                      )}
                      {chapter.id === "pasaporte-digital" && (
                        <div className="space-y-5 text-center">
                          <PassportBadge publicId="PASSPORT-STRUCTURE" state="active" />
                          <p className="text-muted-foreground text-xs tracking-wide">
                            Identidad del Design System
                          </p>
                        </div>
                      )}
                      {chapter.id === "pergon-expert" && (
                        <div className="max-w-sm space-y-4 text-left">
                          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                            Especialista
                          </p>
                          <p className="text-foreground text-lg font-medium tracking-tight">
                            PerGon Expert
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Consulta técnica con fuentes. Sin orbes, sin estética de chatbot.
                          </p>
                          <Separator />
                          <p className="text-muted-foreground font-mono text-xs">
                            /expert · contexto de sesión
                          </p>
                        </div>
                      )}
                      {chapter.id === "academia" && (
                        <div className="max-w-sm space-y-4 text-left">
                          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                            Formación
                          </p>
                          <p className="text-foreground text-lg font-medium tracking-tight">
                            Academia PerGon
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Curriculum y recursos se publicarán con la misma precisión tipográfica.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionReveal>
              </Section>
            </Container>
          </div>
        );
      })}
    </div>
  );
}
