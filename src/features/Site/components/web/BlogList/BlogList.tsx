import "./BlogList.css";
import { CommandLink as Link, CycleableDate } from "@/features";
import { parseDateOnly } from "@/utils";
import type { BlogListView } from "../../BlogList";
export const WebBlogList: BlogListView = ({ articles }) => {
  return (
    <main className="blog">
      <div className="article-container">
        {articles.map((article) => {
          return (
            <div className="article-item" key={article.id}>
              <Link className="article-item-content" aria-label={article.title} to={article.href}>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
              </Link>
              {article.publishedAt && (
                <CycleableDate
                  value={parseDateOnly(article.publishedAt)}
                  className="article-date"
                />
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};
