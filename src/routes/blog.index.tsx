import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNavbar } from "../components/SiteNavbar";
import { sitePosts } from "../articles";

const BlogIndex = () => {
  return (
    <>
      <SiteNavbar />
      <main className="blog">
        <div className="article-container">
          {sitePosts.map((post) => {
            return (
              <Link
                className="article-item"
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
