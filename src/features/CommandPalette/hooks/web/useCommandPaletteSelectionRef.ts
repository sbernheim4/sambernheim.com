import { useEffect, useRef } from "react";

export const useCommandPaletteSelectionRef = (selected: number) => {
  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedOptionRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  return selectedOptionRef;
};
