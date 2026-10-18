import "./styles/route.css";
import "highlight.js/styles/atom-one-dark.css";
import { createFileRoute } from "@tanstack/react-router";
import { CommandLink as Link } from "../../shared/components/CommandLink";
import { SiteNavbar } from "../../shared/components/SiteNavbar";
import { findSitePost } from "../../articles";

const BlogPost = () => {
  const { slug } = Route.useParams();
  const post = findSitePost(slug);
  if (!post) {
    return (
      <>
        <SiteNavbar />
        <main className="article">
          <h1>404 - Article not found</h1>
          <Link to="/blog">Back to Blog</Link>
        </main>
      </>
    );
  }
  const Article = post.Component;
  return (
    <>
      <SiteNavbar />
      <main className="article">
        <Article />
      </main>
    </>
  );
};

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = findSitePost(params.slug);
    return {
      meta: [
        { title: post ? `${post.title} | Samuel Bernheim` : "Article not found | Samuel Bernheim" },
      ],
    };
  },
  component: BlogPost,
});
