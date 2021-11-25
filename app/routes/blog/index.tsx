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

			<div className='article-container'>
				{loadedPosts.map(post => (
					<ArticleItem key={post.id} {...post} />
				))}
			</div>

		</div>
   );
};

const ArticleItem = (props: Post) => {
	const { slug, title, description } = props;

	return (
		<Link className='article-item' to={slug}>
			<h2>{title}</h2>

			<p>{description}</p>
		</Link>

   )
};
