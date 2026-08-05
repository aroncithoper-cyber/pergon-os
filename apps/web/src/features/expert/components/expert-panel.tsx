"use client";

import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@pergon/ui/components/alert";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { Label } from "@pergon/ui/components/label";
import { Separator } from "@pergon/ui/components/separator";
import { Textarea } from "@pergon/ui/components/textarea";

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

export function ExpertPanel() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product") ?? undefined;
  const passportId = searchParams.get("passport") ?? undefined;
  const qrCode = searchParams.get("qr") ?? undefined;

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
    <Container size="lg" className="py-14 md:py-20">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <header className="space-y-5">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Ingeniero técnico digital
            </p>
            <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              PerGon Expert
            </h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              Especialista de dominio: productos, diluciones, fichas, seguridad, Pasaporte Digital y
              QR. Responde con fuentes. Si no hay información suficiente, lo declara.
            </p>
          </header>

          {contextLabel ? (
            <div className="border-border space-y-2 border-y py-4">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Contexto</p>
              <p className="text-foreground font-mono text-xs leading-relaxed">{contextLabel}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Sin contexto de producto o pasaporte. Puede añadir `?product=`, `?passport=` o `?qr=`
              a la URL.
            </p>
          )}

          {remaining !== null ? (
            <p className="text-muted-foreground font-mono text-xs">
              Consultas restantes hoy · {remaining}
            </p>
          ) : null}
        </aside>

        <div className="space-y-10">
          <section aria-label="Consulta" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expert-message">Consulta técnica</Label>
              <Textarea
                id="expert-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ej.: ¿Cómo verifico un Pasaporte Digital? ¿Qué implica un QR rotado?"
                rows={5}
                disabled={pending}
                className="min-h-[8rem] resize-y"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={ask} disabled={pending || !message.trim()}>
                {pending ? "Consultando…" : "Consultar especialista"}
              </Button>
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>No se completó la consulta</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </section>

          {turns.length > 0 ? (
            <>
              <Separator />
              <section aria-label="Dictamen" className="space-y-10">
                {turns.map((turn, index) => (
                  <article key={`${turn.role}-${index}`} className="space-y-3">
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
                      {turn.role === "user" ? "Consulta" : "Dictamen"}
                      {turn.outcome ? ` · ${turn.outcome}` : ""}
                    </p>
                    <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed sm:text-[15px]">
                      {turn.content}
                    </p>
                    {turn.citations && turn.citations.length > 0 ? (
                      <ul className="border-border space-y-1 border-l pl-4">
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
                      <div className="flex flex-wrap gap-2 pt-1">
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
                  </article>
                ))}
              </section>
            </>
          ) : null}

          {conversationId ? (
            <>
              <Separator />
              <section className="space-y-4">
                <h2 className="text-foreground text-base font-semibold tracking-tight">
                  Soporte humano
                </h2>
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
                      <Button type="button" size="sm" onClick={() => void escalate()}>
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
            </>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
