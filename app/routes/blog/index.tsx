import { Link, useLoaderData } from "@remix-run/react";
import blogStyles from "./../../styles/blog.css"
import articleStyles from "./../../styles/article.css"
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { getPosts, Post } from "~/utils/articles";

export const loader: LoaderFunction = async (): Promise<Post[]> => {

	const posts = getPosts();

	return posts;

};

export const links: LinksFunction = () => {
	return [
		{ rel: "stylesheet", href: blogStyles },
		{ rel: "stylesheet", href: articleStyles }
	]
};

export const meta: MetaFunction = () => {
	return {
		title: "My Blog",
		description: "I often write about functional programming and TypeScript"
	};
};

export default function Posts() {
	const posts = useLoaderData<Post[]>();

	return (
		<div className="blog">

			<div className="article-container">
				{posts.map((post: Post) => <ArticleItem key={post.slug} {...post} />)}
			</div>

		</div>
	);
}

const ArticleItem = (props: Post) => {
	const { slug, title, description } = props;

	return (
		<Link className="article-item" to={slug}>
			<h2>{title}</h2>

			<p>{description}</p>
		</Link>

	)
};
