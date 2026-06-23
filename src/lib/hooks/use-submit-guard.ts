import { useCallback, useRef } from "react";

/** Prevents duplicate async submits (e.g. double/triple tap on mobile). */
export function useSubmitGuard() {
  const inFlightRef = useRef(false);

  const runGuarded = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      if (inFlightRef.current) return undefined;
      inFlightRef.current = true;
      try {
        return await fn();
      } catch (error) {
        inFlightRef.current = false;
        throw error;
      }
    },
    []
  );

  const release = useCallback(() => {
    inFlightRef.current = false;
  }, []);

  const lock = useCallback(() => {
    inFlightRef.current = true;
  }, []);

  return { runGuarded, release, lock };
}
