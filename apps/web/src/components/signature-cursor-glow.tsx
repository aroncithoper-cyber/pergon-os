"use client";

import { useEffect, useRef, useState } from "react";

const LERP = 0.12;
const GLOW_SIZE = 480;

function canUseCursorGlow(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  return true;
}

/**
 * Signature cursor glow — electric radial with lerp + requestAnimationFrame.
 * No filter:blur. No per-frame React state. Off on touch and reduced-motion.
 */
export function SignatureCursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const rafRef = useRef(0);
  const half = GLOW_SIZE / 2;

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMq = window.matchMedia("(hover: hover) and (pointer: fine)");

    const applyEnabled = (next: boolean) => {
      enabledRef.current = next;
      setEnabled(next);
      if (!next) {
        visibleRef.current = false;
        const node = nodeRef.current;
        if (node) node.style.opacity = "0";
      }
    };

    applyEnabled(canUseCursorGlow());

    const onCapabilityChange = () => {
      applyEnabled(canUseCursorGlow());
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!enabledRef.current) return;
      if (event.pointerType !== "mouse") return;
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      if (!visibleRef.current) {
        currentRef.current.x = event.clientX;
        currentRef.current.y = event.clientY;
      }
      visibleRef.current = true;
    };

    const onPointerLeave = () => {
      visibleRef.current = false;
    };

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!enabledRef.current || document.hidden) return;

      const node = nodeRef.current;
      if (!node) return;

      const target = targetRef.current;
      const current = currentRef.current;
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      node.style.transform = `translate3d(${current.x - half}px, ${current.y - half}px, 0)`;
      node.style.opacity = visibleRef.current ? "1" : "0";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    reduceMq.addEventListener("change", onCapabilityChange);
    pointerMq.addEventListener("change", onCapabilityChange);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      reduceMq.removeEventListener("change", onCapabilityChange);
      pointerMq.removeEventListener("change", onCapabilityChange);
    };
  }, [half]);

  if (!enabled) return null;

  return (
    <div
      ref={nodeRef}
      aria-hidden
      className="sig-cursor-glow"
      style={{
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        opacity: 0,
        transform: `translate3d(-${GLOW_SIZE}px, -${GLOW_SIZE}px, 0)`,
      }}
    />
  );
}
