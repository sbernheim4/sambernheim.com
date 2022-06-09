import { json, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Post, getPosts } from '~/post'
import blogStyles from './../../styles/blog.css'
import articleStyles from './../../styles/article.css'

export const loader: LoaderFunction = async () => {
	return json(getPosts());
};

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: blogStyles },
		{ rel: 'stylesheet', href: articleStyles }
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
		<div className='blog'>

			<div className='article-container'>
				{posts.map((post: Post) => <ArticleItem {...post} />)}
			</div>

		</div>
	);
}

const ArticleItem = (props: Post) => {
	const { slug, title, description } = props;

	return (
		<Link className='article-item' to={slug}>
			<h2>{title}</h2>

			<p>{description}</p>
		</Link>

	)
};
