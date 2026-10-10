import { useEffect, useState } from "react";

const TICK_MS = 30_000;

/** The current time, refreshed twice a minute so countdowns stay up to date. */
export const useNow = (): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
};
