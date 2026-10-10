import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(QUERY).matches;

export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
};
