import { json, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { useEffect } from "react";
import { getPost, Post } from "~/post";
import articleStyles from './../../styles/article.css'

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: articleStyles },
		{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/atom-one-dark.min.css' },
		{ rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Crimson+Text' },
		{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato&display=swap' }
	]
};

export const meta: MetaFunction = (x) => {
	const postData = x.data as Post;

	return {
		title: postData.title,
		description: postData.description
	}
};

export const loader: LoaderFunction = async ({ params }) => {
	return json(params.slug);
};

export default function PostSlug() {
	const { slug } = useParams();
	const Post = getPost(slug);

	useEffect(() => {
		//@ts-ignore
		hljs.highlightAll();
	}, []);

	return (
		<div className="article">
			{ /* @ts-ignore */}
			{Post.default()}
		</div>
	);

};

export const ErrorBoundary = (props) => {
	const { slug } = useParams();
	return (
		<div className='article'>
			<p>Uh oh, we couldn't find the article {slug}</p>
			<Link to="/blog"><p>View all available articles here</p></Link>
		</div>
	);

};
