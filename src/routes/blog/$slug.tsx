import "./styles/route.css";
import { createFileRoute } from "@tanstack/react-router";
import { CommandLink as Link } from "../../shared/components/CommandLink";
import { findSitePost } from "../../articles";
import { ArticleLayout } from "./components/ArticleLayout";
import { useTheme } from "../../shared/theme/ThemeProvider";

const BlogPost = () => {
  const { theme } = useTheme();
  const { slug } = Route.useParams();
  const post = findSitePost(slug);
  if (!post) {
    return (
      <>
        <main className="article" data-theme={theme}>
          <h1>404 - Article not found</h1>
          <Link to="/blog">Back to Blog</Link>
        </main>
      </>
    );
  }
  const Article = post.Component;
  return (
    <>
      <main className="article" data-theme={theme}>
        <ArticleLayout title={post.title} publishedAt={post.publishedAt}>
          <Article />
        </ArticleLayout>
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
