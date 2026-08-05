import Image from "next/image";
import Link from "next/link";

import type { CmsFooterSection, CmsHomeFooter } from "@pergon/cms";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

type FooterContent = CmsFooterSection | CmsHomeFooter;

function isSection(content: FooterContent): content is CmsFooterSection {
  return "type" in content && content.type === "footer";
}

/**
 * Institutional Footer — solid, airy, no template chrome.
 */
export function SiteFooter({ content }: { content: FooterContent }) {
  const blocks = content.blocks ?? {
    brand: true,
    contact: true,
    social: true,
    links: true,
    legal: true,
  };
  const description = content.description?.trim() || content.tagline?.trim() || "";
  const contact = content.contact ?? { emails: [], phones: [] };
  const social = content.social ?? [];
  const columns = content.columns ?? [];
  const year = new Date().getFullYear();
  const copyright =
    content.copyright?.trim() || `© ${year} ${content.brand}. Identidad digital y trazabilidad.`;

  const showBrand = blocks.brand;
  const showContact =
    blocks.contact &&
    (contact.emails.length > 0 || contact.phones.length > 0 || Boolean(contact.address?.trim()));
  const showSocial = blocks.social && social.length > 0;
  const showLinks = blocks.links && columns.some((c) => c.links.length > 0);
  const showLegal = blocks.legal;

  if (isSection(content) && !content.enabled) return null;

  return (
    <footer className="border-border text-foreground border-t">
      <Container size="lg" className="py-20 md:py-28">
        <div
          className={cn("grid gap-16 md:gap-20", "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]")}
        >
          {/* Brand + contact */}
          <div className="space-y-12">
            {showBrand ? (
              <div className="max-w-sm space-y-5">
                {content.logoUrl?.trim() ? (
                  <div className="relative h-8 w-36">
                    <Image
                      src={content.logoUrl}
                      alt={content.brand}
                      fill
                      className="object-contain object-left"
                      sizes="144px"
                    />
                  </div>
                ) : (
                  <p className="text-foreground text-2xl font-semibold tracking-tight">
                    {content.brand}
                  </p>
                )}
                {description ? (
                  <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}

            {showContact ? (
              <div className="space-y-4">
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
                  Contacto
                </p>
                <ul className="space-y-3">
                  {contact.emails.map((email) => (
                    <li key={email}>
                      <a
                        href={`mailto:${email}`}
                        className="text-foreground hover:text-muted-foreground text-sm transition-colors"
                      >
                        {email}
                      </a>
                    </li>
                  ))}
                  {contact.phones.map((phone) => (
                    <li key={phone}>
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="text-foreground hover:text-muted-foreground text-sm transition-colors"
                      >
                        {phone}
                      </a>
                    </li>
                  ))}
                  {contact.address?.trim() ? (
                    <li className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                      {contact.address}
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            {showSocial ? (
              <div className="space-y-4">
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
                  Redes
                </p>
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {social.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Quick links */}
          {showLinks ? (
            <div
              className={cn(
                "grid gap-12 sm:gap-16",
                columns.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1",
              )}
            >
              {columns.map((column) => (
                <div key={column.title} className="space-y-5">
                  <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
                    {column.title}
                  </p>
                  <ul className="space-y-4">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        {link.href === "#" ? (
                          <span className="text-muted-foreground text-sm">{link.label}</span>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-foreground hover:text-muted-foreground text-sm transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {showLegal || content.notices?.trim() ? (
          <div className="mt-20 space-y-6 md:mt-28">
            {showLegal ? (
              <div className="text-muted-foreground flex flex-col gap-4 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
                <p>{copyright}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {content.privacyHref && content.privacyLabel ? (
                    content.privacyHref === "#" ? (
                      <span>{content.privacyLabel}</span>
                    ) : (
                      <Link
                        href={content.privacyHref}
                        className="hover:text-foreground transition-colors"
                      >
                        {content.privacyLabel}
                      </Link>
                    )
                  ) : null}
                  {content.termsHref && content.termsLabel ? (
                    content.termsHref === "#" ? (
                      <span>{content.termsLabel}</span>
                    ) : (
                      <Link
                        href={content.termsHref}
                        className="hover:text-foreground transition-colors"
                      >
                        {content.termsLabel}
                      </Link>
                    )
                  ) : null}
                </div>
              </div>
            ) : null}
            {content.notices?.trim() ? (
              <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
                {content.notices}
              </p>
            ) : null}
          </div>
        ) : null}
      </Container>
    </footer>
  );
}
