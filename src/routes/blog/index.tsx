import "./styles/route.css";
import { createFileRoute } from "@tanstack/react-router";
import { CommandLink as Link } from "../../shared/components/CommandLink";
import { sitePosts } from "../../articles";
import { CycleableDate } from "../../forms/components";
import { useTheme } from "../../shared/theme/ThemeProvider";

const BlogIndex = () => {
  const { theme } = useTheme();
  const postsByDate = [...sitePosts].sort((a, b) => {
    return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  });

  return (
    <>
      <main className="blog" data-theme={theme}>
        <div className="article-container">
          {postsByDate.map((post) => {
            return (
              <div className="article-item" key={post.slug}>
                <Link
                  className="article-item-content"
                  aria-label={post.title}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                >
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                </Link>
                <CycleableDate value={post.publishedAt} className="article-date" />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export const Route = createFileRoute("/blog/")({
  head: () => {
    return {
      meta: [{ title: "Blog | Samuel Bernheim" }],
    };
  },
  component: BlogIndex,
});
