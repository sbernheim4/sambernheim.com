import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Box, Text } from "ink";
import { createHighlighter } from "@tanstack/highlight/core";
import { json } from "@tanstack/highlight/languages/json";
import { plaintext } from "@tanstack/highlight/languages/plaintext";
import { shell } from "@tanstack/highlight/languages/shell";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import type { MDXComponents } from "mdx/types";

import { InternalLink, LinkAnchorBox, internalLinkPath } from "./links";

type Props = { children?: ReactNode };
const highlighter = createHighlighter({
  fallbackLanguage: "plaintext",
  languages: [json, plaintext, shell, ts, tsx],
});
const colors: Record<string, string> = {
  attr: "cyan",
  command: "cyan",
  comment: "gray",
  function: "blue",
  keyword: "magenta",
  literal: "yellow",
  meta: "gray",
  number: "yellow",
  operator: "gray",
  property: "cyan",
  string: "green",
  tag: "red",
  type: "cyan",
  variable: "blue",
};
const Inline = ({ children }: Props) => {
  return <Text>{children}</Text>;
};
const Strong = ({ children }: Props) => {
  return <Text bold>{children}</Text>;
};
const Emphasis = ({ children }: Props) => {
  return <Text italic>{children}</Text>;
};
const Strike = ({ children }: Props) => {
  return <Text strikethrough>{children}</Text>;
};
const Link = ({ children, href }: Props & { href?: string }) => {
  const path = internalLinkPath(href);
  if (path) {
    return <InternalLink href={path}>{children}</InternalLink>;
  }
  return (
    <Text color="blue" underline>
      {children}
      {href ? ` (${href})` : ""}
    </Text>
  );
};
const Image = ({ alt, src }: { alt?: string; src?: string }) => {
  return <Text dimColor>[Image: {alt || src || "image"}]</Text>;
};
const Break = () => {
  return <Text>{"\n"}</Text>;
};
const Input = ({ checked }: { checked?: boolean }) => {
  return <Text>{checked ? "[x] " : "[ ] "}</Text>;
};
const Code = ({ children, className }: Props & { className?: string }) => {
  const source = Children.toArray(children).join("");
  const language = className
    ?.split(" ")
    .find((name) => {
      return name.startsWith("language-");
    })
    ?.slice(9);
  const tokens = highlighter.tokenize(source, { lang: language }).tokens;
  return (
    <Text color={language ? undefined : "yellow"}>
      {tokens.map((token, index) => {
        return (
          <Text key={index} color={colors[token.className ?? ""]}>
            {token.value}
          </Text>
        );
      })}
    </Text>
  );
};
const inlineTypes = new Set<unknown>([
  Inline,
  Strong,
  Emphasis,
  Strike,
  Link,
  Image,
  Break,
  Input,
  Code,
]);
// Tight list items contain bare phrasing nodes, while loose items contain paragraphs.
// Group phrasing into Text and keep block components as Box children.
const Block = ({ children }: Props) => {
  const nodes: ReactNode[] = [];
  let pending: ReactNode[] = [];
  const flush = () => {
    if (pending.length) {
      nodes.push(<Text key={`text-${nodes.length}`}>{pending}</Text>);
      pending = [];
    }
  };
  const flatten = (value: ReactNode): ReactNode[] => {
    return Children.toArray(value).flatMap((child) => {
      if (isValidElement<Props>(child) && child.type === Fragment) {
        return flatten(child.props.children);
      }
      return [child];
    });
  };
  flatten(children).forEach((child) => {
    if (typeof child === "string" && !child.trim() && !pending.length) {
      return;
    }
    if (!isValidElement(child) || inlineTypes.has(child.type)) {
      pending.push(child);
    } else {
      flush();
      nodes.push(child);
    }
  });
  flush();
  return <LinkAnchorBox flexDirection="column">{nodes}</LinkAnchorBox>;
};
const Paragraph = ({ children }: Props) => {
  return (
    <LinkAnchorBox marginBottom={1}>
      <Text>{children}</Text>
    </LinkAnchorBox>
  );
};
const Heading = ({ children }: Props) => {
  return (
    <Box marginTop={1} marginBottom={1}>
      <Text bold color="cyan">
        {children}
      </Text>
    </Box>
  );
};
const Pre = ({ children }: Props) => {
  return (
    <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
      <Text>{children}</Text>
    </Box>
  );
};
const Quote = ({ children }: Props) => {
  return (
    <Box
      paddingLeft={1}
      borderStyle="single"
      borderTop={false}
      borderBottom={false}
      borderRight={false}
      borderColor="gray"
    >
      <Block>{children}</Block>
    </Box>
  );
};
const List = ({ children, start }: Props & { start?: number }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      {Children.toArray(children)
        .filter((child) => {
          return isValidElement(child);
        })
        .map((child, index) => {
          return (
            <Box key={index}>
              <Text color="cyan">{start === undefined ? "• " : `${Number(start) + index}. `}</Text>
              <Box flexDirection="column" flexShrink={1}>
                {child}
              </Box>
            </Box>
          );
        })}
    </Box>
  );
};
const OrderedList = ({ children, start = 1 }: Props & { start?: number }) => {
  return <List start={start}>{children}</List>;
};
const Rule = () => {
  return <Text dimColor>────────────────────────────────</Text>;
};
const Row = ({ children }: Props) => {
  return (
    <Box>
      {Children.toArray(children).filter((child) => {
        return isValidElement(child);
      })}
    </Box>
  );
};
const Cell = ({ children }: Props) => {
  return (
    <Box paddingRight={2} flexGrow={1} flexBasis={0}>
      <Text>{children}</Text>
    </Box>
  );
};
const HeaderCell = ({ children }: Props) => {
  return (
    <Cell>
      <Strong>{children}</Strong>
    </Cell>
  );
};

export const markdownComponents: MDXComponents = {
  wrapper: Block,
  p: Paragraph,
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,
  strong: Strong,
  b: Strong,
  em: Emphasis,
  i: Emphasis,
  del: Strike,
  s: Strike,
  a: Link,
  img: Image,
  br: Break,
  hr: Rule,
  code: Code,
  pre: Pre,
  blockquote: Quote,
  ul: List,
  ol: OrderedList,
  li: Block,
  input: Input,
  table: Block,
  thead: Block,
  tbody: Block,
  tfoot: Block,
  tr: Row,
  td: Cell,
  th: HeaderCell,
  div: Block,
  section: Block,
  article: Block,
  span: Inline,
  sup: Inline,
  sub: Inline,
  kbd: Code,
  samp: Code,
  details: Block,
  summary: Paragraph,
};
