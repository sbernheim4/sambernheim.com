import { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Post, getPosts } from "~/post"
import blogStyles from "./../../styles/blog.css"
import articleStyles from "./../../styles/article.css"

export const loader: LoaderFunction = async () => {
	return getPosts();
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


export const ErrorBoundary = ({ error }) => {
	window.location.href = "https://www.sambernheim.com/blog";
};

export default function Posts() {
	const posts = useLoaderData<Post[]>();

	return (
		<div className="blog">

			<div className="article-container">
				{posts.map((post: Post) => <ArticleItem key={post.slug} {...post} />)}
			</div>

			<p className="secret">2</p>
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
