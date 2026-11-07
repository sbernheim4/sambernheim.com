import { createFileRoute } from "@tanstack/react-router";
import { sitePosts } from "../../articles";
import { BlogList, BlogListViewContext } from "@features/Site/components/BlogList";
import { WebBlogList } from "@features/Site/components/web/BlogList/BlogList";

const BlogIndex = () => {
  const articles = [...sitePosts]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .map((post) => ({
      id: post.slug,
      title: post.title,
      description: post.description,
      href: `/blog/${post.slug}`,
      publishedAt: post.publishedAt,
    }));
  return (
    <BlogListViewContext.Provider value={WebBlogList}>
      <BlogList articles={articles} />
    </BlogListViewContext.Provider>
  );
};

export const Route = createFileRoute("/blog/")({
  head: () => ({ meta: [{ title: "Blog | Samuel Bernheim" }] }),
  component: BlogIndex,
});
