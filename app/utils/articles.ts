import * as BuildingAMonad from './../components/Articles/building-a-monad.mdx';
import * as DebugDrivenDevelopment from './../components/Articles/debug-driven-development.mdx';
import * as EngineersSchrodingersCat from './../components/Articles/the-engineers-schrodingers-cat.mdx';
import * as MonadsAreMonoidsInTheCategoryOfEndofunctors from './../components/Articles/monads-are-monoids-in-the-category-of-endofunctors.mdx';
import * as ThePartyMathTrick from './../components/Articles/the-party-math-trick.mdx';
import * as LogAndContinue from './../components/Articles/log-and-continue.mdx';

export type Post = {
	description: string;
	slug: string;
	title: string;
};

export type MDX = {
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

// ts-ignore
export const getArticles: () => MDX[] = () => {

	return [
		LogAndContinue,
		DebugDrivenDevelopment,
		ThePartyMathTrick,
		BuildingAMonad,
		MonadsAreMonoidsInTheCategoryOfEndofunctors,
		EngineersSchrodingersCat
	];
};

export const getPostMetadata = (mod: MDX): Post => {
	return {
		...mod.attributes.meta,
	};
};

export const getArticleData = () => {
	const mdxArticles = getArticles();
	const articleData = mdxArticles.map((x) => getPostMetadata(x));

	return articleData;
};

export const getPosts = () => {

	return getArticles().map((x) => getPostMetadata(x));

};

const getArticleSlug = (x: Post) => x.slug;

export const getPost = (slug: string | undefined): undefined | MDX => {
	if (!slug) {
		return undefined;
	}

	const articleMap = getArticleMap();

	const article = articleMap[slug]

	return article;
};

export const getArticleMap = () => {
	return getArticles().reduce((acc, curr) => {
		return {
			...acc,
			[getArticleSlug(getPostMetadata(curr))]: curr
		};
	}, {} as Record<string, MDX | undefined>);
};

