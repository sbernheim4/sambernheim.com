import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import {
  getCommandLabel,
  useAutomaticCommandAction,
  type CommandOverride,
} from "../commands/commands";

export type CommandButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  command?: CommandOverride;
  children?: ReactNode;
};

export const CommandButton = ({ command, children, disabled, ...props }: CommandButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useAutomaticCommandAction({
    kind: "button",
    label: props["aria-label"] ?? getCommandLabel(children),
    command: command === false ? false : { ...command, enabled: command?.enabled ?? !disabled },
    execute: () => {
      buttonRef.current?.click();
    },
  });

  return (
    <button ref={buttonRef} {...props} disabled={disabled}>
      {children}
    </button>
  );
};
