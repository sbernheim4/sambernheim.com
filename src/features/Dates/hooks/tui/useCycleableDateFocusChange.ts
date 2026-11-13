import { useEffect } from "react";

export const useCycleableDateFocusChange = (
  focused: boolean,
  onFocusChange?: (focused: boolean) => void,
) => {
  useEffect(() => {
    onFocusChange?.(focused);
  }, [focused, onFocusChange]);
};
