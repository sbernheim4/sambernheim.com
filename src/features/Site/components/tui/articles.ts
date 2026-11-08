import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { newestArticlesFirst, publishedArticleFiles } from "../../articleCatalog";

export type TuiArticle = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  href: string;
  content: string;
};

export const loadTuiArticles = (): TuiArticle[] => {
  const articles = publishedArticleFiles.map((file) => {
    const path = fileURLToPath(new URL(`../../../../articles/${file}.mdx`, import.meta.url));
    const content = readFileSync(path, "utf8");
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const { meta } = parse(frontmatter?.[1] ?? "");
    return {
      id: meta.slug as string,
      title: (meta.title as string).replace(/\b\w[\w']*/g, (word, offset) => {
        if (
          offset > 0 &&
          ["a", "an", "and", "as", "at", "for", "in", "of", "the", "to"].includes(
            word.toLowerCase(),
          )
        ) {
          return word.toLowerCase();
        }
        return word[0].toUpperCase() + word.slice(1);
      }),
      description: meta.description as string,
      publishedAt: meta.publishedAt as string,
      href: `/blog/${meta.slug}`,
      content,
    };
  });
  return newestArticlesFirst(articles);
};
