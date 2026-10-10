import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

const DURATION_MS = 700;

const easeOutCubic = (progress: number): number => 1 - (1 - progress) ** 3;

// Whole targets stay whole on the way and others keep one decimal, so the figure does not flicker.
export const useCountUp = (target: number): number => {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    const precision = Number.isInteger(target) ? 1 : 10;
    const startedAt = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - startedAt) / DURATION_MS, 1);
      setValue(
        progress === 1
          ? target
          : Math.round(target * easeOutCubic(progress) * precision) / precision,
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    // Frames do not run in a background tab, so a timer makes sure the figure still lands.
    const fallback = setTimeout(() => setValue(target), DURATION_MS + 100);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
    };
  }, [target, reducedMotion]);

  return value;
};
