import type { ReactNode } from "react";
import { CycleableDate } from "@/features";
import "./ArticleLayout.css";
import "./ArticlePage.css";

export const ArticleLayout = ({
  title,
  publishedAt,
  children,
}: {
  title: string;
  publishedAt: string;
  children: ReactNode;
}) => {
  return (
    <>
      <header className="article-header">
        <h1>{title}</h1>
        <p className="article-published">
          Published on: <CycleableDate value={publishedAt} />
        </p>
      </header>
      {children}
    </>
  );
};
