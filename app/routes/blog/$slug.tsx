import { meta as blogMetaFunction } from './index';
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import articleStyles from './../../styles/article.css'
import { json } from '@remix-run/cloudflare';
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { getArticleMap, getPost, getPostMetadata } from '~/utils/articles';

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: articleStyles },
		{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/atom-one-dark.min.css' },
		{ rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Crimson+Text' },
		{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato&display=swap' }
	]
};

export const meta: MetaFunction = (args) => {
	try {

		const articleMap = getArticleMap();

		const slug = args.params.slug as keyof typeof articleMap;

		const postData = getPostMetadata(
			// ts-ignore
			articleMap[slug]
		)

		const metadata = {
			title: postData.title,
			description: postData.description
		}

		return metadata;

	} catch (error) {

		return blogMetaFunction(args)

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
			"<h1>404 - Uh Oh :( <br /> No article found with name " +
			params.slug +
			"</h1><br /><h1><a href='/blog'>Back to Blog</a></h1>",
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
