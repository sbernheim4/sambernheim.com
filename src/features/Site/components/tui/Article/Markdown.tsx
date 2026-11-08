import { useMemo } from "react";
import { Text } from "ink";
import { articleComponents } from "./ArticleComponents";
import { compileMarkdown } from "./markdown/compile";
import { markdownComponents } from "./markdown/primitives";

// Evaluate only trusted article source: MDX expressions execute JavaScript.
export const compileArticleMarkdown = (source: string) => {
  return compileMarkdown(source, { ...markdownComponents, ...articleComponents });
};

export const ArticleMarkdown = ({ source }: { source: string }) => {
  const compiled = useMemo(() => {
    try {
      return { Content: compileArticleMarkdown(source) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [source]);
  if (!compiled.Content) {
    return <Text color="red">Unable to render article: {compiled.error}</Text>;
  }
  return <compiled.Content />;
};
