"use client";

import { useEffect, useRef, useState } from "react";

const LERP = 0.12;
const GLOW_SIZE = 480;

/**
 * Capability check for *behavior* (not mount).
 * Uses any-pointer / any-hover so hybrid Windows laptops with a mouse still qualify.
 * Primary `pointer: fine` alone often fails on touch+mouse devices → glow never enabled.
 */
function canTrackCursorGlow(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(any-hover: hover)").matches) return false;
  if (!window.matchMedia("(any-pointer: fine)").matches) return false;
  return true;
}

/**
 * Signature cursor glow — electric radial with lerp + requestAnimationFrame.
 * Always mounts `.sig-cursor-glow` in the DOM. Tracking/opacity are gated by capability.
 */
export function SignatureCursorGlow() {
  const [active, setActive] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const rafRef = useRef(0);
  const half = GLOW_SIZE / 2;

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverMq = window.matchMedia("(any-hover: hover)");
    const pointerMq = window.matchMedia("(any-pointer: fine)");

    const applyActive = (next: boolean) => {
      activeRef.current = next;
      setActive(next);
      if (!next) {
        visibleRef.current = false;
        const node = nodeRef.current;
        if (node) {
          node.style.opacity = "0";
          node.dataset.active = "false";
        }
      } else if (nodeRef.current) {
        nodeRef.current.dataset.active = "true";
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

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!activeRef.current || document.hidden) return;

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
    hoverMq.addEventListener("change", onCapabilityChange);
    pointerMq.addEventListener("change", onCapabilityChange);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      reduceMq.removeEventListener("change", onCapabilityChange);
      hoverMq.removeEventListener("change", onCapabilityChange);
      pointerMq.removeEventListener("change", onCapabilityChange);
    };
  }, [half]);

  // Always mount — never return null (root cause of missing DevTools node).
  return (
    <div
      ref={nodeRef}
      aria-hidden
      className="sig-cursor-glow"
      data-active={active ? "true" : "false"}
      style={{
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        opacity: 0,
        transform: `translate3d(-${GLOW_SIZE}px, -${GLOW_SIZE}px, 0)`,
      }}
    />
  );
}
