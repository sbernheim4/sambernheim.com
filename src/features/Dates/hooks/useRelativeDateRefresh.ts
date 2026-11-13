import { useEffect, useState } from "react";

export const useRelativeDateRefresh = (enabled: boolean, interval: number) => {
  const [, refresh] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timer = setInterval(() => {
      refresh((current) => {
        return current + 1;
      });
    }, interval);
    return () => {
      clearInterval(timer);
    };
  }, [enabled, interval]);
};
