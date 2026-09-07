import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNavbar } from "../site/components/SiteNavbar";
import { findSitePost } from "../site/articles";

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

export const Route = createFileRoute("/blog/$slug")({ component: BlogPost });
