import { useState } from "react";

export const useDetailSectionModel = ({
  open,
  defaultOpen = true,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const isOpen = open ?? localOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) {
      setLocalOpen(next);
    }
    onOpenChange?.(next);
  };

  return {
    isOpen,
    setOpen,
    toggle: () => {
      setOpen(!isOpen);
    },
  };
};
