import "./styles/route.css";
import { createFileRoute } from "@tanstack/react-router";
import { CommandLink as Link } from "../../shared/components/CommandLink";
import { SiteNavbar } from "../../shared/components/SiteNavbar";
import { sitePosts } from "../../articles";

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
                aria-label={post.title}
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

export const Route = createFileRoute("/blog/")({
  head: () => {
    return {
      meta: [{ title: "Blog | Samuel Bernheim" }],
    };
  },
  component: BlogIndex,
});
