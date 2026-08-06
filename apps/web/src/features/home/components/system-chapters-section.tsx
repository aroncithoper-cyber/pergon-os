import Link from "next/link";

import type { CmsSystemSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { PassportBadge } from "@pergon/ui/components/passport-badge";
import { QrViewer } from "@pergon/ui/components/qr-viewer";
import { cn } from "@pergon/ui/lib/utils";

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

export function SystemChaptersSection({ content }: { content: CmsSystemSection }) {
  if (!content.enabled) return null;

  return (
    <div id={content.id} className="scroll-mt-20">
      {content.chapters.map((chapter, index) => {
        const odd = index % 2 === 1;
        const href = chapter.href;

        return (
          <div
            key={chapter.id}
            className={cn(
              "border-border/40 border-t",
              index % 2 === 0 ? "bg-background" : "bg-panel/50",
            )}
          >
            <Container size="lg" className="chapter-gap">
              <SectionReveal>
                <div
                  className={cn(
                    "grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24",
                    odd && "lg:[&>*:first-child]:order-2",
                  )}
                >
                  <div className="max-w-xl space-y-6 md:space-y-8">
                    <p className="type-label text-signal">
                      Sistema · {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="type-display-l text-foreground text-balance">{chapter.title}</h2>
                    <p className="type-lead text-muted-foreground">{chapter.body}</p>
                    {href ? (
                      <Button asChild variant="outline" size="lg">
                        <Link href={href}>Abrir Expert</Link>
                      </Button>
                    ) : null}
                  </div>

                  <div className="sig-panel-raised flex min-h-[16rem] items-center justify-center p-6 sm:min-h-[18rem] sm:p-8 md:min-h-[20rem] md:p-10">
                    {chapter.id === "tecnologia-qr" ? (
                      <div className="glow-cyan rounded-xl p-2">
                        <QrViewer
                          alt="Representación estructural QR"
                          size="md"
                          label="Verificación"
                        >
                          <MiniQr />
                        </QrViewer>
                      </div>
                    ) : null}
                    {chapter.id === "pasaporte-digital" ? (
                      <div className="space-y-5 text-center">
                        <PassportBadge publicId="PASSPORT-STRUCTURE" state="active" />
                        <p className="type-caption text-muted-foreground">
                          Identidad del Design System
                        </p>
                      </div>
                    ) : null}
                    {chapter.id === "academia" ? (
                      <div className="max-w-sm space-y-4 text-left">
                        <p className="type-label text-cyan">Formación</p>
                        <p className="type-h3 text-foreground">Academia PerGon</p>
                        <p className="type-body text-muted-foreground">
                          Curriculum y recursos se publicarán con la misma precisión tipográfica.
                        </p>
                      </div>
                    ) : null}
                    {!["tecnologia-qr", "pasaporte-digital", "pergon-expert", "academia"].includes(
                      chapter.id,
                    ) ? (
                      <p className="type-body text-muted-foreground max-w-sm">{chapter.title}</p>
                    ) : null}
                  </div>
                </div>
              </SectionReveal>
            </Container>
          </div>
        );
      })}
    </div>
  );
}
