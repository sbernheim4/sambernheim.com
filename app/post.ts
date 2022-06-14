import * as BuildingAMonad from './components/Articles/building-a-monad.mdx';
import * as DebugDrivenDevelopment from './components/Articles/debug-driven-development.mdx';
import * as EngineersSchrodingersCat from './components/Articles/the-engineers-schrodingers-cat.mdx';
import * as MonadsAreMonoidsInTheCategoryOfEndofunctors from './components/Articles/monads-are-monoids-in-the-category-of-endofunctors.mdx';
import * as ThePartyMathTrick from './components/Articles/the-party-math-trick.mdx';

export type Post = {
	description: string;
	slug: string;
	title: string;
};

type MDX = {
	attributes: {
		meta: Post;
		headers: Headers;
	};
	default: () => JSX.Element;
	filename: string;
	headers: Headers
	links: Record<string, string>;
	meta: Post
};

const mdxArticles = [
	DebugDrivenDevelopment,
	ThePartyMathTrick,
	BuildingAMonad,
	MonadsAreMonoidsInTheCategoryOfEndofunctors,
	EngineersSchrodingersCat
] as MDX[];

export const getPostMetadata = (mod: MDX): Post => {
	return {
		...mod.attributes.meta,
	};
};

const getArticleSlug = (x: Post) => x.slug;

const articleData = mdxArticles.map((x) => getPostMetadata(x));

export const articleMap = mdxArticles.reduce((acc, curr) => {
	return {
		...acc,
		[getArticleSlug(getPostMetadata(curr))]: curr
	};
}, {} as Record<string, MDX | undefined>);

export const getPosts = (): Post[] => {
	return articleData;
};

export const getPost = (slug: string | undefined): undefined | MDX => {
	if (!slug) {
		return undefined;
	}

	const article = articleMap[slug]

	return article;
};
