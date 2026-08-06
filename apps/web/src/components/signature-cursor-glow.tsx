"use client";

import { useEffect, useRef } from "react";

const LERP = 0.12;
const GLOW_SIZE = 480;

/**
 * Capability check for *behavior* (not mount).
 * any-pointer / any-hover: hybrid Windows (touch + mouse) still qualify.
 */
function canTrackCursorGlow(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(any-hover: hover)").matches) return false;
  if (!window.matchMedia("(any-pointer: fine)").matches) return false;
  return true;
}

/**
 * Signature cursor glow — electric radial, lerp + rAF.
 *
 * Root cause of opacity stuck at 0 (FASE 107):
 * React `style={{ opacity: 0 }}` re-applied on every render (incl. setActive),
 * overwriting rAF writes. Transform looked “alive” because rAF rewrote it
 * every frame; opacity lost the race on React commits.
 *
 * Fix: never put opacity/transform in the React style prop. CSS owns the
 * resting state; rAF owns runtime opacity + transform exclusively. No useState.
 */
export function SignatureCursorGlow() {
  const nodeRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const rafRef = useRef(0);
  const half = GLOW_SIZE / 2;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverMq = window.matchMedia("(any-hover: hover)");
    const pointerMq = window.matchMedia("(any-pointer: fine)");

    const applyActive = (next: boolean) => {
      activeRef.current = next;
      node.dataset.active = next ? "true" : "false";
      if (!next) {
        visibleRef.current = false;
        node.style.opacity = "0";
      }
    };

    applyActive(canTrackCursorGlow());

    const onCapabilityChange = () => {
      applyActive(canTrackCursorGlow());
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!activeRef.current) return;
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

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!activeRef.current) return;

      const target = targetRef.current;
      const current = currentRef.current;
      current.x += (target.x - current.x) * LERP;
      current.y += (target.y - current.y) * LERP;
      node.style.transform = `translate3d(${current.x - half}px, ${current.y - half}px, 0)`;
      node.style.opacity = visibleRef.current ? "1" : "0";
    };

    const startRaf = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopRaf();
        node.style.opacity = "0";
        visibleRef.current = false;
      } else if (activeRef.current) {
        startRaf();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMq.addEventListener("change", onCapabilityChange);
    hoverMq.addEventListener("change", onCapabilityChange);
    pointerMq.addEventListener("change", onCapabilityChange);
    startRaf();

    return () => {
      stopRaf();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMq.removeEventListener("change", onCapabilityChange);
      hoverMq.removeEventListener("change", onCapabilityChange);
      pointerMq.removeEventListener("change", onCapabilityChange);
    };
  }, [half]);

  return <div ref={nodeRef} aria-hidden className="sig-cursor-glow" data-active="false" />;
}
