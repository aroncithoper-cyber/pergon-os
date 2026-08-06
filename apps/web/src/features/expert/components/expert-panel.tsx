"use client";

import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@pergon/ui/components/alert";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { Label } from "@pergon/ui/components/label";
import { Textarea } from "@pergon/ui/components/textarea";
import { cn } from "@pergon/ui/lib/utils";

import { AtmosphereLayer } from "@/components/atmosphere-layer";

type AskResponse = {
  outcome: string;
  conversationId: string;
  assistantMessageId: string;
  answer: string;
  citations: Array<{ title: string; domain: string }>;
  remainingAsksToday: number;
  providerId: string | null;
};

type Turn = {
  role: "user" | "assistant";
  content: string;
  messageId?: string;
  outcome?: string;
  citations?: AskResponse["citations"];
};

function ExpertOrb({ thinking }: { thinking: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div
      className="relative mx-auto flex size-24 items-center justify-center sm:size-28"
      aria-hidden
    >
      <motion.div
        className="border-steel/40 absolute inset-0 rounded-full border"
        animate={reduce ? undefined : thinking ? { opacity: [0.35, 0.7, 0.35] } : { opacity: 0.45 }}
        transition={{ duration: thinking ? 1.6 : 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="border-signal/50 absolute inset-3 rounded-full border"
        animate={
          reduce
            ? undefined
            : thinking
              ? { scale: [1, 1.03, 1], opacity: [0.55, 1, 0.55] }
              : { opacity: 0.7 }
        }
        transition={{ duration: thinking ? 1.2 : 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="bg-elevated border-border relative size-10 rounded-full border sm:size-12" />
    </div>
  );
}

export function ExpertPanel() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product") ?? undefined;
  const passportId = searchParams.get("passport") ?? undefined;
  const qrCode = searchParams.get("qr") ?? undefined;
  const reduce = useReducedMotion();

  const contextLabel = useMemo(() => {
    const parts: string[] = [];
    if (productSlug) parts.push(`Producto · ${productSlug}`);
    if (passportId) parts.push(`Pasaporte · ${passportId}`);
    if (qrCode) parts.push(`QR · ${qrCode}`);
    return parts.length > 0 ? parts.join("  ·  ") : null;
  }, [passportId, productSlug, qrCode]);

  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");

  function ask() {
    const text = message.trim();
    if (!text || pending) return;

    setError(null);
    setTurns((prev) => [...prev, { role: "user", content: text }]);
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/v1/expert/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            conversationId,
            productSlug,
            passportId,
            qrCode,
          }),
        });
        const payload = (await response.json()) as {
          data?: AskResponse;
          error?: { message: string };
        };

        if (!response.ok || !payload.data) {
          throw new Error(payload.error?.message ?? "No se pudo consultar a PerGon Expert");
        }

        setConversationId(payload.data.conversationId);
        setRemaining(payload.data.remainingAsksToday);
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            content: payload.data!.answer,
            messageId: payload.data!.assistantMessageId,
            outcome: payload.data!.outcome,
            citations: payload.data!.citations,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    });
  }

  async function sendFeedback(messageId: string, rating: "up" | "down") {
    if (!conversationId) return;
    await fetch("/api/v1/expert/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, messageId, rating }),
    });
  }

  async function escalate() {
    if (!conversationId || !escalateReason.trim()) return;
    const response = await fetch("/api/v1/expert/escalate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, reason: escalateReason.trim() }),
    });
    if (response.ok) {
      setEscalateOpen(false);
      setEscalateReason("");
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Consulta escalada a soporte humano. Un operador podrá continuar desde Admin.",
          outcome: "escalated",
        },
      ]);
    }
  }

  return (
    <div className="surface-atmosphere relative min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
      <AtmosphereLayer />
      <Container size="lg" className="relative z-10 py-16 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-20">
          <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
            <ExpertOrb thinking={pending} />
            <header className="type-voice text-center lg:text-left">
              <p className="type-label text-signal">Laboratorio técnico</p>
              <h1 className="type-display-xl text-foreground">PerGon Expert</h1>
              <p className="type-lead text-muted-foreground mx-auto lg:mx-0">
                Especialista de dominio: productos, diluciones, fichas, seguridad, Pasaporte Digital
                y QR. Responde con fuentes. Si no hay información suficiente, lo declara.
              </p>
            </header>

            {contextLabel ? (
              <div className="sig-data">
                <p className="sig-data-label">Contexto de sesión</p>
                <p className="sig-data-value mt-2">{contextLabel}</p>
              </div>
            ) : (
              <p className="type-caption text-muted-foreground text-pretty">
                Sin contexto de producto o pasaporte. Añada `?product=`, `?passport=` o `?qr=` a la
                URL.
              </p>
            )}

            {remaining !== null ? (
              <p className="type-caption text-muted-foreground font-mono">
                Consultas restantes hoy · {remaining}
              </p>
            ) : null}
          </aside>

          <div className="sig-instrument relative space-y-8 overflow-hidden p-6 md:space-y-10 md:p-9">
            <div
              className="via-signal/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="type-label text-muted-foreground">Instrumento de consulta</p>
              <p className="type-caption text-muted-foreground font-mono tracking-[0.12em]">
                SESSION · CONTROLLED
              </p>
            </div>
            <section aria-label="Consulta" aria-busy={pending} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="expert-message" className="type-caption text-muted-foreground">
                  Entrada técnica
                </Label>
                <Textarea
                  id="expert-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ej.: ¿Cómo verifico un Pasaporte Digital? ¿Qué implica un QR rotado?"
                  rows={5}
                  disabled={pending}
                  className="bg-background/60 min-h-[9rem] resize-y"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="signal"
                  size="lg"
                  onClick={ask}
                  disabled={pending || !message.trim()}
                >
                  {pending ? "Procesando…" : "Ejecutar consulta"}
                </Button>
                {pending ? (
                  <span
                    className="type-caption text-cyan tracking-wide"
                    role="status"
                    aria-live="polite"
                  >
                    Generando dictamen
                  </span>
                ) : null}
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>No se completó la consulta</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </section>

            {turns.length > 0 ? (
              <section aria-label="Dictamen" className="space-y-6">
                {turns.map((turn, index) => (
                  <motion.article
                    key={`${turn.role}-${index}`}
                    className={cn(
                      "border-border border-l-2 px-5 py-4",
                      turn.role === "assistant"
                        ? "border-l-signal/50 bg-panel/40"
                        : "border-l-steel/40",
                    )}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="type-label text-muted-foreground">
                      {turn.role === "user" ? "Entrada" : "Dictamen"}
                      {turn.outcome ? ` · ${turn.outcome}` : ""}
                    </p>
                    <p className="type-body text-foreground mt-4 whitespace-pre-wrap">
                      {turn.content}
                    </p>
                    {turn.citations && turn.citations.length > 0 ? (
                      <ul className="border-border mt-3 space-y-1 border-l pl-4">
                        {turn.citations.map((cite, citeIndex) => (
                          <li
                            key={`${cite.title}-${citeIndex}`}
                            className="text-muted-foreground text-xs"
                          >
                            Fuente · {cite.title} ({cite.domain})
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {turn.role === "assistant" && turn.messageId ? (
                      <div className="flex flex-wrap gap-2 pt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void sendFeedback(turn.messageId!, "up")}
                          aria-label="Útil"
                        >
                          <ThumbsUp className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void sendFeedback(turn.messageId!, "down")}
                          aria-label="No útil"
                        >
                          <ThumbsDown className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    ) : null}
                  </motion.article>
                ))}
              </section>
            ) : null}

            {conversationId ? (
              <section className="border-border/50 space-y-4 border-t pt-6">
                <h2 className="type-h3 text-foreground">Soporte humano</h2>
                {!escalateOpen ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEscalateOpen(true)}
                  >
                    Escalar a soporte
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="escalate-reason">Motivo</Label>
                    <Textarea
                      id="escalate-reason"
                      value={escalateReason}
                      onChange={(event) => setEscalateReason(event.target.value)}
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="signal"
                        onClick={() => void escalate()}
                      >
                        Enviar escalamiento
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEscalateOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}
