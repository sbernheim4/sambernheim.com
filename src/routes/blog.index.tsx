import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNavbar } from "../site/components/SiteNavbar";
import { sitePosts } from "../site/articles";

const BlogIndex = () => {
  return (
    <>
      <SiteNavbar />
      <main className="site-blog">
        <header>
          <h1>My Blog</h1>
          <p>I often write about functional programming and TypeScript.</p>
        </header>
        <div className="site-article-list">
          {sitePosts.map((post) => {
            return (
              <Link
                className="site-article-item"
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
              >
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
};

export const Route = createFileRoute("/blog/")({ component: BlogIndex });
