import { Link, LoaderFunction, useLoaderData } from "remix";
import { getPosts } from "~/post";

type Post = {
	slug: string;
	title: string;
};

export const loader: LoaderFunction = () => {
	const posts = getPosts();

	return posts;
};

export default function Posts() {
	const posts = useLoaderData<Post[]>();

	return (
		<div>
			<h1>Posts</h1>

			<ul>
				{posts.map(post => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>

		</div>
   );
};
