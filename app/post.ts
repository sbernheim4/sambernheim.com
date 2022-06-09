import * as BuildingAMonad from './components/Articles/building-a-monad.mdx';
import * as DebugDrivenDevelopment from './components/Articles/debug-driven-development.mdx';
import * as EngineersSchrodingersCat from './components/Articles/the-engineers-schrodingers-cat.mdx';
import * as MonadsAreMonoidsInTheCategoryOfEndofunctors from './components/Articles/monads-are-monoids-in-the-category-of-endofunctors.mdx';
import * as ThePartyMathTrick from './components/Articles/the-party-math-trick.mdx';

export type Post = {
	slug: string;
	title: string;
	description: string;
};

export type PostMarkdownAttributes = {
	title: string;
};

type MDX =
	typeof DebugDrivenDevelopment |
	typeof ThePartyMathTrick |
	typeof BuildingAMonad |
	typeof MonadsAreMonoidsInTheCategoryOfEndofunctors |
	typeof EngineersSchrodingersCat

const mdxArticles = [
	DebugDrivenDevelopment,
	ThePartyMathTrick,
	BuildingAMonad,
	MonadsAreMonoidsInTheCategoryOfEndofunctors,
	EngineersSchrodingersCat
];

const postFromModule = (mod): Post => {
	return {
		...mod.attributes.meta,
	};
};

const getArticleSlug = (x: Post) => x.slug;

const articleData = mdxArticles.map((x) => postFromModule(x));

const articleMap = mdxArticles.reduce((acc, curr) => {
	return {
		...acc,
		[getArticleSlug(postFromModule(curr))]: curr
	};
}, {} as Record<string, MDX>);

export const getPosts = (): Post[] => {
	return articleData;
};

export const getPost = (slug: string | undefined): undefined | MDX => {
	if (!slug) {
		return undefined;
	}

	const article = articleMap[slug] as MDX | undefined;

	return article;
};
