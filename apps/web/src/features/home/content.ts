/**
 * Home — copy estructural de experiencia.
 * Vende confianza tecnológica y sistema, no commodity químico.
 */

export const homeNav = [
  { href: "#productos", label: "Productos" },
  { href: "#sistema", label: "Sistema" },
  { href: "/expert", label: "Expert" },
  { href: "#contacto", label: "Contacto" },
] as const;

export const heroContent = {
  brand: "PerGon",
  headline: "Identidad digital para cada unidad.",
  support:
    "Un sistema operativo de producto: trazabilidad, verificación y operación en la misma plataforma.",
  primaryCta: { href: "#sistema", label: "Conocer el sistema" },
  secondaryCta: { href: "/expert", label: "Consultar Expert" },
  visualAlt: "Plano del Pasaporte Digital y QR PerGon",
} as const;

export const productsContent = {
  id: "productos",
  title: "Catálogo con identidad.",
  description:
    "Cada unidad física se presenta anclada a su pasaporte digital. El listado público se publica desde el sistema — sin vitrina genérica.",
  slots: [
    { key: "featured-1", label: "01", note: "Publicación pendiente desde Admin" },
    { key: "featured-2", label: "02", note: "Publicación pendiente desde Admin" },
    { key: "featured-3", label: "03", note: "Publicación pendiente desde Admin" },
  ],
} as const;

export const whyContent = {
  id: "por-que",
  title: "Por qué existe PerGon",
  description:
    "No somos una vitrina de commodities. Somos la capa tecnológica que hace verificable el origen, el estado y la confianza de cada unidad.",
  pillars: [
    {
      title: "Tecnología",
      body: "Identidad, operación y verificación en una arquitectura de plataforma — no un sitio de catálogo.",
    },
    {
      title: "Confianza",
      body: "Prueba operativa sobre claims. Lo que no se puede verificar no se exhibe como certeza.",
    },
    {
      title: "Precisión",
      body: "Estados claros, auditoría y mantenimiento. La calidad se siente en el software y en el producto.",
    },
  ],
} as const;

export const systemContent = {
  id: "sistema",
  chapters: [
    {
      id: "tecnologia-qr",
      title: "Tecnología QR",
      body: "El QR es la puerta de verificación: escaneo, validación y vínculo al historial. Resultado inequívoco, sin teatro.",
    },
    {
      id: "pasaporte-digital",
      title: "Pasaporte Digital",
      body: "El artefacto de identidad PerGon. Emisión, estados y lectura pública con solemnidad operativa.",
    },
    {
      id: "pergon-expert",
      title: "PerGon Expert",
      body: "Especialista técnico con contexto del sistema. Guía con fuentes; si no hay información suficiente, lo declara.",
      href: "/expert",
    },
    {
      id: "academia",
      title: "Academia",
      body: "Formación sobre el sistema, el pasaporte y la verificación. Conocimiento que escala la confianza del ecosistema.",
    },
  ],
} as const;

export const ecosystemContent = {
  id: "ecosistema",
  distributors: {
    title: "Distribuidores",
    body: "Red alineada al sistema PerGon. El directorio se publica cuando los criterios operativos estén listos.",
  },
  comparator: {
    title: "Comparador",
    body: "Contraste por criterios de dominio — no una tabla de marketing vacía.",
  },
  calculators: {
    title: "Calculadoras",
    body: "Utilidades de decisión ligadas al producto y a la operación, con datos reales del catálogo.",
  },
} as const;

export const casesContent = {
  id: "casos",
  title: "Evidencia, no testimonios",
  description: "Publicaremos casos documentados cuando existan. Aquí no hay métricas inventadas.",
  emptyTitle: "Casos en documentación",
  emptyDescription:
    "Esta sección espera evidencia real: contexto, problema, sistema aplicado y resultado verificable.",
} as const;

export const finalCtaContent = {
  id: "contacto",
  title: "Confianza operable.",
  body: "El siguiente paso es el sistema: verificar, operar y escalar con la misma precisión.",
  primaryCta: { href: "#sistema", label: "Explorar el sistema" },
  secondaryCta: { href: "/expert", label: "Hablar con Expert" },
} as const;

export const footerContent = {
  brand: "PerGon",
  tagline: "Sistema operativo de identidad digital y trazabilidad.",
  columns: [
    {
      title: "Producto",
      links: [
        { href: "#productos", label: "Productos" },
        { href: "#tecnologia-qr", label: "QR" },
        { href: "#pasaporte-digital", label: "Pasaporte" },
        { href: "/expert", label: "Expert" },
      ],
    },
    {
      title: "Ecosistema",
      links: [
        { href: "#ecosistema", label: "Distribuidores" },
        { href: "#comparador", label: "Comparador" },
        { href: "#calculadoras", label: "Calculadoras" },
        { href: "#academia", label: "Academia" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "#", label: "Privacidad — pendiente" },
        { href: "#", label: "Términos — pendiente" },
      ],
    },
  ],
} as const;
