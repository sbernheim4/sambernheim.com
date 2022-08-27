import ReactDOMServer from "react-dom/server";
import articleStyles from './../../styles/article.css'
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { Option } from 'excoptional';
import { getArticleMap, getPost, getPostMetadata } from '~/utils/articles';
import { useEffect } from "react";
import { useLoaderData } from "@remix-run/react";

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: articleStyles },
		{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/atom-one-dark.min.css' },
		{ rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Crimson+Text' },
		{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato&display=swap' }
	]
};

export const meta: MetaFunction = (args) => {

	const articleMap = getArticleMap();

	const { slug } = args.params;

	const metadata = Option.of(slug)
		.map((slug) => articleMap[slug])
		.flatMap(Option.of)
		.map(getPostMetadata)
		.getOrElse({
			title: 'Blog post not found :(',
			description: 'I often write about functional programming and TypeScript'
		});

	return metadata;

};

export const loader: LoaderFunction = async ({ params }) => {

	const response = Option.of(getPost(params.slug))
		.map(post => post.default())
		.map(ReactDOMServer.renderToString)
		.map(html => new Response(html, { status: 200 }))
		.getOrElse(new Response(
			"<h1>404 - Uh Oh :( <br /> No article found with name " + params.slug + "</h1><br /><h1><a href='/blog'>Back to Blog</a></h1>",
			{ status: 404 })
		);

	return response;

};

export default function PostSlug() {
	const html = useLoaderData<string>();

	useEffect(() => {
		//@ts-ignore
		hljs.highlightAll();
	}, []);

	return <div className="article" dangerouslySetInnerHTML={{ __html: html }} />

};
