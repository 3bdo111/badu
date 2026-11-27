"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scroll-linked drift for a product image.
 *
 * The garment appears to move with the page: it lifts a little, tilts a
 * fraction of a degree and settles at full size while it crosses the
 * viewport. Everything is a single composited transform, updated on a
 * requestAnimationFrame tick, so scrolling stays on the GPU and never
 * triggers layout.
 *
 * The effect is skipped entirely when the visitor asks for reduced motion.
 */
export function useScrollDrift(
  ref: RefObject<HTMLElement | null>,
  options: { travel?: number; tilt?: number; zoom?: number } = {}
) {
  const { travel = 26, tilt = 0.9, zoom = 0.045 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the element's top is at the bottom of the viewport,
      // 1 when its bottom has left the top.
      const progress = Math.min(
        1,
        Math.max(0, (vh - rect.top) / (vh + rect.height))
      );
      const centred = progress - 0.5;
      const lift = -centred * travel;
      const scale = 1 + (0.5 - Math.abs(centred)) * zoom * 2;
      const rotate = centred * tilt;
      el.style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotate.toFixed(3)}deg)`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const reset = () => {
      el.style.transform = "";
    };

    const start = () => {
      el.style.willChange = "transform";
      apply();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
    };

    const stop = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      reset();
      el.style.willChange = "";
    };

    if (reduce.matches) {
      reset();
    } else {
      start();
    }

    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) stop();
      else start();
    };
    reduce.addEventListener("change", onChange);

    return () => {
      reduce.removeEventListener("change", onChange);
      stop();
    };
  }, [ref, travel, tilt, zoom]);
}
