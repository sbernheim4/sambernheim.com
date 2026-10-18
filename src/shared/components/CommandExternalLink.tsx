import { forwardRef, useRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import {
  getCommandLabel,
  useAutomaticCommandAction,
  type CommandOverride,
} from "../commands/commands";

type CommandExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  command?: CommandOverride;
  children?: ReactNode;
};

export const CommandExternalLink = forwardRef<HTMLAnchorElement, CommandExternalLinkProps>(
  ({ command, children, ...props }, ref) => {
    const anchorRef = useRef<HTMLAnchorElement>(null);

    useAutomaticCommandAction({
      kind: "link",
      label: props["aria-label"] ?? getCommandLabel(children),
      command,
      execute: () => {
        anchorRef.current?.click();
      },
    });

    return (
      <a
        ref={(element) => {
          anchorRef.current = element;
          if (typeof ref === "function") {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        {...props}
      >
        {children}
      </a>
    );
  },
);

CommandExternalLink.displayName = "CommandExternalLink";
