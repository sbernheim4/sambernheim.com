import { Link, LinksFunction, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { Post, getPosts } from '~/post'
import blogStyles from './../../styles/blog.css'

export const loader: LoaderFunction = () => {
	const posts = getPosts();

	return posts;
};

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: blogStyles }
	]
};

export const meta: MetaFunction = () => {
	return {
		title: "My Blog",
		description: "I often write about functional programming and other vaiours ideas in software engineering."
	};
};

export default function Posts() {
	const loadedPosts = useLoaderData<Post[]>();

	return (
		<div className='blog'>
			<h1>My Blog</h1>

			<ul>
				{loadedPosts.map(post => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>

		</div>
   );
};
