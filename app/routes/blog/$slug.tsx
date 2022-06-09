import { json, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { useEffect } from "react";
import ReactDOMServer from "react-dom/server";
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
	try {

		const post = getPost(params.slug);

		// @ts-ignore
		const article = post.default()
		const html = ReactDOMServer.renderToString(article)

		return json(html);

	} catch (err) {

		return new Response(
			"No article found with name " + params.slug,
			{ status: 404 }
		);

	}
};

export default function PostSlug() {
	const html = useLoaderData<string>();

	useEffect(() => {
		//@ts-ignore
		hljs.highlightAll();
	}, []);

	return <div className="article" dangerouslySetInnerHTML={{ __html: html }} />

};
