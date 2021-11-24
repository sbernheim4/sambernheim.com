import { Link, LoaderFunction, useLoaderData } from "remix";
import { getPosts } from '~/post'
import type { Post } from '~/post';
// import { useEffect, useState } from "react";

export const loader: LoaderFunction = () => {
	const posts = getPosts();

	return posts;
};

export default function Posts() {
	const loadedPosts = useLoaderData<Post[]>();

	return (
		<div>
			<h1>Posts</h1>

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
