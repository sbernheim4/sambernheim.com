// The published article selection shared by both renderers.
export const publishedArticleFiles = [
  "how-i-engineer-software",
  "react-patterns",
  "rerender-with-route",
  "log-and-continue",
  "debug-driven-development",
  "the-party-math-trick",
  "building-a-monad",
  "monads-are-monoids-in-the-category-of-endofunctors",
  "the-engineers-schrodingers-cat",
  "ux-design-patterns",
  "higher-level-primitives",
] as const;

export const newestArticlesFirst = <T extends { publishedAt: string }>(
  articles: readonly T[],
): T[] => {
  return [...articles].sort((a, b) => {
    return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  });
};
