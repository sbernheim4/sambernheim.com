import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import { Box, Text, type BoxProps, type DOMElement } from "ink";
import type { ReactNode } from "react";
import { useArticleControl } from "../ArticleFocus";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";
import { useAutomaticCommandAction } from "@features/Commands/commands";

const LinkAnchor = createContext<RefObject<DOMElement | null> | null>(null);

// Ink Text has no ref. Inline links register against their enclosing layout box
// so the viewer can scroll to the paragraph without inserting a Box into Text.
export const LinkAnchorBox = ({ children, ...props }: BoxProps & { children?: ReactNode }) => {
  const ref = useRef<DOMElement>(null);
  return (
    <LinkAnchor.Provider value={ref}>
      <Box {...props} ref={ref}>
        {children}
      </Box>
    </LinkAnchor.Provider>
  );
};

export const InternalLink = ({ children, href }: { children?: ReactNode; href: string }) => {
  const navigate = useTuiWorkspaceNavigation();
  const anchor = useContext(LinkAnchor);
  useAutomaticCommandAction({
    kind: "link",
    label: `Open ${href}`,
    command: { group: "Article links" },
    execute: () => {
      navigate(href);
    },
  });
  const { focused, ref } = useArticleControl({
    label: `Open ${href}`,
    onActivate: () => {
      navigate(href);
    },
  });
  useEffect(() => {
    ref.current = anchor?.current ?? null;
    return () => {
      ref.current = null;
    };
  }, [anchor, ref]);
  return (
    <Text color="blue" underline inverse={focused}>
      {children}
      {focused ? " · Enter" : ""}
    </Text>
  );
};

export const internalLinkPath = (href?: string) => {
  if (!href) {
    return undefined;
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }
  const local = /^(?:https?:\/\/)?(?:www\.)?sambernheim\.com(\/.*)?$/.exec(href);
  return local ? local[1] || "/" : undefined;
};
