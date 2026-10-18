import { createLink } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import {
  getCommandLabel,
  useAutomaticCommandAction,
  type CommandOverride,
} from "../commands/commands";

type CommandAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  command?: CommandOverride;
  children?: ReactNode;
};

const CommandAnchor = forwardRef<HTMLAnchorElement, CommandAnchorProps>(
  ({ command, children, ...props }, ref) => {
    useAutomaticCommandAction({
      kind: "link",
      label: props["aria-label"] ?? getCommandLabel(children),
      command,
      execute: () => {
        (ref as React.RefObject<HTMLAnchorElement>).current?.click();
      },
    });

    return (
      <a ref={ref} {...props}>
        {children}
      </a>
    );
  },
);

CommandAnchor.displayName = "CommandAnchor";

export const CommandLink = createLink(CommandAnchor);
