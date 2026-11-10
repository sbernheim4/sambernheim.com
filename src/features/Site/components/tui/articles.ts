import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { newestArticlesFirst, publishedArticleFiles } from "../../articleCatalog";
import { parseTuiArticle, type TuiArticle } from "./articleData";

export type { TuiArticle } from "./articleData";

export const loadTuiArticles = (): TuiArticle[] => {
  return newestArticlesFirst(
    publishedArticleFiles.map((file) => {
      const path = fileURLToPath(new URL(`../../../../articles/${file}.mdx`, import.meta.url));
      return parseTuiArticle(readFileSync(path, "utf8"));
    }),
  );
};
