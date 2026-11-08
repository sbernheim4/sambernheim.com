import { createContext, useContext, type ComponentType } from "react";

export type BlogArticle = {
  id: string;
  title: string;
  description: string;
  href: string;
  publishedAt?: string;
};
export type BlogListView = ComponentType<{ articles: readonly BlogArticle[] }>;
export const BlogListViewContext = createContext<BlogListView | null>(null);
export const BlogList = ({ articles }: { articles: readonly BlogArticle[] }) => {
  const View = useContext(BlogListViewContext);
  if (!View) {
    throw new Error("BlogListView provider is missing");
  }
  return <View articles={articles} />;
};
