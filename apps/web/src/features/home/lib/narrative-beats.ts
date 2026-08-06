export type NarrativeTone = "void" | "stage" | "panel";

export type NarrativeBeat = {
  index: number;
  question: string;
  tone: NarrativeTone;
};

/** Maps CMS block types to narrative beats (visual chrome only). */
export function beatForSectionType(type: string, ordinal: number): NarrativeBeat | null {
  const catalog: Record<string, Omit<NarrativeBeat, "index">> = {
    hero: { question: "¿Qué es PerGon?", tone: "void" },
    why: { question: "¿Por qué existe?", tone: "panel" },
    technology: { question: "¿Cómo funciona?", tone: "void" },
    system: { question: "¿Qué lo hace diferente?", tone: "stage" },
    featured_products: { question: "¿Qué productos controla?", tone: "panel" },
    cases: { question: "¿Por qué confiar?", tone: "void" },
    ecosystem: { question: "¿Cómo se integra?", tone: "stage" },
    expert: { question: "¿Cómo verifico y consulto?", tone: "void" },
    cta: { question: "Quiero empezar.", tone: "panel" },
    final_cta: { question: "Quiero empezar.", tone: "panel" },
  };

  const base = catalog[type];
  if (!base) return null;
  return { index: ordinal, ...base };
}
