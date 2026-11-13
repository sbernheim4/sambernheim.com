import { useState } from "react";
import type { DetailTab } from "../components/renderer";

export const useDetailTabsModel = (
  tabs: readonly DetailTab[],
  value?: string,
  onValueChange?: (value: string) => void,
) => {
  const [localValue, setLocalValue] = useState(tabs[0]?.value);
  const activeValue =
    value !== undefined &&
    tabs.some((tab) => {
      return tab.value === value;
    })
      ? value
      : tabs.some((tab) => {
            return tab.value === localValue;
          })
        ? localValue
        : tabs[0]?.value;
  const selectedIndex = tabs.findIndex((tab) => {
    return tab.value === activeValue;
  });
  const select = (nextValue: string) => {
    if (value === undefined) {
      setLocalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return { activeValue, selectedIndex, select };
};
