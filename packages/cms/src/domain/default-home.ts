import type { CmsHomePayload } from "./models";
import { CMS_DEFAULT_LOCALE } from "./states";

/** Seed payload — Home Composer V1 official blocks only. */
export function createDefaultHomePayload(locale = CMS_DEFAULT_LOCALE): CmsHomePayload {
  return {
    locale,
    nav: [
      { href: "#productos", label: "Productos" },
      { href: "#tecnologia", label: "Tecnología" },
      { href: "/expert", label: "Expert" },
      { href: "#cta", label: "Contacto" },
    ],
    sections: [
      {
        id: "hero",
        type: "hero",
        enabled: true,
        sortOrder: 0,
        brand: "PerGon",
        title: "Identidad digital para cada unidad.",
        subtitle:
          "Un sistema operativo de producto: trazabilidad, verificación y operación en la misma plataforma.",
        primaryCta: { href: "#tecnologia", label: "Conocer el sistema" },
        secondaryCta: { href: "/expert", label: "Consultar Expert" },
        media: {
          mode: "none",
          loop: false,
          enableVideo: false,
          enableImage: false,
        },
        visualAlt: "Plano del Pasaporte Digital y QR PerGon",
      },
      {
        id: "productos",
        type: "featured_products",
        enabled: true,
        sortOrder: 1,
        title: "Unidades con identidad.",
        subtitle: "Producto físico anclado a su pasaporte digital.",
        description:
          "Presentación editorial de unidades seleccionadas. Cada una con origen verificable — no un catálogo commodity.",
        items: [
          {
            id: "featured-1",
            enabled: true,
            sortOrder: 0,
            name: "Unidad industrial",
            description: "Formato operativo con identidad digital emitida desde PerGon OS.",
            benefit: "Trazabilidad de lote y verificación en un escaneo.",
            href: "#productos",
            ctaLabel: "Ver detalle",
            media: {
              mode: "none",
              loop: false,
              enableVideo: false,
              enableImage: false,
            },
          },
          {
            id: "featured-2",
            enabled: true,
            sortOrder: 1,
            name: "Unidad comercial",
            description:
              "Presentación limpia para canal, con Pasaporte Digital como prueba de origen.",
            benefit: "Confianza demostrable ante el cliente final.",
            href: "#productos",
            ctaLabel: "Ver detalle",
            media: {
              mode: "none",
              loop: false,
              enableVideo: false,
              enableImage: false,
            },
          },
          {
            id: "featured-3",
            enabled: true,
            sortOrder: 2,
            name: "Unidad de recarga",
            description:
              "Ciclo de recarga documentado. El estado vive en el sistema, no en una etiqueta estática.",
            benefit: "Historial de recargas auditable.",
            href: "#productos",
            ctaLabel: "Ver detalle",
            media: {
              mode: "none",
              loop: false,
              enableVideo: false,
              enableImage: false,
            },
          },
        ],
      },
      {
        id: "tecnologia",
        type: "technology",
        enabled: true,
        sortOrder: 2,
        title: "El sistema.",
        subtitle: "Identidad digital que se puede verificar.",
        description:
          "Cada unidad entra al sistema con un QR y un Pasaporte Digital. La verificación confirma el estado. La trazabilidad conserva el historial.",
        media: {
          mode: "none",
          loop: false,
          enableVideo: false,
          enableImage: false,
        },
        primaryCta: { href: "#tecnologia-qr", label: "Ver cómo funciona" },
        chapters: [
          {
            id: "tecnologia-qr",
            title: "QR",
            body: "Puerta de entrada al sistema. Escaneo, validación server-side y vínculo al Pasaporte — sin teatro.",
          },
          {
            id: "pasaporte-digital",
            title: "Pasaporte Digital",
            body: "Identidad de la unidad. Estados legibles, vigencia y artefacto de confianza en la misma plataforma.",
          },
          {
            id: "verificacion",
            title: "Verificación",
            body: "Dictamen inequívoco: válido, inválido, vencido o revocado. La certeza se demuestra, no se afirma.",
          },
          {
            id: "trazabilidad",
            title: "Trazabilidad",
            body: "Historial operable de escaneos, rotaciones y eventos. Auditoría como producto, no como log olvidado.",
          },
        ],
      },
      {
        id: "expert",
        type: "expert",
        enabled: true,
        sortOrder: 3,
        title: "PerGon Expert",
        subtitle: "Especialista técnico del sistema.",
        description:
          "Ingeniería de dominio: productos, QR, Pasaporte y operación. Guía con fuentes; si no hay información suficiente, lo declara.",
        media: {
          mode: "none",
          loop: false,
          enableVideo: false,
          enableImage: false,
        },
        primaryCta: { href: "/expert", label: "Consultar Expert" },
      },
      {
        id: "cta",
        type: "cta",
        enabled: true,
        sortOrder: 4,
        title: "Entra al ecosistema.",
        body: "El siguiente paso es el sistema: verificar, operar y escalar con la misma precisión.",
        media: {
          mode: "none",
          loop: false,
          enableVideo: false,
          enableImage: false,
        },
        primaryCta: { href: "#tecnologia", label: "Explorar el sistema" },
        secondaryCta: { href: "/expert", label: "Hablar con Expert" },
      },
      {
        id: "footer",
        type: "footer",
        enabled: true,
        sortOrder: 5,
        brand: "PerGon",
        description: "Sistema operativo de identidad digital y trazabilidad.",
        contact: {
          emails: ["contacto@pergon.com"],
          phones: [],
          address: undefined,
        },
        social: [],
        columns: [
          {
            title: "Links rápidos",
            links: [
              { href: "#productos", label: "Productos" },
              { href: "#tecnologia", label: "Tecnología" },
              { href: "/expert", label: "Expert" },
              { href: "#academia", label: "Academia" },
            ],
          },
        ],
        privacyLabel: "Aviso de privacidad",
        privacyHref: "#",
        termsLabel: "Términos",
        termsHref: "#",
        copyright: "© PerGon. Identidad digital y trazabilidad.",
        notices: undefined,
        blocks: {
          brand: true,
          contact: true,
          social: true,
          links: true,
          legal: true,
        },
      },
    ],
    footer: {
      brand: "PerGon",
      description: "Sistema operativo de identidad digital y trazabilidad.",
      contact: {
        emails: ["contacto@pergon.com"],
        phones: [],
        address: undefined,
      },
      social: [],
      columns: [
        {
          title: "Links rápidos",
          links: [
            { href: "#productos", label: "Productos" },
            { href: "#tecnologia", label: "Tecnología" },
            { href: "/expert", label: "Expert" },
            { href: "#academia", label: "Academia" },
          ],
        },
      ],
      privacyLabel: "Aviso de privacidad",
      privacyHref: "#",
      termsLabel: "Términos",
      termsHref: "#",
      copyright: "© PerGon. Identidad digital y trazabilidad.",
      blocks: {
        brand: true,
        contact: true,
        social: true,
        links: true,
        legal: true,
      },
    },
    seo: {
      title: "PerGon — Identidad digital y trazabilidad",
      description:
        "PerGon OS es la plataforma de identidad digital, verificación QR, Pasaporte Digital y operación. Tecnología, confianza y trazabilidad.",
    },
  };
}
