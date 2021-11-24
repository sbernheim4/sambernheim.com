import { useLoaderData } from "remix";
import type { LoaderFunction, LinksFunction, MetaFunction } from "remix";
import invariant from "tiny-invariant";
import { getPost, Post } from "~/post";

export const links: LinksFunction = () => {

	return [
		{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/atom-one-dark.min.css' },
		{ rel: 'javascript', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/highlight.min.js' },
	]
}

export const meta: MetaFunction = (x) => {
	const postData = x.data as Post;

	return {
		title: postData.title,
		description: postData.description
	}
}

export const loader: LoaderFunction = async ({ params }) => {
	invariant(params.slug, "expected params.slug");

	return getPost(params.slug);
};

export default function PostSlug() {
	const Post = useLoaderData<Post>();

	return (
		<div>
			<div dangerouslySetInnerHTML={{ __html: Post.html }} />
		</div>
	);

}
